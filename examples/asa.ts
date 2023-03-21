/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import algosdk from '../src';
import {
  getLocalAlgodClient,
  getLocalAccounts,
  getLocalIndexerClient,
} from './utils';

async function main() {
  const algodClient = getLocalAlgodClient();
  const accounts = await getLocalAccounts();
  const creator = accounts[0];

  // example: ASSET_CREATE
  const suggestedParams = await algodClient.getTransactionParams().do();
  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: creator.addr,
    suggestedParams,
    defaultFrozen: false,
    unitName: 'rug',
    assetName: 'Really Useful Gift',
    manager: creator.addr,
    reserve: creator.addr,
    freeze: creator.addr,
    clawback: creator.addr,
    assetURL: 'http://path/to/my/asset/details',
    total: 1000,
    decimals: 0,
  });

  const signedTxn = txn.signTxn(creator.privateKey);
  await algodClient.sendRawTransaction(signedTxn).do();
  const result = await algosdk.waitForConfirmation(
    algodClient,
    txn.txID().toString(),
    3
  );

  const assetIndex = result['asset-index'];
  console.log(`Asset ID created: ${assetIndex}`);
  // example: ASSET_CREATE

  // example: ASSET_INFO
  const assetInfo = await algodClient.getAssetByID(assetIndex).do();
  console.log(`Asset Name: ${assetInfo.params.name}`);
  console.log(`Asset Params: ${assetInfo.params}`);
  // example: ASSET_INFO

  await new Promise((f) => setTimeout(f, 1000)); // sleep to ensure indexer is caught up

  // example: INDEXER_LOOKUP_ASSET
  const indexer = getLocalIndexerClient();
  const indexerAssetInfo = await indexer.lookupAssetByID(assetIndex).do();
  console.log('Indexer Asset Info:', indexerAssetInfo);
  // example: INDEXER_LOOKUP_ASSET

  // example: ASSET_CONFIG
  const manager = accounts[1];

  const configTxn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject({
    from: creator.addr,
    manager: manager.addr,
    freeze: manager.addr,
    clawback: manager.addr,
    reserve: undefined,
    suggestedParams,
    assetIndex,
    // don't throw error if freeze, clawback, or manager are empty
    strictEmptyAddressChecking: false,
  });

  const signedConfigTxn = configTxn.signTxn(creator.privateKey);
  await algodClient.sendRawTransaction(signedConfigTxn).do();
  const configResult = await algosdk.waitForConfirmation(
    algodClient,
    txn.txID().toString(),
    3
  );
  console.log(`Result confirmed in round: ${configResult['confirmed-round']}`);
  // example: ASSET_CONFIG

  const receiver = accounts[2];
  // example: ASSET_OPTIN

  // opt-in is simply a 0 amount transfer of the asset to oneself
  const optInTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: receiver.addr,
    to: receiver.addr,
    suggestedParams,
    assetIndex,
    amount: 0,
  });

  const signedOptInTxn = optInTxn.signTxn(receiver.privateKey);
  await algodClient.sendRawTransaction(signedOptInTxn).do();
  await algosdk.waitForConfirmation(algodClient, optInTxn.txID().toString(), 3);
  // example: ASSET_OPTIN

  // example: ASSET_XFER
  const xferTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: creator.addr,
    to: receiver.addr,
    suggestedParams,
    assetIndex,
    amount: 1,
  });

  const signedXferTxn = xferTxn.signTxn(creator.privateKey);
  await algodClient.sendRawTransaction(signedXferTxn).do();
  await algosdk.waitForConfirmation(algodClient, xferTxn.txID().toString(), 3);
  // example: ASSET_XFER

  // example: ASSET_FREEZE
  const freezeTxn = algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject({
    from: manager.addr,
    suggestedParams,
    assetIndex,
    // freezeState: false would unfreeze the account's asset holding
    freezeState: true,
    // freezeTarget is the account that is being frozen or unfrozen
    freezeTarget: receiver.addr,
  });

  const signedFreezeTxn = freezeTxn.signTxn(manager.privateKey);
  await algodClient.sendRawTransaction(signedFreezeTxn).do();
  await algosdk.waitForConfirmation(
    algodClient,
    freezeTxn.txID().toString(),
    3
  );
  // example: ASSET_FREEZE

  // example: ASSET_CLAWBACK
  const clawbackTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(
    {
      from: manager.addr,
      to: creator.addr,
      // revocationTarget is the account that is being clawed back from
      revocationTarget: receiver.addr,
      suggestedParams,
      assetIndex,
      amount: 1,
    }
  );

  const signedClawbackTxn = clawbackTxn.signTxn(manager.privateKey);
  await algodClient.sendRawTransaction(signedClawbackTxn).do();
  await algosdk.waitForConfirmation(
    algodClient,
    clawbackTxn.txID().toString(),
    3
  );
  // example: ASSET_CLAWBACK

  // example: ASSET_DELETE
  const deleteTxn = algosdk.makeAssetDestroyTxnWithSuggestedParamsFromObject({
    from: manager.addr,
    suggestedParams,
    assetIndex,
  });

  const signedDeleteTxn = deleteTxn.signTxn(manager.privateKey);
  await algodClient.sendRawTransaction(signedDeleteTxn).do();
  await algosdk.waitForConfirmation(
    algodClient,
    deleteTxn.txID().toString(),
    3
  );
  // example: ASSET_DELETE
}

main();
