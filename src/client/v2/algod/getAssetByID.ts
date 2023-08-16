import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

export default class GetAssetByID extends JSONRequest {
  constructor(c: HTTPClient, private index: number) {
    super(c);
    this.index = index;
  }

  path() {
    return `/v2/assets/${this.index}`;
  }
}
