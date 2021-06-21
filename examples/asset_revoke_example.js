// Example: revoking assets

const algosdk = require('..');

async function main() {
  const {
    sk: clawbackPrivateKey,
    addr: clawbackAddress,
  } = algosdk.generateAccount();

  const feePerByte = 10;
  const firstValidRound = 1000;
  const lastValidRound = 2000;
  const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
  const { addr: receiverAddr } = algosdk.generateAccount();
  const { addr: targetAddr } = algosdk.generateAccount();
  const amount = 100;

  const assetIndex = 1234; // identifying index of the asset

  // set suggested parameters
  // usually these parameters are fetched using the `algosdk.getTransactionParams()` method
  const suggestedParams = {
    fee: feePerByte,
    firstRound: firstValidRound,
    lastRound: lastValidRound,
    genesisHash,
  };

  // create the asset revoke transaction
  const transactionOptions = {
    from: clawbackAddress,
    to: receiverAddr,
    revocationTarget: targetAddr,
    amount,
    assetIndex,
    suggestedParams,
  };

  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(
    transactionOptions
  );

  // sign the transaction
  const signedTxn = txn.signTxn(clawbackPrivateKey);

  // print transaction data
  const decoded = algosdk.decodeSignedTransaction(signedTxn);
  console.log(decoded);
}

main().catch(console.error);
