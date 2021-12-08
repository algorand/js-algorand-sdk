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
import { encodeAddress } from './encoding/address';

const defaultAppId = 1380011588;

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
      if (t.txn.appIndex === 0) {
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
          const ai = { ...appInfo };
          ai.params['approval-program'] = Buffer.from(
            appInfo.params['approval-program'],
            'base64'
          );
          ai.params['clear-state-program'] = Buffer.from(
            appInfo.params['clear-state-program'],
            'base64'
          );
          appInfos.push(ai);
        })
    );
  }

  const acctPromises = [];
  for (const acct of [...new Set(accts)]) {
    acctPromises.push(
      client
        .accountInformation(acct)
        .do()
        .then((acctInfo) => {
          acctInfos.push(acctInfo);
        })
    );
  }
  await Promise.all([...appPromises, ...acctPromises]);

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
