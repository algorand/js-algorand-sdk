/**
 * Example: working with NoteField
 * We can put things in the "note" field of a transaction; here's an example
 * with a simple payment transaction. Note that you can put any bytes you
 * want in the "note" field.
 */

const algosdk = require('..');
const utils = require('./utils');

const { ALGOD_INSTANCE, SENDER, RECEIVER } = utils.retrieveBaseConfig();

async function main() {
  // initialize an algod client
  const client = new algosdk.Algodv2(
    ALGOD_INSTANCE.token,
    ALGOD_INSTANCE.server,
    ALGOD_INSTANCE.port
  );

  // retrieve sender and receiver
  const { sk, addr } = algosdk.mnemonicToSecretKey(SENDER.mnemonic);
  const { addr: receiver } = algosdk.mnemonicToSecretKey(RECEIVER.mnemonic);

  // get suggested parameters
  const suggestedParams = await client.getTransactionParams().do();

  // construct a transaction note
  const note = new Uint8Array(Buffer.from('Hello World', 'utf8'));

  // create the transaction
  const transactionOptions = {
    from: addr,
    to: receiver,
    amount: 100000,
    note,
    suggestedParams,
  };

  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject(
    transactionOptions
  );

  // send transaction (note that the sender account needs to be funded for this to work)
  console.log('Sending transaction...');
  const signedTxn = txn.signTxn(sk);
  const { txId } = await client.sendRawTransaction(signedTxn).do();

  // wait for confirmation – timeout after 2 rounds
  console.log('Awaiting confirmation (this will take several seconds)...');
  const roundTimeout = 2;
  const confirmation = await utils.waitForConfirmation(
    client,
    txId,
    roundTimeout
  );
  console.log('Transaction successful.');

  // log the note included on the transaction
  const noteArrayFromTxn = confirmation.txn.txn.note;
  const receivedNote = Buffer.from(noteArrayFromTxn).toString('utf8');
  console.log(`Note received: ${receivedNote}`);
}

main().catch(console.error);
