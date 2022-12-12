// Example: manipulating multisig transactions

const algosdk = require('../src');
const utils = require('./utils');

const { ALGOD_INSTANCE, SENDER, RECEIVER } = utils.retrieveBaseConfig();

async function main() {
  // initialize an algod client
  const client = new algosdk.Algodv2(
    ALGOD_INSTANCE.token,
    ALGOD_INSTANCE.server,
    ALGOD_INSTANCE.port
  );

  // retrieve a sender and receiver
  const signer1 = algosdk.mnemonicToSecretKey(SENDER.mnemonic);
  const receiver = algosdk.mnemonicToSecretKey(RECEIVER.mnemonic);

  // generate an additional sign
  const signer2 = algosdk.generateAccount();

  // create a multisig account
  const multiSigOptions = {
    version: 1,
    threshold: 2,
    addrs: [signer1.addr, signer2.addr],
  };
  const msigAddress = algosdk.multisigAddress(multiSigOptions);

  // get suggested parameters
  const suggestedParams = await client.getTransactionParams().do();

  // create a transaction
  const amount = 100000;
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: msigAddress,
    to: receiver.addr,
    amount,
    suggestedParams,
  });

  // sign transaction
  const signature1 = algosdk.signMultisigTransaction(
    txn,
    multiSigOptions,
    signer1.sk
  );
  const signature2 = algosdk.signMultisigTransaction(
    txn,
    multiSigOptions,
    signer2.sk
  );
  const stxn = algosdk.mergeMultisigTransactions([
    signature1.blob,
    signature2.blob,
  ]);

  // print transaction data
  const decoded = algosdk.decodeSignedTransaction(stxn);
  console.log(decoded);
}

main().catch(console.error);
