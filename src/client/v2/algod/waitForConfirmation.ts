import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

/**
 * WaitForConfirmation waits for a pending transaction to be
 * confirmed by the network
 */
export default class WaitForConfirmation extends JSONRequest {
  constructor(c: HTTPClient, private txid: string, private waitRounds: number) {
    super(c);
    this.txid = txid;
    this.waitRounds = waitRounds;
  }

  async do(headers = {}) {
    // Wait until the transaction is confirmed or rejected, or until 'waitRounds'
    // number of rounds have passed.
    const status = await this.c.status().do(headers);
    if (typeof status === 'undefined') {
      throw new Error('Unable to get node status');
    }
    const startRound = status['last-round'] + 1;
    let currentRound = startRound;

    /* eslint-disable no-await-in-loop */
    while (currentRound < startRound + this.waitRounds) {
      const pendingInfo = await this.c
        .pendingTransactionInformation(this.txid)
        .do(headers);
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
      await this.c.statusAfterBlock(currentRound).do(headers);
      currentRound += 1;
    }
    /* eslint-enable no-await-in-loop */
    throw new Error(
      `Transaction not confirmed after ${this.waitRounds} rounds!`
    );
  }
}
