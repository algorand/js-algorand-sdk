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
   * Limit the number of results returned.
   *
   * @param limit - maximum number of results to return.
   * @category query
   */
  limit(limit: number) {
    this.query.limit = limit;
    return this;
  }

  /**
   * Provide the next pagination token.
   *
   * @param next - the next token from a previous response.
   * @category query
   */
  next(next: string) {
    this.query.next = next;
    return this;
  }

  /**
   * Include additional items in the response.
   *
   * @param include - the items to include (e.g. "params").
   * @category query
   */
  include(include: string) {
    this.query.include = include;
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
