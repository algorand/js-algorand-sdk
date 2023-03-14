/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import algosdk from '../src';
import { getLocalAlgodClient, getLocalAccounts, getLocalIndexerClient } from './utils';

async function main() {
  const algodClient = getLocalAlgodClient();
  const accounts = await getLocalAccounts();

  console.log('JSSDK_ASSET_CREATE');
  // example: JSSDK_ASSET_CREATE
  const creator = accounts.pop()!;

  const suggestedParams = await algodClient.getTransactionParams().do();

  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: creator.addr,
    suggestedParams,
    defaultFrozen: false,
    decimals: 0,
    total: 1,
    unitName: 'LATINUM',
    assetName: 'latinum',
    assetURL: 'http://someurl', // can be HTTP or IPFS
    assetMetadataHash: '16efaa3924a6fd9d3a4824799a4ac65d',
    manager: creator.addr,
    reserve: creator.addr,
    freeze: creator.addr,
    clawback: creator.addr,
  });

  const signedTxn = txn.signTxn(creator.privateKey);
  await algodClient.sendRawTransaction(signedTxn).do();
  const result = await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 3);

  const assetIndex = result['asset-index'];

  console.log(`Created asset ${assetIndex} in transaction ${txn.txID().toString()} confirmed in round ${result['confirmed-round']}`);
  // example: JSSDK_ASSET_CREATE

  console.log('JSSDK_ASSET_INFO');
  // example: JSSDK_ASSET_INFO
  const accountInfo = await algodClient.accountInformation(creator.addr).do();
  console.log('Account Info:', accountInfo);

  const mostRecentAsset = accountInfo['created-assets'].at(-1).index;
  const assetInfo = await algodClient.getAssetByID(mostRecentAsset).do();
  console.log('Asset Info:', assetInfo);
  // example: JSSDK_ASSET_INFO

  await new Promise((f) => setTimeout(f, 1000)); // sleep to ensure indexer is caught up

  // example: JSSDK_INDEXER_LOOKUP_ASSET
  const indexer = getLocalIndexerClient();
  const indexerAssetInfo = await indexer.lookupAssetByID(assetIndex).do();
  console.log('Indexer Asset Info:', indexerAssetInfo);
  // example: JSSDK_INDEXER_LOOKUP_ASSET

  console.log('JSSDK_ASSET_CONFIG');
  // example: JSSDK_ASSET_CONFIG
  const manager = accounts.pop()!;

  const configTxn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject({
    from: creator.addr,
    manager: manager.addr,
    freeze: manager.addr,
    clawback: manager.addr,
    suggestedParams,
    assetIndex,
    // don't throw error if freeze, clawback, or manager are empty
    strictEmptyAddressChecking: false,
  });

  const signedConfigTxn = configTxn.signTxn(creator.privateKey);
  await algodClient.sendRawTransaction(signedConfigTxn).do();
  await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 3);

  await new Promise((f) => setTimeout(f, 1000)); // sleep to ensure indexer is caught up

  const configAssetInfo = await indexer.lookupAssetByID(assetIndex).do();
  console.log('Asset Info:', configAssetInfo);
  // example: JSSDK_ASSET_CONFIG

  console.log('JSSDK_ASSET_OPTIN');
  // example: JSSDK_ASSET_OPTIN
  const receiver = accounts.pop()!;

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
  // example: JSSDK_ASSET_OPTIN

  console.log('JSSDK_ASSET_XFER');
  // example: JSSDK_ASSET_XFER
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
  // example: JSSDK_ASSET_XFER

  console.log('JSSDK_ASSET_FREEZE');
  // example: JSSDK_ASSET_FREEZE
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
  await algosdk.waitForConfirmation(algodClient, freezeTxn.txID().toString(), 3);
  // example: JSSDK_ASSET_FREEZE

  console.log('JSSDK_ASSET_CLAWBACK');
  // example: JSSDK_ASSET_CLAWBACK
  const clawbackTxn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: manager.addr,
    to: creator.addr,
    // revocationTarget is the account that is being clawed back from
    revocationTarget: receiver.addr,
    suggestedParams,
    assetIndex,
    amount: 1,
  });

  const signedClawbackTxn = clawbackTxn.signTxn(manager.privateKey);
  await algodClient.sendRawTransaction(signedClawbackTxn).do();
  await algosdk.waitForConfirmation(algodClient, clawbackTxn.txID().toString(), 3);
  // example: JSSDK_ASSET_CLAWBACK

  console.log('JSSDK_ASSET_DELETE');
  // example: JSSDK_ASSET_DELETE
  const deleteTxn = algosdk.makeAssetDestroyTxnWithSuggestedParamsFromObject({
    from: manager.addr,
    suggestedParams,
    assetIndex,
  });

  const signedDeleteTxn = deleteTxn.signTxn(manager.privateKey);
  await algodClient.sendRawTransaction(signedDeleteTxn).do();
  await algosdk.waitForConfirmation(algodClient, deleteTxn.txID().toString(), 3);
  // example: JSSDK_ASSET_DELETE
}

main();
