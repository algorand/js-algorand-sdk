import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

export default class AccountApplicationInformation extends JSONRequest {
  constructor(
    c: HTTPClient,
    private account: string,
    private applicationID: number
  ) {
    super(c);
    this.account = account;
    this.applicationID = applicationID;
  }

  path() {
    return `/v2/accounts/${this.account}/applications/${this.applicationID}`;
  }
}
