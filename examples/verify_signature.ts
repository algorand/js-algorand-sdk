import { Buffer } from 'buffer';
import nacl from 'tweetnacl';
import algosdk from '../src';

function verifySignedTransaction(stxn: algosdk.SignedTransaction): boolean {
  if (stxn.sig === undefined) return false;

  // Get the txn object
  const txnObj = stxn.txn.get_obj_for_encoding();
  if (txnObj === undefined) return false;

  // Encode as msgpack
  const txnBytes = algosdk.encodeObj(txnObj);
  // Create byte array with TX prefix
  const msgBytes = new Uint8Array(txnBytes.length + 2);
  msgBytes.set(Buffer.from('TX'));
  msgBytes.set(txnBytes, 2);

  // Grab the other things we need to verify
  const pkBytes = stxn.txn.from.publicKey;
  const sigBytes = new Uint8Array(stxn.sig);

  // Return the result of the verification
  return nacl.sign.detached.verify(msgBytes, sigBytes, pkBytes);
}

function main() {
  const sp: algosdk.SuggestedParams = {
    fee: 0,
    firstRound: 1,
    lastRound: 2,
    genesisHash: 'nDtgfcrOMvfAaxYZSL+gCqA2ot5uBknFJuWE4pVFloo=',
    genesisID: 'sandnet-v1',
  };
  const acct = algosdk.generateAccount();
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: acct.addr,
    to: acct.addr,
    amount: 0,
    suggestedParams: sp,
  });

  const blob = txn.signTxn(acct.sk);

  const stxn = algosdk.decodeSignedTransaction(blob);
  console.log('Valid? ', verifySignedTransaction(stxn));
}

main();
