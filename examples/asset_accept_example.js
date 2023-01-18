// Example: accepting assets

const algosdk = require('../src');

async function main() {
  const account = algosdk.generateAccount();

  const feePerByte = 10;
  const firstValidRound = 1000;
  const lastValidRound = 2000;
  const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
  const receiver = account; // to start accepting assets, set receiver to sender
  const amount = 0; // to start accepting assets, set amount to 0

  const assetIndex = 1234; // identifying index of the asset

  // set suggested parameters
  // in most cases, we suggest fetching recommended transaction parameters
  // using the `algosdk.Algodv2.getTransactionParams()` method
  const suggestedParams = {
    fee: feePerByte,
    firstRound: firstValidRound,
    lastRound: lastValidRound,
    genesisHash,
  };

  // create the asset accept transaction
  const transactionOptions = {
    from: account.addr,
    to: receiver.addr,
    assetIndex,
    amount,
    suggestedParams,
  };

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(
    transactionOptions
  );

  // sign the transaction
  const signedTxn = txn.signTxn(account.sk);

  // print transaction data
  const decoded = algosdk.decodeSignedTransaction(signedTxn);
  console.log(decoded);
}

main().catch(console.error);
