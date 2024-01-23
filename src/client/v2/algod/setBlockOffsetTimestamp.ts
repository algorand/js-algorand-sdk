import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';

export default class SetBlockOffsetTimestamp extends JSONRequest {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private offset: number
  ) {
    super(c, intDecoding);

    this.offset = offset;
  }

  path() {
    return `/v2/devmode/blocks/offset/${this.offset}`;
  }

  async do(headers = {}) {
    const res = await this.c.post(this.path(), null, undefined, headers);
    return res.body;
  }
}
