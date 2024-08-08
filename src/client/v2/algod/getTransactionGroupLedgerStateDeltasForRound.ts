import JSONRequest from '../jsonrequest.js';
import { TransactionGroupLedgerStateDeltasForRoundResponse } from './models/types.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';

export default class GetTransactionGroupLedgerStateDeltasForRound extends JSONRequest<TransactionGroupLedgerStateDeltasForRoundResponse> {
  constructor(
    c: HTTPClient,
    private round: number
  ) {
    super(c);
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
    return decodeJSON(
      response.getJSONText(),
      TransactionGroupLedgerStateDeltasForRoundResponse
    );
  }
}
