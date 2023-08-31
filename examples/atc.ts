/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import fs from 'fs';
import path from 'path';
import algosdk from '../src';
import { getLocalAlgodClient, getLocalAccounts, compileProgram } from './utils';

async function main() {
  const client = getLocalAlgodClient();
  const accounts = await getLocalAccounts();

  const sender = accounts[0];
  const suggestedParams = await client.getTransactionParams().do();

  const approvalProgram = fs.readFileSync(
    path.join(__dirname, '/calculator/approval.teal'),
    'utf8'
  );
  const clearProgram = fs.readFileSync(
    path.join(__dirname, '/calculator/clear.teal'),
    'utf8'
  );

  const compiledApprovalProgram = await compileProgram(client, approvalProgram);
  const compiledClearProgram = await compileProgram(client, clearProgram);

  const createTxn = algosdk.makeApplicationCreateTxnFromObject({
    sender: sender.addr,
    suggestedParams,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    approvalProgram: compiledApprovalProgram,
    clearProgram: compiledClearProgram,
    numGlobalByteSlices: 0,
    numGlobalInts: 0,
    numLocalByteSlices: 0,
    numLocalInts: 0,
    appArgs: [],
  });

  await client.sendRawTransaction(createTxn.signTxn(sender.privateKey)).do();
  const response = await algosdk.waitForConfirmation(
    client,
    createTxn.txID().toString(),
    3
  );
  const appIndex = response.applicationIndex;

  // example: ATC_CREATE
  const atc = new algosdk.AtomicTransactionComposer();
  // example: ATC_CREATE

  // example: ATC_CONTRACT_INIT
  const abi = JSON.parse(
    fs.readFileSync(path.join(__dirname, '/calculator/contract.json'), 'utf8')
  );
  const contract = new algosdk.ABIContract(abi);
  // example: ATC_CONTRACT_INIT

  // example: ATC_ADD_TRANSACTION
  // construct a transaction
  const paymentTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: sender.addr,
    suggestedParams,
    receiver: sender.addr,
    amount: 1000,
  });

  // add the transaction to the ATC with a signer
  atc.addTransaction({ txn: paymentTxn, signer: sender.signer });
  // example: ATC_ADD_TRANSACTION

  // example: ATC_ADD_METHOD_CALL
  atc.addMethodCall({
    appID: appIndex,
    method: contract.getMethodByName('add'),
    methodArgs: [1, 2],
    sender: sender.addr,
    signer: sender.signer,
    suggestedParams,
  });
  // example: ATC_ADD_METHOD_CALL

  // example: ATC_RESULTS
  const result = await atc.execute(client, 4);
  for (const mr of result.methodResults) {
    console.log(`${mr.returnValue}`);
  }
  // example: ATC_RESULTS

  // made up method
  const boxAccessorMethod = new algosdk.ABIMethod({
    name: 'box_accessor',
    args: [],
    returns: { type: 'void' },
  });

  // example: ATC_BOX_REF
  const boxATC = new algosdk.AtomicTransactionComposer();
  const boxKey = new TextEncoder().encode('key');
  boxATC.addMethodCall({
    appID: appIndex,
    method: boxAccessorMethod,
    methodArgs: [],
    boxes: [
      {
        appIndex: 0,
        name: boxKey,
      },
    ],
    sender: sender.addr,
    signer: sender.signer,
    suggestedParams,
  });
  // example: ATC_BOX_REF
}

main();
