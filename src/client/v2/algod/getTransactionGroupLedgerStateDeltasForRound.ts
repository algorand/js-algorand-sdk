import JSONRequest from '../jsonrequest';
import { TransactionGroupLedgerStateDeltasForRoundResponse } from './models/types';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';

export default class GetTransactionGroupLedgerStateDeltasForRound extends JSONRequest<
  TransactionGroupLedgerStateDeltasForRoundResponse,
  Record<string, any>
> {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private round: bigint) {
    super(c, intDecoding);
    this.round = round;
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
    return TransactionGroupLedgerStateDeltasForRoundResponse.from_obj_for_encoding(
      body
    );
  }
}
