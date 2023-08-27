import JSONRequest from '../jsonrequest.js';
import HTTPClient from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';

export default class GetAssetByID extends JSONRequest {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private index: number) {
    super(c, intDecoding);
    this.index = index;
  }

  path() {
    return `/v2/assets/${this.index}`;
  }
}
