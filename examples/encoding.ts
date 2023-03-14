/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import { Buffer } from 'buffer';
import algosdk from '../src';
import { getLocalAlgodClient, getLocalAccounts } from './utils';

async function main() {
  const client = getLocalAlgodClient();
  const accounts = await getLocalAccounts();
  const sender = accounts[0];
  const receiver = accounts[1];
  const suggestedParams = await client.getTransactionParams().do();

  // example: JSSDK_CODEC_ADDRESS
  const address = '4H5UNRBJ2Q6JENAXQ6HNTGKLKINP4J4VTQBEPK5F3I6RDICMZBPGNH6KD4';
  const pk = algosdk.decodeAddress(address);
  const addr = algosdk.encodeAddress(pk.publicKey);
  console.log(address, addr);
  // example: JSSDK_CODEC_ADDRESS

  // example: JSSDK_CODEC_BASE64
  const b64Encoded = 'SGksIEknbSBkZWNvZGVkIGZyb20gYmFzZTY0';
  const b64Decoded = Buffer.from(b64Encoded, 'base64').toString();
  console.log(b64Encoded, b64Decoded);
  // example: JSSDK_CODEC_BASE64

  // example: JSSDK_CODEC_UINT64
  const int = 1337;
  const encoded = algosdk.encodeUint64(int);
  const safeDecoded = algosdk.decodeUint64(encoded, 'safe');
  const mixedDecoded = algosdk.decodeUint64(encoded, 'bigint');
  console.log(int, encoded, safeDecoded, mixedDecoded);
  // example: JSSDK_CODEC_UINT64

  // example: JSSDK_CODEC_TRANSACTION_UNSIGNED
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender.addr,
    to: receiver.addr,
    amount: 1e6,
    suggestedParams,
  });

  const txnBytes = txn.toByte();
  const txnB64 = Buffer.from(txnBytes).toString('base64');
  const restoredTxn = algosdk.decodeUnsignedTransaction(
    Buffer.from(txnB64, 'base64')
  );
  console.log(restoredTxn);
  // example: JSSDK_CODEC_TRANSACTION_UNSIGNED

  // example: JSSDK_CODEC_TRANSACTION_SIGNED
  const signedTxn = txn.signTxn(sender.privateKey);
  const signedB64Txn = Buffer.from(signedTxn).toString('base64');
  const restoredSignedTxn = algosdk.decodeSignedTransaction(
    Buffer.from(signedB64Txn, 'base64')
  );
  console.log(restoredSignedTxn);
  // example: JSSDK_CODEC_TRANSACTION_SIGNED
}

main();
