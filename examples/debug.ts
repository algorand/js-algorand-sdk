import { Buffer } from 'buffer';
import algosdk from '../src';
import { getLocalAccounts, getLocalAlgodClient } from './utils';

async function main() {
  const algodClient = getLocalAlgodClient();
  const accts = await getLocalAccounts();

  const sender = accts[0];
  // example: DEBUG_DRYRUN_DUMP
  const suggestedParams = await algodClient.getTransactionParams().do();

  const addTxnForDr = algosdk.makeApplicationNoOpTxnFromObject({
    from: sender.addr,
    suggestedParams,
    appIndex: 123,
    appArgs: [
      new Uint8Array(Buffer.from('add', 'utf8')),
      algosdk.encodeUint64(1),
      algosdk.encodeUint64(2),
    ],
  });

  const signedDrTxn = algosdk.decodeSignedTransaction(
    addTxnForDr.signTxn(sender.privateKey)
  );

  const dryrunForLogging = await algosdk.createDryrun({
    client: algodClient,
    txns: [signedDrTxn],
  });

  console.log('Dryrun:', dryrunForLogging.get_obj_for_encoding());
  // example: DEBUG_DRYRUN_DUMP

  // example: DEBUG_DRYRUN_SUBMIT
  const dryrunForResponse = await algosdk.createDryrun({
    client: algodClient,
    txns: [signedDrTxn],
  });

  const dryrunResponse = await algodClient.dryrun(dryrunForResponse).do();

  console.log('Dryrun Response:', dryrunResponse);
  // example: DEBUG_DRYRUN_SUBMIT
}

main();
