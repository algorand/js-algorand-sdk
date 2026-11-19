import { AlgodClient } from './client/v2/algod/algod.js';
import { PendingTransactionResponse } from './client/v2/algod/models/types.js';

/** An algod node reported that the transaction was rejected from its pool. */
export class TransactionRejectedError extends Error {
  constructor(
    public readonly txid: string,
    public readonly poolError: string
  ) {
    super(`Transaction Rejected: ${poolError}`);
    this.name = 'TransactionRejectedError';
  }
}

/**
 * The requested confirmation window elapsed. The transaction may still confirm
 * later; a timeout does not establish that the transaction was rejected.
 */
export class TransactionConfirmationTimeoutError extends Error {
  constructor(
    public readonly txid: string,
    public readonly waitRounds: number
  ) {
    super(`Transaction not confirmed after ${waitRounds} rounds`);
    this.name = 'TransactionConfirmationTimeoutError';
  }
}

/**
 * Wait until a transaction has been confirmed or rejected by the network, or
 * until 'waitRounds' number of rounds have passed.
 * @param client - An Algodv2 client
 * @param txid - The ID of the transaction to wait for.
 * @param waitRounds - The maximum number of rounds to wait for.
 * @returns A promise that, upon success, will resolve to the output of the
 *   `pendingTransactionInformation` call for the confirmed transaction.
 * @throws {@link TransactionRejectedError} if algod reports a pool rejection.
 * @throws {@link TransactionConfirmationTimeoutError} if the round limit expires.
 * Errors from status requests are propagated unchanged and do not imply rejection.
 */
export async function waitForConfirmation(
  client: AlgodClient,
  txid: string,
  waitRounds: number
): Promise<PendingTransactionResponse> {
  // Wait until the transaction is confirmed or rejected, or until 'waitRounds'
  // number of rounds have passed.

  const status = await client.status().do();
  if (typeof status === 'undefined') {
    throw new Error('Unable to get node status');
  }
  const startRound = status.lastRound + BigInt(1);
  const stopRound = startRound + BigInt(waitRounds);
  let currentRound = startRound;

  /* eslint-disable no-await-in-loop */
  while (currentRound < stopRound) {
    let poolError = false;
    try {
      const pendingInfo = await client.pendingTransactionInformation(txid).do();

      if (pendingInfo.confirmedRound) {
        // Got the completed Transaction
        return pendingInfo;
      }

      if (pendingInfo.poolError) {
        // If there was a pool error, then the transaction has been rejected
        poolError = true;
        throw new TransactionRejectedError(txid, pendingInfo.poolError);
      }
    } catch (err) {
      // Ignore errors from PendingTransactionInformation, since it may return 404 if the algod
      // instance is behind a load balancer and the request goes to a different algod than the
      // one we submitted the transaction to
      if (poolError) {
        // Rethrow error only if it's because the transaction was rejected
        throw err;
      }
    }

    await client.statusAfterBlock(currentRound).do();
    currentRound += BigInt(1);
  }
  /* eslint-enable no-await-in-loop */
  throw new TransactionConfirmationTimeoutError(txid, waitRounds);
}
