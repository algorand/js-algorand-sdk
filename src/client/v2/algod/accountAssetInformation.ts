import JSONRequest from '../jsonrequest.js';
import HTTPClient from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';

export default class AccountAssetInformation extends JSONRequest {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private account: string,
    private assetID: number
  ) {
    super(c, intDecoding);
    this.account = account;
    this.assetID = assetID;
  }

  path() {
    return `/v2/accounts/${this.account}/assets/${this.assetID}`;
  }
}
