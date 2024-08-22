import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { Application } from './models/types.js';

export default class GetApplicationByID extends JSONRequest<Application> {
  private index: bigint;

  constructor(c: HTTPClient, index: number | bigint) {
    super(c);
    this.index = BigInt(index);
  }

  path() {
    return `/v2/applications/${this.index}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): Application {
    return decodeJSON(response.getJSONText(), Application);
  }
}
