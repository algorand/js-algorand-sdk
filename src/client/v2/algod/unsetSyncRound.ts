import JSONRequest from '../jsonrequest.js';
import { HTTPClientResponse } from '../../client.js';

export default class UnsetSyncRound extends JSONRequest<void> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/ledger/sync`;
  }

  protected executeRequest(
    headers?: Record<string, string>,
    customOptions?: Record<string, unknown>
  ): Promise<HTTPClientResponse> {
    return this.c.delete({
      relativePath: this.path(),
      data: undefined,
      requestHeaders: headers,
      customOptions,
    });
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  prepare(_response: HTTPClientResponse): void {}
}
