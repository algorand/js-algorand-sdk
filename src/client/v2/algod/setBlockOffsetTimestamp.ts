import JSONRequest from '../jsonrequest.js';
import IntDecoding from '../../../types/intDecoding.js';
import { HTTPClient } from '../../client.js';

export default class SetBlockOffsetTimestamp extends JSONRequest {
  constructor(
    c: HTTPClient,
    private offset: number
  ) {
    super(c);
  }

  path() {
    return `/v2/devmode/blocks/offset/${this.offset}`;
  }

  async do(headers = {}) {
    const res = await this.c.post({
      relativePath: this.path(),
      data: null,
      parseBody: true,
      jsonOptions: { intDecoding: IntDecoding.BIGINT },
      requestHeaders: headers,
    });
    return res.body;
  }
}
