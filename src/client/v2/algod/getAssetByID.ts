import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { Asset } from './models/types.js';

export default class GetAssetByID extends JSONRequest<Asset> {
  private index: bigint;

  constructor(c: HTTPClient, index: number | bigint) {
    super(c);
    this.index = BigInt(index);
  }

  path() {
    return `/v2/assets/${this.index}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): Asset {
    return decodeJSON(response.getJSONText(), Asset);
  }
}
