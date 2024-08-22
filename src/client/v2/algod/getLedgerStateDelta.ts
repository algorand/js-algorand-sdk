import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeMsgpack } from '../../../encoding/encoding.js';
import { LedgerStateDelta } from '../../../types/statedelta.js';

export default class GetLedgerStateDelta extends JSONRequest<LedgerStateDelta> {
  private round: bigint;

  constructor(c: HTTPClient, round: number | bigint) {
    super(c);
    this.round = BigInt(round);
    this.query = { format: 'msgpack' };
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/deltas/${this.round}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): LedgerStateDelta {
    return decodeMsgpack(response.body, LedgerStateDelta);
  }
}
