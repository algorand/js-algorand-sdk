import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { encodeURLFromBytes } from '../../../encoding/uri';

export default class GetApplicationBoxByName extends JSONRequest {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private index: number,
    private boxName: Uint8Array
  ) {
    super(c, intDecoding);
    this.index = index;
    this.boxName = boxName;
  }

  path() {
    const encodedBoxName = encodeURLFromBytes(this.boxName);
    return `/v2/applications/${this.index}/boxes/${encodedBoxName}`;
  }
}
