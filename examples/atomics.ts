/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import algosdk from '../src';
// eslint-disable-next-line import/extensions
import { getLocalAlgodClient, getLocalAccounts } from './utils';

async function main() {
  const client = getLocalAlgodClient();
  const accounts = await getLocalAccounts();

  // example: ATOMIC_CREATE_TXNS
  const suggestedParams = await client.getTransactionParams().do();

  const alice = accounts[0];
  const bob = accounts[1];
  const carol = accounts[2];

  const alicesTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: alice.addr,
    to: carol.addr,
    amount: 1e6,
    suggestedParams,
  });

  const bobsTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: bob.addr,
    to: alice.addr,
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
  const alicesSignedTxn = txnGroup[0].signTxn(alice.privateKey);
  const bobsSignedTxn = txnGroup[1].signTxn(bob.privateKey);
  // example: ATOMIC_GROUP_SIGN

  // example: ATOMIC_GROUP_ASSEMBLE
  const signedTxns = [alicesSignedTxn, bobsSignedTxn];
  // example: ATOMIC_GROUP_ASSEMBLE

  // example: ATOMIC_GROUP_SEND
  await client.sendRawTransaction(signedTxns).do();
  await algosdk.waitForConfirmation(client, alicesTxn.txID().toString(), 3);
  // example: ATOMIC_GROUP_SEND

  // example: CONST_MIN_FEE
  const minFee = algosdk.ALGORAND_MIN_TX_FEE;
  // example: CONST_MIN_FEE

  // example: TRANSACTION_FEE_OVERRIDE
  const alicesTxnWithDoubleFee = algosdk.makePaymentTxnWithSuggestedParamsFromObject(
    {
      from: alice.addr,
      to: carol.addr,
      amount: 1e6,
      // set the fee to 0 so alice doesn't need to pay a fee
      // use flatFee to ensure the given fee is used
      suggestedParams: { ...suggestedParams, fee: 0, flatFee: true },
    }
  );

  const bobsTxnWithZeroFee = algosdk.makePaymentTxnWithSuggestedParamsFromObject(
    {
      from: bob.addr,
      to: alice.addr,
      amount: 1e6,
      // set the fee to "minFee * 2" so Bob covers the fee for his transaction AND Alice's transaction
      // use flatFee to ensure the given fee is used
      suggestedParams: { ...suggestedParams, fee: minFee * 2, flatFee: true },
    }
  );

  const feeTxnArray = [alicesTxnWithDoubleFee, bobsTxnWithZeroFee];
  const feeTxnGroup = algosdk.assignGroupID(feeTxnArray);
  const signedFeeTxns = [
    feeTxnGroup[0].signTxn(alice.privateKey),
    feeTxnGroup[1].signTxn(bob.privateKey),
  ];

  await client.sendRawTransaction(signedFeeTxns).do();
  await algosdk.waitForConfirmation(
    client,
    alicesTxnWithDoubleFee.txID().toString(),
    3
  );
  // example: TRANSACTION_FEE_OVERRIDE
}

main();
