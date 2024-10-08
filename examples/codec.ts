/* eslint-disable import/extensions */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-promise-executor-return */
/* eslint-disable no-console */
import algosdk from '../src';
import { getLocalAccounts, getLocalAlgodClient } from './utils';

async function main() {
  const client = getLocalAlgodClient();
  const accounts = await getLocalAccounts();
  const sender = accounts[0];
  const receiver = accounts[1];
  const suggestedParams = await client.getTransactionParams().do();

  // example: CODEC_ADDRESS
  const address = '4H5UNRBJ2Q6JENAXQ6HNTGKLKINP4J4VTQBEPK5F3I6RDICMZBPGNH6KD4';
  const addr = algosdk.Address.fromString(address);
  console.log(address, addr);
  // example: CODEC_ADDRESS

  // example: CODEC_BASE64
  const b64Encoded = 'SGksIEknbSBkZWNvZGVkIGZyb20gYmFzZTY0';
  const b64Decoded = algosdk.base64ToBytes(b64Encoded);
  console.log(b64Encoded, b64Decoded);
  // example: CODEC_BASE64

  // example: CODEC_UINT64
  const int = 1337;
  const encoded = algosdk.encodeUint64(int);
  const safeDecoded = algosdk.decodeUint64(encoded, 'safe');
  const mixedDecoded = algosdk.decodeUint64(encoded, 'bigint');
  console.log(int, encoded, safeDecoded, mixedDecoded);
  // example: CODEC_UINT64

  // example: CODEC_TRANSACTION_UNSIGNED
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    sender: sender.addr,
    receiver: receiver.addr,
    amount: 1e6,
    suggestedParams,
  });

  const txnBytes = algosdk.encodeUnsignedTransaction(txn);
  const txnB64 = algosdk.bytesToBase64(txnBytes);
  // ...
  const restoredTxn = algosdk.decodeUnsignedTransaction(
    algosdk.base64ToBytes(txnB64)
  );
  console.log(restoredTxn);
  // example: CODEC_TRANSACTION_UNSIGNED

  // example: CODEC_TRANSACTION_SIGNED
  const signedTxn = txn.signTxn(sender.privateKey);
  const signedB64Txn = algosdk.bytesToBase64(signedTxn);
  const restoredSignedTxn = algosdk.decodeSignedTransaction(
    algosdk.base64ToBytes(signedB64Txn)
  );
  console.log(restoredSignedTxn);
  // example: CODEC_TRANSACTION_SIGNED

  // example: CODEC_ABI
  const stringTupleCodec = algosdk.ABIType.from('(string,string)');

  const stringTupleData = ['hello', 'world'];
  const encodedTuple = stringTupleCodec.encode(stringTupleData);
  console.log(algosdk.bytesToHex(encodedTuple));

  const decodedTuple = stringTupleCodec.decode(encodedTuple);
  console.log(decodedTuple); // ['hello', 'world']

  const uintArrayCodec = algosdk.ABIType.from('uint64[]');

  const uintArrayData = [1, 2, 3, 4, 5];
  const encodedArray = uintArrayCodec.encode(uintArrayData);
  console.log(algosdk.bytesToHex(encodedArray));

  const decodeArray = uintArrayCodec.decode(encodedArray);
  console.log(decodeArray); // [1, 2, 3, 4, 5]
  // example: CODEC_ABI
}

main();
