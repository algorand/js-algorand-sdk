import JSONRequest from '../jsonrequest';
import { LedgerStateDeltaForTransactionGroup } from './models/types';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';

export default class GetTransactionGroupLedgerStateDeltasForRound extends JSONRequest<
  LedgerStateDeltaForTransactionGroup[],
  Record<string, any>[]
> {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private round: bigint) {
    super(c, intDecoding);
    this.round = round;
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/deltas/${this.round}/txn/group`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>[]): LedgerStateDeltaForTransactionGroup[] {
    let deltas = [];
    for (let i = 0; i < body.length; i++) {
      deltas = deltas.concat(
        LedgerStateDeltaForTransactionGroup.from_obj_for_encoding(body[i])
      );
    }
    return deltas;
  }
}
