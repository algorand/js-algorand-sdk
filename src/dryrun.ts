import { AlgodClient } from './client/v2/algod/algod.js';
import {
  Account,
  Application,
  ApplicationParams,
  ApplicationStateSchema,
  DryrunRequest,
  DryrunSource,
  DryrunTxnResult,
  DryrunState,
  TealValue,
} from './client/v2/algod/models/types.js';
import { getApplicationAddress } from './encoding/address.js';
import { bytesToHex } from './encoding/binarydata.js';
import { SignedTransaction } from './signedTransaction.js';
import { TransactionType } from './types/transactions/index.js';
import { stringifyJSON } from './utils/utils.js';

const defaultAppId = 1380011588;
const defaultMaxWidth = 30;

/**
 * createDryrun takes an Algod Client (from algod.AlgodV2Client) and an array of Signed Transactions
 * from (transaction.SignedTransaction) and creates a DryrunRequest object with relevant balances
 * @param client - the AlgodClient to make requests against
 * @param txns - the array of SignedTransaction to use for generating the DryrunRequest object
 * @param protocolVersion - the string representing the protocol version to use
 * @param latestTimestamp - the timestamp
 * @param round - the round available to some TEAL scripts. Defaults to the current round on the network.
 * @param sources - TEAL source text that gets uploaded, compiled, and inserted into transactions or application state.
 * @returns the DryrunRequest object constructed from the SignedTransactions passed
 */
export async function createDryrun({
  client,
  txns,
  protocolVersion,
  latestTimestamp,
  round,
  sources,
}: {
  client: AlgodClient;
  txns: SignedTransaction[];
  protocolVersion?: string;
  latestTimestamp?: number | bigint;
  round?: number | bigint;
  sources?: DryrunSource[];
}): Promise<DryrunRequest> {
  const appInfos: Application[] = [];
  const acctInfos: Account[] = [];

  const apps: bigint[] = [];
  const assets: bigint[] = [];
  const accts: string[] = [];

  for (const t of txns) {
    if (t.txn.type === TransactionType.appl) {
      accts.push(t.txn.sender.toString());

      accts.push(...t.txn.applicationCall!.accounts.map((a) => a.toString()));

      apps.push(...t.txn.applicationCall!.foreignApps);
      accts.push(
        ...t.txn
          .applicationCall!.foreignApps.map(getApplicationAddress)
          .map((a) => a.toString())
      );

      assets.push(...t.txn.applicationCall!.foreignAssets);

      // Create application,
      if (t.txn.applicationCall!.appIndex === BigInt(0)) {
        appInfos.push(
          new Application({
            id: defaultAppId,
            params: new ApplicationParams({
              creator: t.txn.sender.toString(),
              approvalProgram: t.txn.applicationCall!.approvalProgram,
              clearStateProgram: t.txn.applicationCall!.clearProgram,
              localStateSchema: new ApplicationStateSchema({
                numUint: t.txn.applicationCall!.numLocalInts,
                numByteSlice: t.txn.applicationCall!.numLocalByteSlices,
              }),
              globalStateSchema: new ApplicationStateSchema({
                numUint: t.txn.applicationCall!.numGlobalInts,
                numByteSlice: t.txn.applicationCall!.numGlobalByteSlices,
              }),
            }),
          })
        );
      } else {
        const { appIndex } = t.txn.applicationCall!;
        apps.push(appIndex);
        accts.push(getApplicationAddress(appIndex).toString());
      }
    }
  }

  // Dedupe and add creator to accts array
  const assetPromises = [];
  for (const assetId of new Set(assets)) {
    assetPromises.push(
      client
        .getAssetByID(assetId)
        .do()
        .then((assetInfo) => {
          accts.push(assetInfo.params.creator);
        })
    );
  }
  // Wait for assets to finish since we append to accts array
  await Promise.all(assetPromises);

  // Dedupe and get app info for all apps
  const appPromises = [];
  for (const appId of new Set(apps)) {
    appPromises.push(
      client
        .getApplicationByID(appId)
        .do()
        .then((appInfo) => {
          appInfos.push(appInfo);
          accts.push(appInfo.params.creator.toString());
        })
    );
  }
  await Promise.all(appPromises);

  const acctPromises = [];
  for (const acct of new Set(accts)) {
    acctPromises.push(
      client
        .accountInformation(acct)
        .do()
        .then((acctInfo) => {
          acctInfos.push(acctInfo);
        })
    );
  }
  await Promise.all(acctPromises);

  return new DryrunRequest({
    txns: txns.slice(),
    accounts: acctInfos,
    apps: appInfos,
    latestTimestamp: latestTimestamp ?? 0,
    round: round ?? 0,
    protocolVersion: protocolVersion ?? '',
    sources: sources ?? [],
  });
}

