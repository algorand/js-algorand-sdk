/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import algosdk, { AtomicTransactionComposer } from '../src';
import fs from 'fs';
import { getLocalAlgodClient, getLocalAccounts, compileProgram } from './utils';

async function main() {
  const client = getLocalAlgodClient();
  const accounts = await getLocalAccounts();

  const sender = accounts.pop()!;
  const suggestedParams = await client.getTransactionParams().do();

  const approvalProgram = fs.readFileSync('./contracts/simple_adder.teal', 'utf8');
  const clearProgram = '#pragma version 8\nint 1\nreturn';

  const compiledApprovalProgram = await compileProgram(client, approvalProgram);
  const compiledClearProgram = await compileProgram(client, clearProgram);

  const createTxn = algosdk.makeApplicationCreateTxnFromObject({
    from: sender.addr,
    suggestedParams,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    approvalProgram: compiledApprovalProgram,
    clearProgram: compiledClearProgram,
    numGlobalByteSlices: 0,
    numGlobalInts: 0,
    numLocalByteSlices: 0,
    numLocalInts: 0,
    appArgs: [new Uint8Array(Buffer.from('create', 'utf8'))],
  });

  await client.sendRawTransaction(createTxn.signTxn(sender.privateKey)).do();
  const response = await algosdk.waitForConfirmation(client, createTxn.txID().toString(), 3);
  const appIndex = response['application-index'];

  // example: JSSDK_APP_CALL
  const simpleAddTxn = algosdk.makeApplicationNoOpTxnFromObject({
    from: sender.addr,
    suggestedParams,
    appIndex,
    appArgs: [new Uint8Array(Buffer.from('add', 'utf8')), algosdk.encodeUint64(1), algosdk.encodeUint64(2)],
  });

  await client.sendRawTransaction(simpleAddTxn.signTxn(sender.privateKey)).do();
  const simpleAddResult = await algosdk.waitForConfirmation(
    client,
    simpleAddTxn.txID().toString(),
    3,
  );

  console.log('Result:', algosdk.decodeUint64(simpleAddResult.logs[0], 'bigint'));
  // example: JSSDK_APP_CALL

  // example: JSSDK_DEBUG_DRYRUN_DUMP
  const addTxnForDr = algosdk.makeApplicationNoOpTxnFromObject({
    from: sender.addr,
    suggestedParams,
    appIndex,
    appArgs: [new Uint8Array(Buffer.from('add', 'utf8')), algosdk.encodeUint64(1), algosdk.encodeUint64(2)],
  });

  const signedDrTxn = algosdk.decodeSignedTransaction(addTxnForDr.signTxn(sender.privateKey));

  const dryrunForLogging = await algosdk.createDryrun({
    client,
    txns: [signedDrTxn],
  });

  console.log('Dryrun:', dryrunForLogging.get_obj_for_encoding());
  // example: JSSDK_DEBUG_DRYRUN_DUMP

  //
  const dryrunForResponse = await algosdk.createDryrun({
    client,
    txns: [signedDrTxn],
  });

  const dryrunResponse = await client.dryrun(dryrunForResponse).do();

  console.log('Dryrun Response:', dryrunResponse);
  //

  // example: JSSDK_ATC_CONTRACT_INIT
  const abi = JSON.parse(fs.readFileSync('./contracts/beaker_add_artifacts/contract.json', 'utf8'));
  const contract = new algosdk.ABIContract(abi);
  // example: JSSDK_ATC_CONTRACT_INIT

  const beakerApprovalProgram = fs.readFileSync('./contracts/beaker_add_artifacts/approval.teal', 'utf8');
  const compiledContractApprovalProgram = await compileProgram(client, beakerApprovalProgram);

  // example: JSSDK_ATC_ADD_TRANSACTION
  const createATC = new AtomicTransactionComposer();
  const createContractTxn = algosdk.makeApplicationCreateTxnFromObject({
    from: sender.addr,
    suggestedParams,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    approvalProgram: compiledContractApprovalProgram,
    clearProgram: compiledClearProgram,
    numGlobalByteSlices: 0,
    numGlobalInts: 0,
    numLocalByteSlices: 0,
    numLocalInts: 0,
  });

  createATC.addTransaction({ txn: createContractTxn, signer: sender.signer });

  const createContractResult = await createATC.execute(client, 3);

  const txInfo = await client.pendingTransactionInformation(createContractResult.txIDs[0]).do();
  const contractAppID = txInfo['application-index'];
  // example: JSSDK_ATC_ADD_TRANSACTION

  // example: JSSDK_ATC_ADD_METHOD_CALL
  const methodATC = new AtomicTransactionComposer();

  methodATC.addMethodCall({
    appID: contractAppID,
    method: contract.getMethodByName('add'),
    methodArgs: [1, 2],
    sender: sender.addr,
    signer: sender.signer,
    suggestedParams,
  });

  const methodResult = await methodATC.execute(client, 3);
  console.log('Result:', methodResult.methodResults[0].returnValue);
  // example: JSSDK_ATC_ADD_METHOD_CALL

  // example: JSSDK_ATC_BOX_REF
  const boxATC = new AtomicTransactionComposer();

  const fundTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    suggestedParams,
    from: sender.addr,
    to: algosdk.getApplicationAddress(contractAppID),
    amount: 106900,
  });

  boxATC.addTransaction({ txn: fundTxn, signer: sender.signer });

  const boxKey = new Uint8Array(Buffer.from('Name'));
  boxATC.addMethodCall({
    appID: contractAppID,
    method: contract.getMethodByName('set_name'),
    methodArgs: ['AlgoDev'],
    boxes: [{
      appIndex: 0,
      name: boxKey,
    }],
    sender: sender.addr,
    signer: sender.signer,
    suggestedParams,
  });

  await boxATC.execute(client, 3);

  const boxVal = await client.getApplicationBoxByName(contractAppID, boxKey).do();
  console.log('Name:', Buffer.from(boxVal.value).toString());
  // example: JSSDK_ATC_BOX_REF
}

main();
