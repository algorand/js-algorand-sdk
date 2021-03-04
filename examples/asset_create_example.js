// Example: creating an asset

const algosdk = require('../');
const utils = require('./utils');

const { SENDER } = utils.retrieveBaseConfig();

async function main () {
  const sender = algosdk.mnemonicToSecretKey(SENDER.mnemonic);

  // generate accounts
  const { addr: freezeAddr } = algosdk.generateAccount(); // account that can freeze other accounts for this asset
  const { addr: managerAddr } = algosdk.generateAccount(); // account able to update asset configuration
  const { addr: clawbackAddr } = algosdk.generateAccount(); // account allowed to take this asset from any other account
  const { addr: reserveAddr } = algosdk.generateAccount(); // account that holds reserves for this asset

  const feePerByte = 10;
  const firstValidRound = 1000;
  const lastValidRound = 2000;
  const genesisHash = 'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI=';

  const total = 100; // how many of this asset there will be
  const assetName = "assetname";
  const unitName = "unitname";
  const url = "website";
  const metadata = "fACPO4nRgO55j1ndAK3W6Sgc4APkcyFh"; // should be a 32-byte hash
  const defaultFrozen = false; // whether accounts should be frozen by default
  
  // create suggested parameters
  const suggestedParams = {
    flatFee: false,
    fee: feePerByte,
    firstRound: firstValidRound,
    lastRound: lastValidRound,
    genesisHash: genesisHash,
  };
  
  // create the asset creation transaction
  const txn = algosdk.makeAssetCreateTxnWithSuggestedParamsFromObject({
    from: sender.addr,
    assetTotal: total,
    assetName,
    assetUnitName: unitName,
    assetURL: url,
    assetMetadataHash: metadata,
    assetDefaultFrozen: defaultFrozen,

    assetFreeze: freezeAddr,
    assetManager: managerAddr,
    assetClawback: clawbackAddr,
    assetReserve: reserveAddr,

    suggestedParams,
  });

  // sign the transaction
  const signedTxn = txn.signTxn(sender.sk);

  // print transaction data
  const decoded = algosdk.decodeSignedTransaction(signedTxn);
  console.log(decoded);
}

main()
  .catch(console.error);
