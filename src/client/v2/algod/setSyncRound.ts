import JSONRequest from '../jsonrequest.js';
import HTTPClient from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';

export default class SetSyncRound extends JSONRequest {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private round: number) {
    super(c, intDecoding);

    this.round = round;
  }

  path() {
    return `/v2/ledger/sync/${this.round}`;
  }

  async do(headers = {}) {
    const res = await this.c.post(this.path(), headers);
    return res.body;
  }
}
