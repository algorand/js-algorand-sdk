import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';
import { AccountApplicationResponse } from './models/types.js';
import { Address } from '../../../encoding/address.js';

export default class AccountApplicationInformation extends JSONRequest<
  AccountApplicationResponse,
  Record<string, any>
> {
  private account: string;

  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    account: string | Address,
    private applicationID: number
  ) {
    super(c, intDecoding);
    this.account = account.toString();
  }

  path() {
    return `/v2/accounts/${this.account}/applications/${this.applicationID}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): AccountApplicationResponse {
    return AccountApplicationResponse.from_obj_for_encoding(body);
  }
}
