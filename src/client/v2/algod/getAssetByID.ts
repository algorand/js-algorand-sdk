import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { Numeric } from '../../../types';

export default class GetAssetByID extends JSONRequest {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private index: Numeric) {
    super(c, intDecoding);
    this.index = index;
  }

  path() {
    return `/v2/assets/${this.index}`;
  }
}
