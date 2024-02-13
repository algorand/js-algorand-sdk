import JSONRequest from '../jsonrequest.js';
import IntDecoding from '../../../types/intDecoding.js';
import { HTTPClient } from '../../client.js';

export default class SetSyncRound extends JSONRequest {
  constructor(
    c: HTTPClient,
    private round: number
  ) {
    super(c);
  }

  path() {
    return `/v2/ledger/sync/${this.round}`;
  }

  async do(headers = {}) {
    const res = await this.c.post(
      this.path(),
      null,
      { intDecoding: IntDecoding.BIGINT },
      undefined,
      headers
    );
    return res.body;
  }
}