export interface StackPrinterConfig {
  maxValueWidth: number | undefined;
  topOfStackFirst: boolean | undefined;
}

function truncate(str: string, maxValueWidth: number): string {
  if (str.length > maxValueWidth && maxValueWidth > 0) {
    return `${str.slice(0, maxValueWidth)}...`;
  }
  return str;
}

function scratchToString(
  prevScratch: TealValue[],
  currScratch: TealValue[]
): string {
  if (currScratch.length === 0) return '';

  let newScratchIdx = null;
  for (let idx = 0; idx < currScratch.length; idx++) {
    if (idx > prevScratch.length) {
      newScratchIdx = idx;
      continue;
    }

    if (stringifyJSON(prevScratch[idx]) !== stringifyJSON(currScratch[idx])) {
      newScratchIdx = idx;
    }
  }

  if (newScratchIdx == null) return '';

  const newScratch = currScratch[newScratchIdx];
  if (newScratch.bytes.length > 0) {
    return `${newScratchIdx} = 0x${bytesToHex(newScratch.bytes)}`;
  }
  return `${newScratchIdx} = ${newScratch.uint.toString()}`;
}

function stackToString(
  stack: TealValue[],
  reverse: boolean | undefined
): string {
  const svs = reverse ? stack.reverse() : stack;
  return `[${svs
    .map((sv) => {
      switch (sv.type) {
        case 1:
          return `0x${bytesToHex(sv.bytes)}`;
        case 2:
          return sv.uint.toString();
        default:
          return '';
      }
    })
    .join(', ')}]`;
}

function dryrunTrace(
  trace: DryrunState[],
  disassembly: string[],
  spc: StackPrinterConfig
): string {
  const maxWidth = spc.maxValueWidth || defaultMaxWidth;

  // Create the array of arrays, each sub array contains N columns
  const lines = [['pc#', 'ln#', 'source', 'scratch', 'stack']];
  for (let idx = 0; idx < trace.length; idx++) {
    const { line, error, pc, scratch, stack } = trace[idx];

    const currScratch = scratch !== undefined ? scratch : [];
    const prevScratch =
      idx > 0 && trace[idx - 1].scratch !== undefined
        ? trace[idx - 1].scratch!
        : [];

    const src = !error ? disassembly[line] : `!! ${error} !!`;

    lines.push([
      pc.toString().padEnd(3, ' '),
      line.toString().padEnd(3, ' '),
      truncate(src, maxWidth),
      truncate(scratchToString(prevScratch, currScratch), maxWidth),
      truncate(stackToString(stack, spc.topOfStackFirst), maxWidth),
    ]);
  }

  // Get the max length for each column
  const maxLengths = lines.reduce((prev, curr) => {
    const newVal = new Array(lines[0].length).fill(0);
    for (let idx = 0; idx < prev.length; idx++) {
      newVal[idx] = curr[idx].length > prev[idx] ? curr[idx].length : prev[idx];
    }
    return newVal;
  }, new Array(lines[0].length).fill(0));

  return `${lines
    .map((line) =>
      line
        .map((v, idx) => v.padEnd(maxLengths[idx] + 1, ' '))
        .join('|')
        .trim()
    )
    .join('\n')}\n`;
}

export function dryrunTxnResultAppTrace(
  result: DryrunTxnResult,
  spc?: StackPrinterConfig
): string {
  if (!result.appCallTrace || !result.disassembly) return '';

  let conf = spc;
  if (spc !== undefined) conf = spc;
  else {
    conf = {
      maxValueWidth: defaultMaxWidth,
      topOfStackFirst: false,
    };
  }

  return dryrunTrace(result.appCallTrace, result.disassembly, conf);
}

export function dryrunTxnResultLogicSigTrace(
  result: DryrunTxnResult,
  spc?: StackPrinterConfig
): string {
  if (!result.logicSigTrace || !result.logicSigDisassembly) return '';

  let conf: StackPrinterConfig;
  if (spc !== undefined) conf = spc;
  else {
    conf = {
      maxValueWidth: defaultMaxWidth,
      topOfStackFirst: true,
    };
  }

  return dryrunTrace(result.logicSigTrace, result.logicSigDisassembly, conf);
}
