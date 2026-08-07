/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */

// Tested with the following sandbox config
// https://github.com/joe-p/sandbox/blob/b825ae5573ded27f056462fd13b93f4910d6406e/config.pq

// eslint-disable-next-line import/no-extraneous-dependencies
import { falcon1024 } from 'falcon-1024';
import assert from 'assert';
import algosdk, {
  LogicSigAccount,
  makePaymentTxnWithSuggestedParamsFromObject,
  FALCON_1024_SCHEME,
  SignedTransaction,
  type Falcon1024SigningKey,
} from '../src';
import { getLocalAlgodClient, getLocalAccounts } from './utils';
import { pq25WordMnemonicToSeed } from '../src/mnemonic/mnemonic';

async function main() {
  const { generateKey, signCompressed, verifyCompressed } = falcon1024;
  const client = getLocalAlgodClient();
  const accounts = await getLocalAccounts();
  const dispenser = accounts[0];

  const mnemonic = `${'abandon '.repeat(24)}invest`;

  const { publicKey, privateKey } = generateKey(
    pq25WordMnemonicToSeed(mnemonic, FALCON_1024_SCHEME)
  );

  // Wrap the private key in the "raw signer" abstraction the SDK expects: a
  // function that produces a detached Falcon signature over arbitrary bytes.
  const falconSigningKey: Falcon1024SigningKey = {
    falcon1024PublicKey: publicKey,
    falcon1024Signer: async (bytesToSign: Uint8Array) =>
      signCompressed(privateKey, bytesToSign),
  };

  // Derive the post-quantum address and a TransactionSigner from the keypair.
  const {
    address: falconAddr,
    txnSigner: falconTxnSigner,
    delegatedLsigSigner: falconLsigSigner,
  } = algosdk.addressWithSignersFromRawFalcon1024Signer(falconSigningKey);

  // Fund the new Falcon address so it can cover its min balance + fees.
  const suggestedParams = await client.getTransactionParams().do();
  const fundTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: dispenser.addr,
    receiver: falconAddr,
    amount: 106_000,
    suggestedParams,
  });
  await client.sendRawTransaction(fundTxn.signTxn(dispenser.privateKey)).do();
  await algosdk.waitForConfirmation(client, fundTxn.txID(), 3);

  const funded = await client.accountInformation(falconAddr).do();
  console.log('Funded balance (microAlgos):', funded.amount);

  // Send a 0-amount payment FROM the Falcon address, signed with the Falcon
  // signer, using the AtomicTransactionComposer to gather and submit it.
  const zeroPayTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: falconAddr,
    receiver: falconAddr,
    amount: 0,
    suggestedParams: { ...suggestedParams, flatFee: true, fee: 3000 },
  });

  const atc = new algosdk.AtomicTransactionComposer();
  atc.addTransaction({ txn: zeroPayTxn, signer: falconTxnSigner });
  const [stxn] = await atc.gatherSignatures();
  const falconSig = algosdk.decodeMsgpack(stxn, SignedTransaction).pqsig!.sig!;
  const verifyResult = verifyCompressed(
    publicKey,
    falconSig,
    new Uint8Array(zeroPayTxn.bytesToSign())
  );

  console.log('verify result', verifyResult);
  const result = await atc.execute(client, 4);

  console.log(
    'Falcon-signed 0-payment confirmed in round',
    result.confirmedRound,
    'txid',
    result.txIDs[0]
  );
  assert.ok(result.confirmedRound > 0, 'expected the transaction to confirm');

  const lsigTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: falconAddr,
    receiver: falconAddr,
    amount: 0,
    note: new Uint8Array([1]),
    suggestedParams: { ...suggestedParams, flatFee: true, fee: 3000 },
  });

  const teal = '#pragma version 12\nint 1';
  const compiled = algosdk.base64ToBytes(
    (await client.compile(teal).do()).result
  );

  const lsig = new LogicSigAccount(compiled);
  await lsig.signWithSigner(falconLsigSigner);

  const delegatedSigner = algosdk.makeLogicSigAccountTransactionSigner(lsig);
  const lsigAtc = new algosdk.AtomicTransactionComposer();
  lsigAtc.addTransaction({ txn: lsigTxn, signer: delegatedSigner });

  const lsigResult = await lsigAtc.execute(client, 3);

  console.log(
    'Falcon-signed delegated lsig 0-payment confirmed in round',
    lsigResult.confirmedRound,
    'txid',
    lsigResult.txIDs[0]
  );

  const ed25519Acct = algosdk.mnemonicToSecretKey(mnemonic);

  const edFund = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: dispenser.addr,
    receiver: ed25519Acct.addr,
    amount: 107_000,
    suggestedParams,
  });
  await client.sendRawTransaction(edFund.signTxn(dispenser.privateKey)).do();
  await algosdk.waitForConfirmation(client, edFund.txID(), 3);

  console.log('ed funded');

  if (
    (await client.accountInformation(ed25519Acct.addr).do()).authAddr ===
    undefined
  ) {
    const rekeyTxn = makePaymentTxnWithSuggestedParamsFromObject({
      suggestedParams,
      sender: ed25519Acct.addr,
      receiver: ed25519Acct.addr,
      amount: 0,
      rekeyTo: falconAddr,
    });

    await client.sendRawTransaction(rekeyTxn.signTxn(ed25519Acct.sk)).do();
    await algosdk.waitForConfirmation(client, rekeyTxn.txID(), 3);
  }

  console.log(`Rekeyed ${ed25519Acct.addr} to ${falconAddr}`);

  // Payment from rekeyed
  const rekeyedPay = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: ed25519Acct.addr,
    receiver: falconAddr,
    amount: 0,
    note: new TextEncoder().encode('rekeyed pay'),
    suggestedParams: { ...suggestedParams, flatFee: true, fee: 3000 },
  });

  const rekeyedAtc = new algosdk.AtomicTransactionComposer();
  rekeyedAtc.addTransaction({ txn: rekeyedPay, signer: falconTxnSigner });

  await rekeyedAtc.execute(client, 3);

  console.log(
    `Sent a payment from ${rekeyedPay.sender} by signing with ${falconAddr}`
  );

  // Payment from rekeyed delegated lsig
  const rekeyedDlsigPay = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: ed25519Acct.addr,
    receiver: falconAddr,
    amount: 0,
    note: new TextEncoder().encode('rekeyed dlsig pay'),
    suggestedParams: { ...suggestedParams, flatFee: true, fee: 3000 },
  });

  const rekeyedDlsigAtc = new algosdk.AtomicTransactionComposer();
  // The delegating account of `lsig` is the Falcon address, which is now the
  // auth address of the rekeyed ed25519 account, so the delegated lsig signer
  // can authorize transactions sent from it.
  rekeyedDlsigAtc.addTransaction({
    txn: rekeyedDlsigPay,
    signer: delegatedSigner,
  });
  await rekeyedDlsigAtc.execute(client, 3);
  console.log(
    `Sent a payment from ${rekeyedDlsigPay.sender} by signing an lsig with ${falconAddr}`
  );
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e?.response?.text ?? e?.message);
    process.exit(1);
  });
