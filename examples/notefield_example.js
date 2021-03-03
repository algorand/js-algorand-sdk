/** 
 * Example: working with NoteField
 * We can put things in the "note" field of a transaction; here's an example
 * with a simple payment transaction. Note that you can put any bytes you
 * want in the "note" field.
 */ 

const algosdk = require('../');
const utils = require('./utils');

// ------------------------------
// > Configuration
// ------------------------------

utils.ensureEnvVariablesSet([
  'ALGOD_TOKEN',
  'ALGOD_SERVER',
  'SENDER_MNEMONIC',
  'RECEIVER_ADDRESS',
]);

const ALGOD_INSTANCE = {
  token: process.env.ALGOD_TOKEN,
  server: process.env.ALGOD_SERVER,
  port: process.env.ALGOD_PORT && parseInt(process.env.ALGOD_PORT),
};

const SENDER = {
  mnemonic: process.env.SENDER_MNEMONIC,
};

const RECEIVER = {
  address: process.env.RECEIVER_ADDRESS,
};

// ------------------------------
// > Example
// ------------------------------

async function main () {
  // test for invalid configuration
  if (!(
    typeof ALGOD_INSTANCE.token === 'string'
    && typeof ALGOD_INSTANCE.server === 'string'
    && typeof SENDER.mnemonic === 'string'
    && typeof RECEIVER.address === 'string'
  )) {
    throw new Error('Invalid configuration.');
  }

  const client =  new algosdk.Algodv2(
    ALGOD_INSTANCE.token,
    ALGOD_INSTANCE.server,
    ALGOD_INSTANCE.port,
  );
  
  // generate a sender and receiver
  const { sk, addr } = algosdk.mnemonicToSecretKey(SENDER.mnemonic);
  const receiver = RECEIVER.address;
  
  // get suggested parameters
  const suggestedParams = await client.getTransactionParams().do();
  
  // construct a transaction note
  const note = new Uint8Array(Buffer.from("Hello World", "utf8"));
  
  // create the transaction
  const transactionOptions = {
    from: addr,
    to: receiver,
    amount: 100000,
    note: note,
    suggestedParams: suggestedParams,
  };
  
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject(transactionOptions);
  
  // send transaction
  console.log('Sending transaction...');
  const signedTxn = txn.signTxn(sk);
  const { txId } = await client.sendRawTransaction(signedTxn).do();

  // wait for confirmation – timeout after 2 rounds
  console.log('Awaiting confirmation (this will take several seconds)...');
  const confirmation = await utils.waitForConfirmation(client, txId, 2);
  console.log('Transaction successful.');
  
  // log the note included on the transaction
  const noteArrayFromTxn = confirmation.txn.txn.note;
  const receivedNote = Buffer.from(noteArrayFromTxn).toString('utf8');
  console.log(`Note received: ${receivedNote}`);
}

main()
  .catch(console.error);
