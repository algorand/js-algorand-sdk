/**
 * Ensure that all of the required environment variables are set, throws an error otherwise
 * @param list
 */
function ensureEnvVariablesSet(list) {
  list.forEach((envVarName) => {
    // Throw an error if the variable is not defined
    if (typeof process.env[envVarName] !== 'string') {
      throw new Error(`"${envVarName}" environment variable not set.`);
    }
  });
}

/**
 * Read the base configuration from environment variables.
 * Returns:
 * - Algod Instance
 * - Sender Account
 * - Receiver Account
 */
function retrieveBaseConfig() {
  // check that environment variables are set
  ensureEnvVariablesSet([
    'ALGOD_TOKEN',
    'ALGOD_SERVER',
    'SENDER_MNEMONIC',
    'RECEIVER_MNEMONIC',
  ]);

  // structure into objects
  const ALGOD_INSTANCE = {
    token: process.env.ALGOD_TOKEN,
    server: process.env.ALGOD_SERVER,
    port: process.env.ALGOD_PORT && parseInt(process.env.ALGOD_PORT, 10),
  };

  const SENDER = {
    mnemonic: process.env.SENDER_MNEMONIC,
  };

  const RECEIVER = {
    mnemonic: process.env.RECEIVER_MNEMONIC,
  };

  // test for invalid configuration
  if (
    !(
      typeof ALGOD_INSTANCE.token === 'string' &&
      typeof ALGOD_INSTANCE.server === 'string' &&
      !Number.isNaN(ALGOD_INSTANCE.port) &&
      typeof SENDER.mnemonic === 'string' &&
      typeof RECEIVER.mnemonic === 'string'
    )
  ) {
    throw new Error(
      'Invalid configuration. Perhaps you forgot to source the environment file?'
    );
  }

  return { ALGOD_INSTANCE, SENDER, RECEIVER };
}

/**
 * utility function to wait on a transaction to be confirmed
 * the timeout parameter indicates how many rounds do you wish to check pending transactions for
 */
async function waitForConfirmation(algodclient, txId, timeout) {
  // Wait until the transaction is confirmed or rejected, or until 'timeout'
  // number of rounds have passed.
  //     Args:
  // txId(str): the transaction to wait for
  // timeout(int): maximum number of rounds to wait
  // Returns:
  // pending transaction information, or throws an error if the transaction
  // is not confirmed or rejected in the next timeout rounds
  if (algodclient == null || txId == null || timeout < 0) {
    throw new Error('Bad arguments.');
  }
  const status = await algodclient.status().do();
  if (typeof status === 'undefined')
    throw new Error('Unable to get node status');
  const startround = status['last-round'] + 1;
  let currentround = startround;

  /* eslint-disable no-await-in-loop */
  while (currentround < startround + timeout) {
    const pendingInfo = await algodclient
      .pendingTransactionInformation(txId)
      .do();
    if (pendingInfo !== undefined) {
      if (
        pendingInfo['confirmed-round'] !== null &&
        pendingInfo['confirmed-round'] > 0
      ) {
        // Got the completed Transaction
        return pendingInfo;
      }

      if (
        pendingInfo['pool-error'] != null &&
        pendingInfo['pool-error'].length > 0
      ) {
        // If there was a pool error, then the transaction has been rejected!
        throw new Error(
          `Transaction Rejected pool error${pendingInfo['pool-error']}`
        );
      }
    }
    await algodclient.statusAfterBlock(currentround).do();
    currentround += 1;
  }
  /* eslint-enable no-await-in-loop */
  throw new Error(`Transaction not confirmed after ${timeout} rounds!`);
}

// Formatting codes to adjust font qualities
const fmt = {
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  reset: '\x1b[0m',
};

module.exports = {
  ensureEnvVariablesSet,
  retrieveBaseConfig,
  waitForConfirmation,
  fmt,
};
