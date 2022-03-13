import AlgodClient from './client/v2/algod/algod';
import {
  Application,
  ApplicationParams,
  ApplicationStateSchema,
  DryrunRequest,
  DryrunSource,
} from './client/v2/algod/models/types';
import { SignedTransaction } from './transaction';
import { TransactionType } from './types/transactions';
import { encodeAddress, getApplicationAddress } from './encoding/address';

const defaultAppId = 1380011588;

// When writing the DryrunRequest object as msgpack the output needs to be the byte arrays not b64 string
interface AppParamsWithPrograms {
  ['approval-program']: string | Uint8Array;
  ['clear-state-program']: string | Uint8Array;
  ['creator']: string;
}

interface AppWithAppParams {
  ['params']: AppParamsWithPrograms;
}

function decodePrograms(ap: AppWithAppParams): AppWithAppParams {
  // eslint-disable-next-line no-param-reassign
  ap.params['approval-program'] = Buffer.from(
    ap.params['approval-program'].toString(),
    'base64'
  );
  // eslint-disable-next-line no-param-reassign
  ap.params['clear-state-program'] = Buffer.from(
    ap.params['clear-state-program'].toString(),
    'base64'
  );

  return ap;
}

/**
 * createDryrun takes an Algod Client (from algod.AlgodV2Client) and an array of Signed Transactions
 * from (transaction.SignedTransaction) and creates a DryrunRequest object with relevant balances
 * @param client - the AlgodClient to make requests against
 * @param txns - the array of SignedTransaction to use for generating the DryrunRequest object
 * @param protocolVersion - the string representing the protocol version to use
 * @param latestTimestamp - the timestamp
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
  const appInfos = [];
  const acctInfos = [];

  const apps: number[] = [];
  const assets: number[] = [];
  const accts: string[] = [];

  for (const t of txns) {
    if (t.txn.type === TransactionType.appl) {
      accts.push(encodeAddress(t.txn.from.publicKey));

      if (t.txn.appAccounts)
        accts.push(...t.txn.appAccounts.map((a) => encodeAddress(a.publicKey)));

      if (t.txn.appForeignApps) apps.push(...t.txn.appForeignApps);

      if (t.txn.appForeignAssets) assets.push(...t.txn.appForeignAssets);

      // Create application,
      if (t.txn.appIndex === undefined) {
        appInfos.push(
          new Application(
            defaultAppId,
            new ApplicationParams({
              creator: encodeAddress(t.txn.from.publicKey),
              approvalProgram: t.txn.appApprovalProgram,
              clearStateProgram: t.txn.appClearProgram,
              localStateSchema: new ApplicationStateSchema(
                t.txn.appLocalInts,
                t.txn.appLocalByteSlices
              ),
              globalStateSchema: new ApplicationStateSchema(
                t.txn.appGlobalInts,
                t.txn.appGlobalByteSlices
              ),
            })
          )
        );
      } else {
        apps.push(t.txn.appIndex);
        accts.push(getApplicationAddress(t.txn.appIndex));
      }
    }
  }

  // Dedupe and add creator to accts array
  const assetPromises = [];
  for (const assetId of [...new Set(assets)]) {
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
  for (const appId of [...new Set(apps)]) {
    appPromises.push(
      client
        .getApplicationByID(appId)
        .do()
        .then((appInfo) => {
          const ai = decodePrograms(appInfo as AppWithAppParams);
          appInfos.push(ai);
          accts.push(ai.params.creator);
        })
    );
  }
  await Promise.all(appPromises);

  const acctPromises = [];
  for (const acct of [...new Set(accts)]) {
    acctPromises.push(
      client
        .accountInformation(acct)
        .do()
        .then((acctInfo) => {
          if ('created-apps' in acctInfo) {
            // eslint-disable-next-line no-param-reassign
            acctInfo['created-apps'] = acctInfo['created-apps'].map((app) =>
              decodePrograms(app)
            );
          }
          acctInfos.push(acctInfo);
        })
    );
  }
  await Promise.all(acctPromises);

  return new DryrunRequest({
    txns: txns.map((st) => ({ ...st, txn: st.txn.get_obj_for_encoding() })),
    accounts: acctInfos,
    apps: appInfos,
    latestTimestamp,
    round,
    protocolVersion,
    sources,
  });
}
