// Example: with TypeScript

import algosdk from '../src/index';
import utils from './utils';

const { SENDER, RECEIVER } = utils.retrieveBaseConfig();

async function main() {
  // retrieve sender and receiver
  const { sk, addr } = algosdk.mnemonicToSecretKey(SENDER.mnemonic);
  const { addr: receiver } = algosdk.mnemonicToSecretKey(RECEIVER.mnemonic);

  // suggested parameters
  const feePerByte = 10;
  const firstValidRound = 1000;
  const lastValidRound = 2000;
  const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
  const genesisID = 'testnet-v1.0';

  const suggestedParams: algosdk.SuggestedParams = {
    flatFee: false,
    fee: feePerByte,
    firstRound: firstValidRound,
    lastRound: lastValidRound,
    genesisHash,
    genesisID,
  };

  // construct a transaction note
  const note = new Uint8Array(Buffer.from('Hello World', 'utf8'));

  // create the transaction
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: addr,
    to: receiver,
    amount: 100000,
    note,
    suggestedParams,
    // try adding another option to the list above by using TypeScript autocomplete (ctrl + space in VSCode)
  });

  const signedTxn = txn.signTxn(sk);
  console.log(algosdk.decodeSignedTransaction(signedTxn));
}

main().catch(console.error);
