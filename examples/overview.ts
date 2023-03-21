import { Buffer } from 'buffer';
import algosdk from '../src';
import { getLocalAccounts } from './utils';

async function main() {
  const accts = await getLocalAccounts();
  const acct = accts[0];
  const acct2 = accts[1];

  // example: ALGOD_CREATE_CLIENT
  const algodToken = 'a'.repeat(64);
  const algodServer = 'http://localhost';
  const algodPort = 4001;

  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  // example: ALGOD_CREATE_CLIENT

  // example: TRANSACTION_PAYMENT_CREATE
  const suggestedParams = await algodClient.getTransactionParams().do();
  const ptxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: acct.addr,
    suggestedParams,
    to: acct2.addr,
    amount: 10000,
    note: new Uint8Array(Buffer.from('hello world')),
  });
  // example: TRANSACTION_PAYMENT_CREATE

  // example: TRANSACTION_PAYMENT_SIGN
  const signedTxn = ptxn.signTxn(acct.privateKey);
  // example: TRANSACTION_PAYMENT_SIGN

  // example: TRANSACTION_PAYMENT_SUBMIT
  const { txID } = await algodClient.sendRawTransaction(signedTxn).do();
  const result = await algosdk.waitForConfirmation(algodClient, txID, 4);
  console.log(`Transaction Information: ${result}`);
  console.log(`Decoded Node: ${Buffer.from(result.note, 'base64')}`);
  // example: TRANSACTION_PAYMENT_SUBMIT

  // example: ALGOD_FETCH_ACCOUNT_INFO
  const acctInfo = await algodClient.accountInformation(acct.addr).do();
  console.log(`Account balance: ${acctInfo.amount} microAlgos`);
  // example: ALGOD_FETCH_ACCOUNT_INFO
}
main();
