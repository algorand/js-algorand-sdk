import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

export default class AccountInformation extends JSONRequest {
  constructor(c: HTTPClient, private account: string) {
    super(c);
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
}
