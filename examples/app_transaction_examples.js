// Example: various application transactions

// NOTE: Though we passed arguments directly to functions in
// this example to show that it is possible, we'd recommend using the
// makeApplicationCreateTxnFromObject, makeApplicationOptInTxnFromObject, etc.
// counterparts in your code for readability.

const algosdk = require('..');
const utils = require('./utils');

const { ALGOD_INSTANCE, SENDER, RECEIVER } = utils.retrieveBaseConfig();

/** Compile and return program bytes of a simple program that returns 1 always
 * NOTE: algod must have `EnableDeveloperAPI` set to true in its configuration
 *       in order to compile TEAL programs. Learn more about the config settings at:
 *       \> https://developer.algorand.org/docs/reference/node/config/
 */
async function getBasicProgramBytes(client) {
  const program = '#pragma version 2\nint 1';

  // use algod to compile the program
  const compiledProgram = await client.compile(program).do();
  return new Uint8Array(Buffer.from(compiledProgram.result, 'base64'));
}

/**
 * Wait for confirmation — timeout after 2 rounds
 */
async function verboseWaitForConfirmation(client, txnId) {
  console.log('Awaiting confirmation (this will take several seconds)...');
  const roundTimeout = 2;
  const completedTx = await utils.waitForConfirmation(
    client,
    txnId,
    roundTimeout
  );
  console.log('Transaction successful.');
  return completedTx;
}

/**
 * Log a bolded message to console
 */
function logBold(message) {
  console.log(`${utils.fmt.bold}${message}${utils.fmt.reset}`);
}

async function main() {
  // initialize an algod client
  const client = new algosdk.Algodv2(
    ALGOD_INSTANCE.token,
    ALGOD_INSTANCE.server,
    ALGOD_INSTANCE.port
  );

  /** retrieve sender and receiver
   * NOTE: sender and receiver accounts must have a minimum balance of 200000
   */
  const sender = algosdk.mnemonicToSecretKey(SENDER.mnemonic);
  const receiver = algosdk.mnemonicToSecretKey(RECEIVER.mnemonic);

  // ------------------------------
  // > Create application
  // ------------------------------

  // define application parameters
  const from = sender.addr;
  const onComplete = algosdk.OnApplicationComplete.NoOpOC;
  const approvalProgram = await getBasicProgramBytes(client);
  const clearProgram = await getBasicProgramBytes(client);
  const numLocalInts = 0;
  const numLocalByteSlices = 0;
  const numGlobalInts = 0;
  const numGlobalByteSlices = 0;
  const appArgs = [];

  // get suggested params
  const suggestedParams = await client.getTransactionParams().do();

  // create the application creation transaction
  const createTxn = algosdk.makeApplicationCreateTxn(
    from,
    suggestedParams,
    onComplete,
    approvalProgram,
    clearProgram,
    numLocalInts,
    numLocalByteSlices,
    numGlobalInts,
    numGlobalByteSlices,
    appArgs
  );

  // send the transaction
  logBold('Sending application creation transaction.');
  const signedCreateTxn = createTxn.signTxn(sender.sk);
  const { txId: createTxId } = await client
    .sendRawTransaction(signedCreateTxn)
    .do();

  // wait for confirmation
  const completedTx = await verboseWaitForConfirmation(client, createTxId);

  // ------------------------------
  // > Opt in to application
  // ------------------------------

  // opt in to the created application
  const appId = completedTx['application-index'];
  const optInTxn = algosdk.makeApplicationOptInTxn(
    receiver.addr,
    suggestedParams,
    appId
  );

  // send the transaction
  logBold('Sending application opt in transaction.');
  const signedOptInTxn = optInTxn.signTxn(receiver.sk);
  const { txId: optInTxId } = await client
    .sendRawTransaction(signedOptInTxn)
    .do();

  // wait for confirmation
  await verboseWaitForConfirmation(client, optInTxId);

  // ------------------------------
  // > Call application
  // ------------------------------

  // call the created application
  const callTxn = algosdk.makeApplicationNoOpTxn(
    receiver.addr,
    suggestedParams,
    appId,
    appArgs
  );

  // send the transaction
  logBold('Sending application call transaction.');
  const signedCallTxn = callTxn.signTxn(receiver.sk);
  const { txId: callTxnId } = await client
    .sendRawTransaction(signedCallTxn)
    .do();

  // wait for confirmation
  await verboseWaitForConfirmation(client, callTxnId);

  // ------------------------------
  // > Close out application
  // ------------------------------

  // Close out (opt account out) from the application
  const closeOutTxn = algosdk.makeApplicationCloseOutTxn(
    receiver.addr,
    suggestedParams,
    appId,
    appArgs
  );

  // send the transaction
  logBold('Sending application close out transaction.');
  const signedCloseOutTxn = closeOutTxn.signTxn(receiver.sk);
  const { txId: closeOutTxnId } = await client
    .sendRawTransaction(signedCloseOutTxn)
    .do();

  // wait for confirmation
  await verboseWaitForConfirmation(client, closeOutTxnId);

  // ------------------------------
  // > Delete application
  // ------------------------------

  // delete the application
  const deleteTxn = algosdk.makeApplicationDeleteTxn(
    sender.addr,
    suggestedParams,
    appId
  );

  // send the transaction
  logBold('Sending application delete transaction.');
  const signedDeleteTxn = deleteTxn.signTxn(sender.sk);
  const { txId: deleteTxnId } = await client
    .sendRawTransaction(signedDeleteTxn)
    .do();

  // wait for confirmation
  await verboseWaitForConfirmation(client, deleteTxnId);
}

main().catch(console.error);
