import JSONRequest from '../jsonrequest.js';
import { TransactionGroupLedgerStateDeltasForRoundResponse } from './models/types.js';
import { HTTPClient } from '../../client.js';

export default class GetTransactionGroupLedgerStateDeltasForRound extends JSONRequest<
  TransactionGroupLedgerStateDeltasForRoundResponse,
  Record<string, any>
> {
  constructor(
    c: HTTPClient,
    private round: number
  ) {
    super(c);
    this.query = { format: 'json' };
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/deltas/${this.round}/txn/group`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(
    body: Record<string, any>
  ): TransactionGroupLedgerStateDeltasForRoundResponse {
    return TransactionGroupLedgerStateDeltasForRoundResponse.fromEncodingData(
      TransactionGroupLedgerStateDeltasForRoundResponse.encodingSchema.fromPreparedJSON(
        body
      )
    );
  }
}
