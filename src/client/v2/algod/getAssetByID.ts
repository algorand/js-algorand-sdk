import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { Asset } from './models/types';

export default class GetAssetByID extends JSONRequest<Asset> {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private index: number) {
    super(c, intDecoding);
    this.index = index;
  }

  path() {
    return `/v2/assets/${this.index}`;
  }
}
