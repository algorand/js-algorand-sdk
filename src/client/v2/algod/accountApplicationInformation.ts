import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { AccountApplicationResponse } from './models/types.js';
import { Address } from '../../../encoding/address.js';

export default class AccountApplicationInformation extends JSONRequest<AccountApplicationResponse> {
  private account: string;
  private applicationID: bigint;

  constructor(
    c: HTTPClient,
    account: string | Address,
    applicationID: number | bigint
  ) {
    super(c);
    this.account = account.toString();
    this.applicationID = BigInt(applicationID);
  }

  path() {
    return `/v2/accounts/${this.account}/applications/${this.applicationID}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): AccountApplicationResponse {
    return decodeJSON(response.getJSONText(), AccountApplicationResponse);
  }
}
