import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';

export default class SetBlockOffsetTimestamp extends JSONRequest {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private offset: number) {
    super(c, intDecoding);

    this.offset = offset;
  }

  path() {
    return `/v2/devmode/blocks/offset/${this.offset}`;
  }

  async do(headers = {}) {
    const res = await this.c.post(this.path(), headers);
    return res.body;
  }
}
