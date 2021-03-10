// Example: destroying an asset

const algosdk = require('..');

async function main() {
  const {
    sk: creatorPrivateKey,
    addr: creatorAddress,
  } = algosdk.generateAccount();

  const feePerByte = 10;
  const firstValidRound = 1000;
  const lastValidRound = 2000;
  const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';

  const assetIndex = 1234; // identifying index of the asset

  // set suggested parameters
  const suggestedParams = {
    fee: feePerByte,
    firstRound: firstValidRound,
    lastRound: lastValidRound,
    genesisHash,
  };

  // create the asset destroy transaction
  const transactionOptions = {
    from: creatorAddress,
    assetIndex,
    suggestedParams,
  };

  const txn = algosdk.makeAssetDestroyTxnWithSuggestedParamsFromObject(
    transactionOptions
  );

  // sign the transaction
  const signedTxn = txn.signTxn(creatorPrivateKey);
}

main().catch(console.error);
