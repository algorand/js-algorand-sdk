import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import { Account } from './models/types.js';
import { Address } from '../../../encoding/address.js';

export default class AccountInformation extends JSONRequest<
  Account,
  Record<string, any>
> {
  private account: string;

  constructor(c: HTTPClient, account: string | Address) {
    super(c);
    this.account = account.toString();
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
  prepare(body: Record<string, any>): Account {
    return Account.fromDecodedJSON(body);
  }
}
