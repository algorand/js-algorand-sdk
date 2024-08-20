import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON, encodeMsgpack } from '../../../encoding/encoding.js';
import JSONRequest from '../jsonrequest.js';
import { setHeaders } from './compile.js';
import { DryrunResponse } from './models/types.js';
import * as modelsv2 from './models/types.js';

export default class Dryrun extends JSONRequest<DryrunResponse> {
  private blob: Uint8Array;

  constructor(c: HTTPClient, dr: modelsv2.DryrunRequest) {
    super(c);
    this.blob = encodeMsgpack(dr);
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/teal/dryrun';
  }

  protected executeRequest(
    headers?: Record<string, string>,
    customOptions?: Record<string, unknown>
  ): Promise<HTTPClientResponse> {
    const txHeaders = setHeaders(headers);
    return this.c.post({
      relativePath: this.path(),
      data: this.blob,
      requestHeaders: txHeaders,
      customOptions,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): DryrunResponse {
    return decodeJSON(response.getJSONText(), DryrunResponse);
  }
}
