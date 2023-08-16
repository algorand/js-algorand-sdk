import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

export default class GetApplicationByID extends JSONRequest {
  constructor(c: HTTPClient, private index: number) {
    super(c);
    this.index = index;
  }

  path() {
    return `/v2/applications/${this.index}`;
  }
}
