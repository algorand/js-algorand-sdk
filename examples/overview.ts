import algosdk from '../src';
import { getLocalAccounts, getLocalAlgodClient } from './utils';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getAlgodClient() {
  // example: ALGOD_CREATE_CLIENT
  const algodToken = 'a'.repeat(64);
  const algodServer = 'http://localhost';
  const algodPort = 4001;

  const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
  // example: ALGOD_CREATE_CLIENT
  console.log(algodClient);
}

async function main() {
  const algodClient = getLocalAlgodClient();
  const accts = await getLocalAccounts();
  const acct = accts[0];
  const acct2 = accts[1];

  // example: TRANSACTION_PAYMENT_CREATE
  const suggestedParams = await algodClient.getTransactionParams().do();
  const ptxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: acct.addr,
    suggestedParams,
    receiver: acct2.addr,
    amount: 10000,
    note: algosdk.coerceToBytes('hello world'),
  });
  // example: TRANSACTION_PAYMENT_CREATE

  // example: TRANSACTION_PAYMENT_SIGN
  const signedTxn = ptxn.signTxn(acct.privateKey);
  // example: TRANSACTION_PAYMENT_SIGN

  // example: TRANSACTION_PAYMENT_SUBMIT
  const { txid } = await algodClient.sendRawTransaction(signedTxn).do();
  const result = await algosdk.waitForConfirmation(algodClient, txid, 4);
  console.log(result);
  console.log(`Transaction Information: ${algosdk.stringifyJSON(result.txn)}`);
  console.log(
    `Decoded Note: ${new TextDecoder('utf-8').decode(result.txn.txn.note)}`
  );
  // example: TRANSACTION_PAYMENT_SUBMIT

  // example: ALGOD_FETCH_ACCOUNT_INFO
  const acctInfo = await algodClient.accountInformation(acct.addr).do();
  console.log(`Account balance: ${acctInfo.amount} microAlgos`);
  // example: ALGOD_FETCH_ACCOUNT_INFO
}
main();
