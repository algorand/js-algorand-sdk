import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';

export default class SetBlockOffsetTimestamp extends JSONRequest<void> {
  private offset: bigint;

  constructor(c: HTTPClient, offset: number | bigint) {
    super(c);
    this.offset = BigInt(offset);
  }

  path() {
    return `/v2/devmode/blocks/offset/${this.offset}`;
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
