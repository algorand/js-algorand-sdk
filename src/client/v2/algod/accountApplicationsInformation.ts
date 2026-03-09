import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { AccountApplicationsInformationResponse } from './models/types.js';
import { Address } from '../../../encoding/address.js';

export default class AccountApplicationsInformation extends JSONRequest<AccountApplicationsInformationResponse> {
  private account: string;

  constructor(c: HTTPClient, account: string | Address) {
    super(c);
    this.account = account.toString();
  }

  path() {
    return `/v2/accounts/${this.account}/applications`;
  }

  /**
   * @param include - use `params` to include full application parameters.
   */
  include(include: string[]) {
    this.query.include = include.join(',');
    return this;
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
  prepare(
    response: HTTPClientResponse
  ): AccountApplicationsInformationResponse {
    return decodeJSON(
      response.getJSONText(),
      AccountApplicationsInformationResponse
    );
  }
}
