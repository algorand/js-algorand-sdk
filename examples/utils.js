/**
 * Ensure that all of the required environment variables are set, throws an error otherwise
 * @param {string[]} list 
 */
function ensureEnvVariablesSet(list) {
  list.forEach((envVarName) => {
    // Throw an error if the variable is not defined
    if (!typeof process.env[envVarName] === 'string') {
      throw new Error(`"${envVarName}" environment variable not set.`);
    }
  });
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
      throw "Bad arguments.";
  }
  let status = (await algodclient.status().do());
  if (status == undefined) throw new Error("Unable to get node status");
  let startround = status["last-round"] + 1;   
  let currentround = startround;

  while (currentround < (startround + timeout)) {
      let pendingInfo = await algodclient.pendingTransactionInformation(txId).do();      
      if (pendingInfo != undefined) {
          if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
              //Got the completed Transaction
              return pendingInfo;
          }
          else {
              if (pendingInfo["pool-error"] != null && pendingInfo["pool-error"].length > 0) {
                  // If there was a pool error, then the transaction has been rejected!
                  throw new Error("Transaction Rejected" + " pool error" + pendingInfo["pool-error"]);
              }
          }
      } 
      await algodclient.statusAfterBlock(currentround).do();
      currentround++;
  }
  throw new Error("Transaction not confirmed after " + timeout + " rounds!");
};

module.exports = {
  ensureEnvVariablesSet,
  waitForConfirmation,
};
