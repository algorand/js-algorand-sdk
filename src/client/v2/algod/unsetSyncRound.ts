import JSONRequest from '../jsonrequest';

export default class UnsetSyncRound extends JSONRequest {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/ledger/sync`;
  }

  async do(headers = {}) {
    const res = await this.c.delete(this.path(), headers);
    return res.body;
  }
}
