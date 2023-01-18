// Example: rekeying

const algosdk = require('../src');
const utils = require('./utils');

const { ALGOD_INSTANCE, SENDER } = utils.retrieveBaseConfig();

async function main() {
  // initialize an algod client
  const client = new algosdk.Algodv2(
    ALGOD_INSTANCE.token,
    ALGOD_INSTANCE.server,
    ALGOD_INSTANCE.port
  );

  // retrieve sender and generate a new rekey account
  const sender = algosdk.mnemonicToSecretKey(SENDER.mnemonic);
  const rekeyAccount = algosdk.generateAccount();
  const receiver = sender;

  // get suggested parameters
  const suggestedParams = await client.getTransactionParams().do();

  // To rekey an account to a new address, add the `rekey_to` argument to creation.
  // After sending this rekeying transaction, every transaction needs to be signed by the private key of the new address
  const amount = 0;
  const transactionOptions = {
    from: sender.addr,
    to: receiver.addr,
    rekeyTo: rekeyAccount.addr,
    amount,
    suggestedParams,
  };

  const rekeyingTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject(
    transactionOptions
  );

  // print transaction data
  console.log(rekeyingTxn);
  console.log(
    'Rekey transaction created successfully. Unsent transaction included above.'
  );
}

main().catch(console.error);
