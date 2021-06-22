// Example: updating asset configuration

const algosdk = require('..');

async function main() {
  const {
    sk: managerPrivateKey,
    addr: managerAddress,
  } = algosdk.generateAccount();
  const { addr: newFreezeAddr } = algosdk.generateAccount();
  const { addr: newManagerAddr } = algosdk.generateAccount();
  const { addr: newClawbackAddr } = algosdk.generateAccount();
  const { addr: newReserveAddr } = algosdk.generateAccount();

  const feePerByte = 10;
  const firstValidRound = 1000;
  const lastValidRound = 2000;
  const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';

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

  // create the asset update transaction
  const transactionOptions = {
    from: managerAddress,
    freeze: newFreezeAddr,
    manager: newManagerAddr,
    clawback: newClawbackAddr,
    reserve: newReserveAddr,
    assetIndex,
    suggestedParams,
  };

  const txn = algosdk.makeAssetConfigTxnWithSuggestedParamsFromObject(
    transactionOptions
  );

  // sign the transaction
  const signedTxn = txn.signTxn(managerPrivateKey);

  // print transaction data
  const decoded = algosdk.decodeSignedTransaction(signedTxn);
  console.log(decoded);
}

main().catch(console.error);
