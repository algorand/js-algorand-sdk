import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';

export default class SetSyncRound extends JSONRequest<void> {
  private round: bigint;

  constructor(c: HTTPClient, round: number | bigint) {
    super(c);
    this.round = BigInt(round);
  }

  path() {
    return `/v2/ledger/sync/${this.round}`;
  }

  protected executeRequest(
    headers?: Record<string, string>,
    customOptions?: Record<string, unknown>
  ): Promise<HTTPClientResponse> {
    return this.c.post({
      relativePath: this.path(),
      data: null,
      requestHeaders: headers,
      customOptions,
    });
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  prepare(_response: HTTPClientResponse): void {}
}
