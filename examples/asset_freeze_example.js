// Example: freezing or unfreezing an account

const algosdk = require('../src');

async function main() {
  const {
    sk: freezePrivateKey,
    addr: freezeAddress,
  } = algosdk.generateAccount();

  const feePerByte = 10;
  const firstValidRound = 1000;
  const lastValidRound = 2000;
  const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';

  const { addr: freezeTarget } = algosdk.generateAccount();

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

  // Create the asset freeze transaction
  const transactionOptions = {
    from: freezeAddress,
    freezeTarget,
    assetIndex,
    suggestedParams,
  };

  const txn = algosdk.makeAssetFreezeTxnWithSuggestedParamsFromObject(
    transactionOptions
  );

  // sign the transaction
  const signedTxn = txn.signTxn(freezePrivateKey);

  // print transaction data
  const decoded = algosdk.decodeSignedTransaction(signedTxn);
  console.log(decoded);
}

main().catch(console.error);
