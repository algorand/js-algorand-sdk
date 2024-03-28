import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import { Asset } from './models/types.js';

export default class GetAssetByID extends JSONRequest<
  Asset,
  Record<string, any>
> {
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
  prepare(body: Record<string, any>): Asset {
    return Asset.fromDecodedJSON(body);
  }
}
