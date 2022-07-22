import Algodv2 from './client/v2/algod/algod';

/**
 * Wait until a transaction has been confirmed or rejected by the network, or
 * until 'waitRounds' number of rounds have passed.
 * @param client - An Algodv2 client
 * @param txid - The ID of the transaction to wait for.
 * @param waitRounds - The maximum number of rounds to wait for.
 * @returns A promise that, upon success, will resolve to the output of the
 *   `pendingTransactionInformation` call for the confirmed transaction.
 */
export async function waitForConfirmation(
  client: Algodv2,
  txid: string,
  waitRounds: number
): Promise<Record<string, any>> {
  // Wait until the transaction is confirmed or rejected, or until 'waitRounds'
  // number of rounds have passed.

  let currentRound = 0;
  let counter = 0;

  /* eslint-disable no-await-in-loop */
  while (counter <= waitRounds) {
    let pendingInfo = {};
    try {
      pendingInfo = await client.pendingTransactionInformation(txid).do();
    } catch (err) {
      // Ignore errors from PendingTransactionInformation, since it may return 404 if the algod
      // instance is behind a load balancer and the request goes to a different algod than the
      // one we submitted the transaction to
    }

    if (pendingInfo['confirmed-round']) {
      // Got the completed Transaction
      return pendingInfo;
    }

    if (pendingInfo['pool-error']) {
      // If there was a pool error, then the transaction has been rejected
      throw new Error(`Transaction Rejected: ${pendingInfo['pool-error']}`);
    }

    const status = await client.statusAfterBlock(currentRound).do();
    // wait 2 seconds if we do not get any status back or if currentRound is 0
    if (!status || !currentRound) {
      await new Promise<void>((res) => setTimeout(res, 2000));
    }
    currentRound = ((status && status['last-round']) || currentRound) + 1;
    counter += 1;
  }
  /* eslint-enable no-await-in-loop */
  throw new Error(`Transaction not confirmed after ${waitRounds} rounds`);
}
