import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { AccountAssetResponse } from './models/types.js';
import { Address } from '../../../encoding/address.js';

export default class AccountAssetInformation extends JSONRequest<AccountAssetResponse> {
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
  prepare(response: HTTPClientResponse): AccountAssetResponse {
    return decodeJSON(response.getJSONText(), AccountAssetResponse);
  }
}
