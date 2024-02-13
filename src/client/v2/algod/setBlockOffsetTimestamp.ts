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
