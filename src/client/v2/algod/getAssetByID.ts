import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';
import { Asset } from './models/types.js';

export default class GetAssetByID extends JSONRequest<
  Asset,
  Record<string, any>
> {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private index: number
  ) {
    super(c, intDecoding);
    this.index = index;
  }

  path() {
    return `/v2/assets/${this.index}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): Asset {
    return Asset.from_obj_for_encoding(body);
  }
}
