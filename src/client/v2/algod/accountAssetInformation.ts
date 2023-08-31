import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { AccountAssetResponse } from './models/types';

export default class AccountAssetInformation extends JSONRequest<
  AccountAssetResponse,
  Record<string, any>
> {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private account: string,
    private assetID: number
  ) {
    super(c, intDecoding);
    this.account = account;
    this.assetID = assetID;
  }

  path() {
    return `/v2/accounts/${this.account}/assets/${this.assetID}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): AccountAssetResponse {
    return AccountAssetResponse.from_obj_for_encoding(body);
  }
}
