import JSONRequest from '../jsonrequest.js';
import { TransactionGroupLedgerStateDeltasForRoundResponse } from './models/types.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeMsgpack } from '../../../encoding/encoding.js';

export default class GetTransactionGroupLedgerStateDeltasForRound extends JSONRequest<TransactionGroupLedgerStateDeltasForRoundResponse> {
  private round: bigint;

  constructor(c: HTTPClient, round: number | bigint) {
    super(c);
    this.round = BigInt(round);
    this.query = { format: 'msgpack' };
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/deltas/${this.round}/txn/group`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(
    response: HTTPClientResponse
  ): TransactionGroupLedgerStateDeltasForRoundResponse {
    return decodeMsgpack(
      response.body,
      TransactionGroupLedgerStateDeltasForRoundResponse
    );
  }
}
