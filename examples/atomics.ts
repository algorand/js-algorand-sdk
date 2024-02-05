/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import algosdk from '../src';
// eslint-disable-next-line import/extensions
import { getLocalAlgodClient, getLocalAccounts } from './utils';

async function main() {
  const client = getLocalAlgodClient();
  const accounts = await getLocalAccounts();

  const acct1 = accounts[0];
  const acct2 = accounts[1];

  // example: ATOMIC_CREATE_TXNS
  const suggestedParams = await client.getTransactionParams().do();

  const alicesTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: acct1.addr,
    receiver: acct2.addr,
    amount: 1e6,
    suggestedParams,
  });

  const bobsTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: acct2.addr,
    receiver: acct1.addr,
    amount: 1e6,
    suggestedParams,
  });
  // example: ATOMIC_CREATE_TXNS

  // example: ATOMIC_GROUP_TXNS
  const txnArray = [alicesTxn, bobsTxn];
  // assignGroupID returns the same txns with the group ID set
  const txnGroup = algosdk.assignGroupID(txnArray);
  // example: ATOMIC_GROUP_TXNS

  // example: ATOMIC_GROUP_SIGN
  const alicesSignedTxn = txnGroup[0].signTxn(acct1.privateKey);
  const bobsSignedTxn = txnGroup[1].signTxn(acct2.privateKey);
  // example: ATOMIC_GROUP_SIGN

  // example: ATOMIC_GROUP_ASSEMBLE
  const signedTxns = [alicesSignedTxn, bobsSignedTxn];
  // example: ATOMIC_GROUP_ASSEMBLE

  // example: ATOMIC_GROUP_SEND
  await client.sendRawTransaction(signedTxns).do();
  await algosdk.waitForConfirmation(client, alicesTxn.txID(), 3);
  // example: ATOMIC_GROUP_SEND

  // example: CONST_MIN_FEE
  const minFee = algosdk.ALGORAND_MIN_TX_FEE;
  console.log(minFee);
  // example: CONST_MIN_FEE

  // example: TRANSACTION_FEE_OVERRIDE
  const sp = await client.getTransactionParams().do();
  sp.fee = 2 * minFee;
  sp.flatFee = true;
  // example: TRANSACTION_FEE_OVERRIDE

  // example: SP_MIN_FEE
  const params = await client.getTransactionParams().do();
  console.log(params.minFee);
  // example: SP_MIN_FEE
}

main();
