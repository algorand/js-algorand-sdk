// Example: sending assets

const algosdk = require('..');

async function main() {
  const { sk: senderPrivateKey, addr: senderAddress } =
    algosdk.generateAccount();

  const feePerByte = 10;
  const firstValidRound = 1000;
  const lastValidRound = 2000;
  const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';
  const { addr: closeAssetsToAddr } = algosdk.generateAccount();
  const { addr: receiverAddr } = algosdk.generateAccount();
  const amount = 100; // amount of assets to transfer

  const assetIndex = 1234; // identifying index of the asset

  // set suggested parameters
  const suggestedParams = {
    fee: feePerByte,
    firstRound: firstValidRound,
    lastRound: lastValidRound,
    genesisHash,
  };

  // create the asset transfer transaction
  const transactionOptions = {
    from: senderAddress,
    to: receiverAddr,
    closeRemainderTo: closeAssetsToAddr,
    amount,
    assetIndex,
    suggestedParams,
  };

  const txn =
    algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject(
      transactionOptions
    );

  // sign the transaction
  const signedTxn = txn.signTxn(senderPrivateKey);

  // print transaction data
  const decoded = algosdk.decodeSignedTransaction(signedTxn);
  console.log(decoded);
}

main().catch(console.error);
