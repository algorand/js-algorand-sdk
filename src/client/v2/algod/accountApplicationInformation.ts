import JSONRequest from '../jsonrequest.js';
import HTTPClient from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';

export default class AccountApplicationInformation extends JSONRequest {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private account: string,
    private applicationID: number
  ) {
    super(c, intDecoding);
    this.account = account;
    this.applicationID = applicationID;
  }

  path() {
    return `/v2/accounts/${this.account}/applications/${this.applicationID}`;
  }
}
