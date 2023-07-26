import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { Account } from './models/types';

export default class AccountInformation extends JSONRequest<Account> {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private account: string
  ) {
    super(c, intDecoding);
    this.account = account;
  }

  path() {
    return `/v2/accounts/${this.account}`;
  }

  /**
   * Exclude assets and application data from results
   *
   * #### Example
   * ```typescript
   * const address = "XBYLS2E6YI6XXL5BWCAMOA4GTWHXWENZMX5UHXMRNWWUQ7BXCY5WC5TEPA";
   * const accountInfo = await algodClient.accountInformation(address)
   *        .exclude('all')
   *        .do();
   * ```
   *
   * @param round
   * @category query
   */
  exclude(exclude: string) {
    this.query.exclude = exclude;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Uint8Array): Account {
    return Account.from_obj_for_encoding(body);
  }
}
