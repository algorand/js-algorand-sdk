import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import { AccountAssetResponse } from './models/types.js';
import { Address } from '../../../encoding/address.js';

export default class AccountAssetInformation extends JSONRequest<
  AccountAssetResponse,
  Record<string, any>
> {
  private account: string;

  constructor(
    c: HTTPClient,
    account: string | Address,
    private assetID: number
  ) {
    super(c);
    this.account = account.toString();
  }

  path() {
    return `/v2/accounts/${this.account}/assets/${this.assetID}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): AccountAssetResponse {
    return AccountAssetResponse.fromDecodedJSON(body);
  }
}
