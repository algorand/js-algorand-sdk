import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { AccountAssetsInformationResponse } from './models/types.js';
import { Address } from '../../../encoding/address.js';

export default class AccountAssetsInformation extends JSONRequest<AccountAssetsInformationResponse> {
  private account: string;

  constructor(c: HTTPClient, account: string | Address) {
    super(c);
    this.account = account.toString();
  }

  path() {
    return `/v2/accounts/${this.account}/assets`;
  }

  limit(limit: number) {
    this.query.limit = limit;
    return this;
  }

  next(next: string) {
    this.query.next = next;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): AccountAssetsInformationResponse {
    return decodeJSON(response.getJSONText(), AccountAssetsInformationResponse);
  }
}
