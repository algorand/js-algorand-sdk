import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

export default class AccountAssetInformation extends JSONRequest {
  constructor(c: HTTPClient, private account: string, private assetID: number) {
    super(c);
    this.account = account;
    this.assetID = assetID;
  }

  path() {
    return `/v2/accounts/${this.account}/assets/${this.assetID}`;
  }
}
