import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { Asset } from './models/types';

export default class GetAssetByID extends JSONRequest<Asset> {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private index: number | bigint
  ) {
    super(c, intDecoding);
    this.index = index;
  }

  path() {
    return `/v2/assets/${this.index}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Uint8Array): Asset {
    return Asset.from_obj_for_encoding(body);
  }
}
