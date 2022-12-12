// Example: working with transaction groups

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
  const sender = algosdk.mnemonicToSecretKey(SENDER.mnemonic);
  const receiver = algosdk.mnemonicToSecretKey(RECEIVER.mnemonic);

  // get suggested parameters
  const suggestedParams = await client.getTransactionParams().do();

  // create the transactions
  const amount = 100000;
  const txn1 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender.addr,
    to: receiver.addr,
    amount,
    suggestedParams,
  });
  const txn2 = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: receiver.addr,
    to: sender.addr,
    amount,
    suggestedParams,
  });

  // assign group id to transactions
  algosdk.assignGroupID([txn1, txn2]);

  // sign transactions
  const stxn1 = txn1.signTxn(sender.sk);
  const stxn2 = txn2.signTxn(receiver.sk);

  // send transactions (note that the accounts need to be funded for this to work)
  console.log('Sending transactions...');
  const { txId } = await client.sendRawTransaction([stxn1, stxn2]).do();

  // wait for confirmation – timeout after 2 rounds
  console.log('Awaiting confirmation (this will take several seconds)...');
  const roundTimeout = 2;
  await utils.waitForConfirmation(client, txId, roundTimeout);
  console.log('Transactions successful.');
}

main().catch(console.error);
