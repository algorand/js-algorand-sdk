// Example: creating a LogicSig transaction signed by a program that never approves the transfer.

const algosdk = require('../');
const utils = require('./utils');

const { ALGOD_INSTANCE, RECEIVER } = utils.retrieveBaseConfig();

async function main () {
  // initialize an algod client
  const client =  new algosdk.Algodv2(
    ALGOD_INSTANCE.token,
    ALGOD_INSTANCE.server,
    ALGOD_INSTANCE.port,
  );

  // compile the program
  // NOTE: algod must have `EnableDeveloperAPI` set to true in its configuration
  //       in order to compile TEAL programs. Learn more about the config settings at:
  //       > https://developer.algorand.org/docs/reference/node/config/
  const program = 'int 0';
  const compiledProgram = await client.compile(program).do();
  const programBytes = new Uint8Array(Buffer.from(compiledProgram.result, 'base64'));

  // create a logic signature
  const lsig = algosdk.makeLogicSig(programBytes);
  const sender = lsig.address();
  
  // retrieve a receiver
  const receiver = algosdk.mnemonicToSecretKey(RECEIVER.mnemonic);
  
  // get suggested parameters
  const suggestedParams = await client.getTransactionParams().do();
  
  // create a transaction
  const amount = 100000;
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender,
    to: receiver.addr,
    amount,
    suggestedParams,
  });

  // sign transaction with logic signature

  const lstx = algosdk.signLogicSigTransactionObject(txn, lsig);
  
  // send transaction (it should fail because of the logic signature, which returns 0)
  console.log('Sending transaction...');
  await client.sendRawTransaction(lstx.blob).do();
}

main()
  .catch(console.error);
