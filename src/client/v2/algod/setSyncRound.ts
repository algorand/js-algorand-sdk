import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';

export default class SetSyncRound extends JSONRequest<void> {
  constructor(
    c: HTTPClient,
    private round: number
  ) {
    super(c);
  }

  path() {
    return `/v2/ledger/sync/${this.round}`;
  }

  protected executeRequest(
    headers: Record<string, string>
  ): Promise<HTTPClientResponse> {
    return this.c.post({
      relativePath: this.path(),
      data: null,
      requestHeaders: headers,
    });
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  prepare(_response: HTTPClientResponse): void {}
}
