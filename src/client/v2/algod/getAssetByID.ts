import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { Asset } from './models/types.js';

export default class GetAssetByID extends JSONRequest<Asset> {
  constructor(
    c: HTTPClient,
    private index: number | bigint
  ) {
    super(c);
  }

  path() {
    return `/v2/assets/${this.index}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): Asset {
    return decodeJSON(response.getJSONText(), Asset);
  }
}
