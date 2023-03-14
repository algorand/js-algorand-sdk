/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import { Buffer } from 'buffer';
import { getLocalAlgodClient, getLocalAccounts, compileProgram } from './utils';
import algosdk from '../src';

async function main() {
  const algodClient = getLocalAlgodClient();
  const accounts = await getLocalAccounts();
  const creator = accounts[0];
  const suggestedParams = await algodClient.getTransactionParams().do();

  // example: JSSDK_APP_SOURCE
  // define TEAL source from string or from a file
  const approvalProgram = fs.readFileSync(
    path.join(__dirname, '/contracts/app_approval.teal'),
    'utf8'
  );
  const clearProgram = '#pragma version 8\nint 1\nreturn';

  // compile with helper function
  const compiledApprovalProgram = await compileProgram(
    algodClient,
    approvalProgram
  );
  const compiledClearProgram = await compileProgram(algodClient, clearProgram);
  // example: JSSDK_APP_SOURCE

  // example: JSSDK_APP_SCHEMA
  // define uint64s and byteslices stored in global/local storage
  const numGlobalByteSlices = 1;
  const numGlobalInts = 0;
  const numLocalByteSlices = 0;
  const numLocalInts = 1;
  // example: JSSDK_APP_SCHEMA

  // example: JSSDK_APP_CREATE
  const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
    from: creator.addr,
    approvalProgram: compiledApprovalProgram,
    clearProgram: compiledClearProgram,
    numGlobalByteSlices,
    numGlobalInts,
    numLocalByteSlices,
    numLocalInts,
    suggestedParams,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
  });

  await algodClient
    .sendRawTransaction(appCreateTxn.signTxn(creator.privateKey))
    .do();
  const result = await algosdk.waitForConfirmation(
    algodClient,
    appCreateTxn.txID().toString(),
    3
  );
  const createdApp = result['application-index'];
  console.log(`Created app with index: ${createdApp}`);
  // example: JSSDK_APP_CREATE

  const caller = accounts[1];
  // example: JSSDK_APP_OPTIN
  const appOptInTxn = algosdk.makeApplicationOptInTxnFromObject({
    from: caller.addr,
    appIndex: createdApp,
    suggestedParams,
  });

  await algodClient
    .sendRawTransaction(appOptInTxn.signTxn(caller.privateKey))
    .do();
  await algosdk.waitForConfirmation(
    algodClient,
    appOptInTxn.txID().toString(),
    3
  );
  // example: JSSDK_APP_OPTIN

  // example: JSSDK_APP_NOOP
  const appNoOpTxn = algosdk.makeApplicationNoOpTxnFromObject({
    from: caller.addr,
    appIndex: createdApp,
    suggestedParams,
  });

  await algodClient
    .sendRawTransaction(appNoOpTxn.signTxn(caller.privateKey))
    .do();
  await algosdk.waitForConfirmation(
    algodClient,
    appNoOpTxn.txID().toString(),
    3
  );
  // example: JSSDK_APP_NOOP

  const anotherCaller = accounts[2];

  const anotherAppOptInTxn = algosdk.makeApplicationOptInTxnFromObject({
    from: anotherCaller.addr,
    appIndex: createdApp,
    suggestedParams,
  });

  await algodClient
    .sendRawTransaction(anotherAppOptInTxn.signTxn(anotherCaller.privateKey))
    .do();
  await algosdk.waitForConfirmation(
    algodClient,
    anotherAppOptInTxn.txID().toString(),
    3
  );

  // example: JSSDK_APP_READ_STATE
  const appInfo = await algodClient.getApplicationByID(createdApp).do();
  const globalState = appInfo.params['global-state'][0];
  console.log(`Raw global state - ${JSON.stringify(globalState)}`);

  // decode b64 string key with Buffer
  const globalKey = Buffer.from(globalState.key, 'base64').toString();
  // decode b64 address value with encodeAddress and Buffer
  const globalValue = algosdk.encodeAddress(
    Buffer.from(globalState.value.bytes, 'base64')
  );

  console.log(`Decoded global state - ${globalKey}: ${globalValue}`);

  const accountAppInfo = await algodClient
    .accountApplicationInformation(caller.addr, createdApp)
    .do();

  const localState = accountAppInfo['app-local-state']['key-value'][0];
  console.log(`Raw local state - ${JSON.stringify(localState)}`);

  // decode b64 string key with Buffer
  const localKey = Buffer.from(localState.key, 'base64').toString();
  // get uint value directly
  const localValue = localState.value.uint;

  console.log(`Decoded local state - ${localKey}: ${localValue}`);
  // example: JSSDK_APP_READ_STATE

  // example: JSSDK_APP_CLOSEOUT
  const appCloseOutTxn = algosdk.makeApplicationCloseOutTxnFromObject({
    from: caller.addr,
    appIndex: createdApp,
    suggestedParams,
  });

  await algodClient
    .sendRawTransaction(appCloseOutTxn.signTxn(caller.privateKey))
    .do();
  await algosdk.waitForConfirmation(
    algodClient,
    appCloseOutTxn.txID().toString(),
    3
  );
  // example: JSSDK_APP_CLOSEOUT

  // example: JSSDK_APP_UPDATE
  const newProgram = fs.readFileSync(
    path.join(__dirname, '/contracts/app_updated_approval.teal'),
    'utf8'
  );
  const compiledNewProgram = await compileProgram(algodClient, newProgram);

  const appUpdateTxn = algosdk.makeApplicationUpdateTxnFromObject({
    from: creator.addr,
    suggestedParams,
    appIndex: createdApp,
    // updates must define both approval and clear programs, even if unchanged
    approvalProgram: compiledNewProgram,
    clearProgram: compiledClearProgram,
  });

  await algodClient
    .sendRawTransaction(appUpdateTxn.signTxn(creator.privateKey))
    .do();
  await algosdk.waitForConfirmation(
    algodClient,
    appUpdateTxn.txID().toString(),
    3
  );
  // example: JSSDK_APP_UPDATE

  // example: JSSDK_APP_CLEAR
  const appClearTxn = algosdk.makeApplicationClearStateTxnFromObject({
    from: anotherCaller.addr,
    suggestedParams,
    appIndex: createdApp,
  });

  await algodClient
    .sendRawTransaction(appClearTxn.signTxn(anotherCaller.privateKey))
    .do();
  await algosdk.waitForConfirmation(
    algodClient,
    appClearTxn.txID().toString(),
    3
  );
  // example: JSSDK_APP_CLEAR

  // example: JSSDK_APP_DELETE
  const appDeleteTxn = algosdk.makeApplicationDeleteTxnFromObject({
    from: creator.addr,
    suggestedParams,
    appIndex: createdApp,
  });

  await algodClient
    .sendRawTransaction(appDeleteTxn.signTxn(creator.privateKey))
    .do();
  await algosdk.waitForConfirmation(
    algodClient,
    appDeleteTxn.txID().toString(),
    3
  );
  // example: JSSDK_APP_DELETE
}

main();
