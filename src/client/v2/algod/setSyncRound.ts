import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

export default class SetSyncRound extends JSONRequest {
  constructor(c: HTTPClient, private round: number) {
    super(c);

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
