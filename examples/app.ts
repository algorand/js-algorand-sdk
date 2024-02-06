/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
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
  const approvalCompileResp = await algodClient.compile(approvalProgram).do();

  const compiledApprovalProgram: Uint8Array = algosdk.base64ToBytes(
    approvalCompileResp.result
  );

  const clearCompileResp = await algodClient.compile(clearProgram).do();

  const compiledClearProgram: Uint8Array = algosdk.base64ToBytes(
    clearCompileResp.result
  );
  // example: APP_COMPILE

  // example: APP_SCHEMA
  // define uint64s and byteslices stored in global/local storage
  const numGlobalByteSlices = 1;
  const numGlobalInts = 1;
  const numLocalByteSlices = 1;
  const numLocalInts = 1;
  // example: APP_SCHEMA

  // example: APP_CREATE
  const appCreateTxn = algosdk.makeApplicationCreateTxnFromObject({
    sender: creator.addr,
    approvalProgram: new Uint8Array(compiledApprovalProgram),
    clearProgram: new Uint8Array(compiledClearProgram),
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
    appCreateTxn.txID(),
    3
  );
  // Grab app id from confirmed transaction result
  const appId = Number(result.applicationIndex);
  console.log(`Created app with index: ${appId}`);
  // example: APP_CREATE

  const caller = accounts[1];

  // example: APP_OPTIN
  const appOptInTxn = algosdk.makeApplicationOptInTxnFromObject({
    sender: caller.addr,
    appIndex: appId,
    suggestedParams,
  });

  await algodClient
    .sendRawTransaction(appOptInTxn.signTxn(caller.privateKey))
    .do();
  await algosdk.waitForConfirmation(algodClient, appOptInTxn.txID(), 3);
  // example: APP_OPTIN

  // example: APP_NOOP
  const appNoOpTxn = algosdk.makeApplicationNoOpTxnFromObject({
    sender: caller.addr,
    appIndex: appId,
    suggestedParams,
  });

  await algodClient
    .sendRawTransaction(appNoOpTxn.signTxn(caller.privateKey))
    .do();
  await algosdk.waitForConfirmation(algodClient, appNoOpTxn.txID(), 3);
  // example: APP_NOOP

  const anotherCaller = accounts[2];

  const anotherAppOptInTxn = algosdk.makeApplicationOptInTxnFromObject({
    sender: anotherCaller.addr,
    appIndex: appId,
    suggestedParams,
  });

  await algodClient
    .sendRawTransaction(anotherAppOptInTxn.signTxn(anotherCaller.privateKey))
    .do();
  await algosdk.waitForConfirmation(algodClient, anotherAppOptInTxn.txID(), 3);

  // example: APP_CALL
  const now = new Date().toString();
  const simpleAddTxn = algosdk.makeApplicationNoOpTxnFromObject({
    sender: caller.addr,
    suggestedParams,
    appIndex: appId,
    appArgs: [new TextEncoder().encode(now)],
  });

  await algodClient
    .sendRawTransaction(simpleAddTxn.signTxn(caller.privateKey))
    .do();
  await algosdk.waitForConfirmation(algodClient, simpleAddTxn.txID(), 3);
  // example: APP_CALL

  // example: APP_READ_STATE
  const appInfo = await algodClient.getApplicationByID(appId).do();
  const globalState = appInfo.params.globalState[0];
  console.log(`Raw global state - ${JSON.stringify(globalState)}`);

  // decode b64 string key with Buffer
  const globalKey = algosdk.base64ToString(globalState.key);
  // show global value
  const globalValue = globalState.value.bytes;

  console.log(`Decoded global state - ${globalKey}: ${globalValue}`);

  const accountAppInfo = await algodClient
    .accountApplicationInformation(caller.addr.toString(), appId)
    .do();

  const localState = accountAppInfo.appLocalState.keyValue[0];
  console.log(`Raw local state - ${JSON.stringify(localState)}`);

  // decode b64 string key with Buffer
  const localKey = algosdk.base64ToString(localState.key);
  // get uint value directly
  const localValue = localState.value.uint;

  console.log(`Decoded local state - ${localKey}: ${localValue}`);
  // example: APP_READ_STATE

  // example: APP_CLOSEOUT
  const appCloseOutTxn = algosdk.makeApplicationCloseOutTxnFromObject({
    sender: caller.addr,
    appIndex: appId,
    suggestedParams,
  });

  await algodClient
    .sendRawTransaction(appCloseOutTxn.signTxn(caller.privateKey))
    .do();
  await algosdk.waitForConfirmation(algodClient, appCloseOutTxn.txID(), 3);
  // example: APP_CLOSEOUT

  // example: APP_UPDATE
  const newProgram = fs.readFileSync(
    path.join(__dirname, '/application/approval_refactored.teal'),
    'utf8'
  );
  const compiledNewProgram = await compileProgram(algodClient, newProgram);

  const appUpdateTxn = algosdk.makeApplicationUpdateTxnFromObject({
    sender: creator.addr,
    suggestedParams,
    appIndex: appId,
    // updates must define both approval and clear programs, even if unchanged
    approvalProgram: new Uint8Array(compiledNewProgram),
    clearProgram: new Uint8Array(compiledClearProgram),
  });

  await algodClient
    .sendRawTransaction(appUpdateTxn.signTxn(creator.privateKey))
    .do();
  await algosdk.waitForConfirmation(algodClient, appUpdateTxn.txID(), 3);
  // example: APP_UPDATE

  // example: APP_CLEAR
  const appClearTxn = algosdk.makeApplicationClearStateTxnFromObject({
    sender: anotherCaller.addr,
    suggestedParams,
    appIndex: appId,
  });

  await algodClient
    .sendRawTransaction(appClearTxn.signTxn(anotherCaller.privateKey))
    .do();
  await algosdk.waitForConfirmation(algodClient, appClearTxn.txID(), 3);
  // example: APP_CLEAR

  // example: APP_DELETE
  const appDeleteTxn = algosdk.makeApplicationDeleteTxnFromObject({
    sender: creator.addr,
    suggestedParams,
    appIndex: appId,
  });

  await algodClient
    .sendRawTransaction(appDeleteTxn.signTxn(creator.privateKey))
    .do();
  await algosdk.waitForConfirmation(algodClient, appDeleteTxn.txID(), 3);
  // example: APP_DELETE
}

main();
