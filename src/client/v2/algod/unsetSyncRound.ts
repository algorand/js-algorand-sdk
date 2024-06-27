import JSONRequest from '../jsonrequest.js';
import IntDecoding from '../../../types/intDecoding.js';

export default class UnsetSyncRound extends JSONRequest {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/ledger/sync`;
  }

  async do(headers = {}) {
    const res = await this.c.delete({
      relativePath: this.path(),
      data: undefined,
      parseBody: false,
      jsonOptions: { intDecoding: IntDecoding.BIGINT },
      requestHeaders: headers,
    });
    return res.body;
  }
}
