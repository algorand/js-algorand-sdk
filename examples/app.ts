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

  // example: APP_SOURCE
  // define TEAL source from string or from a file
  const approvalProgram = fs.readFileSync(
    path.join(__dirname, '/application/approval.teal'),
    'utf8'
  );
  const clearProgram = fs.readFileSync(
    path.join(__dirname, '/application/clear.teal'),
    'utf8'
  );
  // example: APP_SOURCE

  // example: APP_COMPILE
  const approvalCompileResp = await algodClient
    .compile(Buffer.from(approvalProgram))
    .do();

  const compiledApprovalProgram = new Uint8Array(
    Buffer.from(approvalCompileResp.result, 'base64')
  );

  const clearCompileResp = await algodClient
    .compile(Buffer.from(clearProgram))
    .do();

  const compiledClearProgram = new Uint8Array(
    Buffer.from(clearCompileResp.result, 'base64')
  );
  // example: APP_COMPILE

  // example: APP_SCHEMA
  // define uint64s and byteslices stored in global/local storage
  const numGlobalByteSlices = 1;
  const numGlobalInts = 0;
  const numLocalByteSlices = 0;
  const numLocalInts = 1;
  // example: APP_SCHEMA

  // example: APP_CREATE
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

  // Sign and send
  await algodClient
    .sendRawTransaction(appCreateTxn.signTxn(creator.privateKey))
    .do();
  const result = await algosdk.waitForConfirmation(
    algodClient,
    appCreateTxn.txID().toString(),
    3
  );
  // Grab app id from confirmed transaction result
  const appId = result['application-index'];
  console.log(`Created app with index: ${appId}`);
  // example: APP_CREATE

  const caller = accounts[1];

  // example: APP_OPTIN
  const appOptInTxn = algosdk.makeApplicationOptInTxnFromObject({
    from: caller.addr,
    appIndex: appId,
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
  // example: APP_OPTIN

  // example: APP_NOOP
  const appNoOpTxn = algosdk.makeApplicationNoOpTxnFromObject({
    from: caller.addr,
    appIndex: appId,
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
  // example: APP_NOOP

  const anotherCaller = accounts[2];

  const anotherAppOptInTxn = algosdk.makeApplicationOptInTxnFromObject({
    from: anotherCaller.addr,
    appIndex: appId,
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

  // example: APP_CALL
  const now = new Date().toString();
  const simpleAddTxn = algosdk.makeApplicationNoOpTxnFromObject({
    from: caller.addr,
    suggestedParams,
    appIndex: appId,
    appArgs: [new Uint8Array(Buffer.from(now))],
  });

  await algodClient
    .sendRawTransaction(simpleAddTxn.signTxn(creator.privateKey))
    .do();
  await algosdk.waitForConfirmation(
    algodClient,
    simpleAddTxn.txID().toString(),
    3
  );
  // example: APP_CALL

  // example: APP_READ_STATE
  const appInfo = await algodClient.getApplicationByID(appId).do();
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
    .accountApplicationInformation(caller.addr, appId)
    .do();

  const localState = accountAppInfo['app-local-state']['key-value'][0];
  console.log(`Raw local state - ${JSON.stringify(localState)}`);

  // decode b64 string key with Buffer
  const localKey = Buffer.from(localState.key, 'base64').toString();
  // get uint value directly
  const localValue = localState.value.uint;

  console.log(`Decoded local state - ${localKey}: ${localValue}`);
  // example: APP_READ_STATE

  // example: APP_CLOSEOUT
  const appCloseOutTxn = algosdk.makeApplicationCloseOutTxnFromObject({
    from: caller.addr,
    appIndex: appId,
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
  // example: APP_CLOSEOUT

  // example: APP_UPDATE
  const newProgram = fs.readFileSync(
    path.join(__dirname, '/application/approval_refactored.teal'),
    'utf8'
  );
  const compiledNewProgram = await compileProgram(algodClient, newProgram);

  const appUpdateTxn = algosdk.makeApplicationUpdateTxnFromObject({
    from: creator.addr,
    suggestedParams,
    appIndex: appId,
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
  // example: APP_UPDATE

  // example: APP_CLEAR
  const appClearTxn = algosdk.makeApplicationClearStateTxnFromObject({
    from: anotherCaller.addr,
    suggestedParams,
    appIndex: appId,
  });

  await algodClient
    .sendRawTransaction(appClearTxn.signTxn(anotherCaller.privateKey))
    .do();
  await algosdk.waitForConfirmation(
    algodClient,
    appClearTxn.txID().toString(),
    3
  );
  // example: APP_CLEAR

  // example: APP_DELETE
  const appDeleteTxn = algosdk.makeApplicationDeleteTxnFromObject({
    from: creator.addr,
    suggestedParams,
    appIndex: appId,
  });

  await algodClient
    .sendRawTransaction(appDeleteTxn.signTxn(creator.privateKey))
    .do();
  await algosdk.waitForConfirmation(
    algodClient,
    appDeleteTxn.txID().toString(),
    3
  );
  // example: APP_DELETE
}

main();
