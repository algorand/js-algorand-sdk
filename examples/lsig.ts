/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import algosdk from '../src';
import { getLocalAccounts, getLocalAlgodClient } from './utils';

async function main() {
  const client = getLocalAlgodClient();
  const accounts = await getLocalAccounts();
  const funder = accounts[0];
  const suggestedParams = await client.getTransactionParams().do();

  // example: LSIG_COMPILE
  const smartSigSource = '#pragma version 8\nint 1\nreturn'; // approve everything
  const result = await client.compile(smartSigSource).do();

  // Hash is equivalent to the contract address
  console.log('Hash: ', result.hash);
  console.log('B64: ', result.result);
  const b64program = result.result;
  // example: LSIG_COMPILE

  // example: LSIG_INIT
  let smartSig = new algosdk.LogicSig(algosdk.base64ToBytes(b64program));
  // example: LSIG_INIT

  // example: LSIG_PASS_ARGS
  const args = [algosdk.coerceToBytes('This is an argument!')];
  smartSig = new algosdk.LogicSig(algosdk.base64ToBytes(b64program), args);
  // example: LSIG_PASS_ARGS

  const fundSmartSigTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: funder.addr,
    receiver: smartSig.address(),
    amount: 1e6,
    suggestedParams,
  });

  await client
    .sendRawTransaction(fundSmartSigTxn.signTxn(funder.privateKey))
    .do();
  await algosdk.waitForConfirmation(client, fundSmartSigTxn.txID(), 3);

  // example: LSIG_SIGN_FULL
  const smartSigTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: smartSig.address(),
    receiver: funder.addr,
    amount: 0.1e6,
    suggestedParams,
  });

  const signedSmartSigTxn = algosdk.signLogicSigTransactionObject(
    smartSigTxn,
    smartSig
  );

  await client.sendRawTransaction(signedSmartSigTxn.blob).do();
  await algosdk.waitForConfirmation(client, signedSmartSigTxn.txID, 3);
  // example: LSIG_SIGN_FULL

  // example: LSIG_DELEGATE_FULL
  const userAccount = accounts[1];

  // sign sig with userAccount so the program can send transactions from userAccount
  smartSig.sign(userAccount.privateKey);

  const delegatedTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: userAccount.addr,
    receiver: funder.addr,
    amount: 0.1e6,
    suggestedParams,
  });

  // use signLogicSigTransactionObject instead of the typical Transaction.signTxn function
  const signedDelegatedTxn = algosdk.signLogicSigTransactionObject(
    delegatedTxn,
    smartSig
  );

  await client.sendRawTransaction(signedDelegatedTxn.blob).do();
  await algosdk.waitForConfirmation(client, signedDelegatedTxn.txID, 3);
  // example: LSIG_DELEGATE_FULL
}
main();
