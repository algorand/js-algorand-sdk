import { coerceToBytes } from '../../../encoding/binarydata.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { DisassembleResponse } from './models/types.js';
import JSONRequest from '../jsonrequest.js';

/**
 * Sets the default header (if not previously set)
 * @param headers - A headers object
 */
export function setHeaders(headers: Record<string, any> = {}) {
  let hdrs = headers;
  if (Object.keys(hdrs).every((key) => key.toLowerCase() !== 'content-type')) {
    hdrs = { ...headers };
    hdrs['Content-Type'] = 'text/plain';
  }
  return hdrs;
}

/**
 * Executes disassemble
 */
export default class Disassemble extends JSONRequest<DisassembleResponse> {
  constructor(
    c: HTTPClient,
    private source: string | Uint8Array
  ) {
    super(c);
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/teal/disassemble`;
  }

  protected executeRequest(
    headers?: Record<string, string>,
    customOptions?: Record<string, unknown>
  ): Promise<HTTPClientResponse> {
    const txHeaders = setHeaders(headers);
    return this.c.post({
      relativePath: this.path(),
      data: coerceToBytes(this.source),
      query: this.query,
      requestHeaders: txHeaders,
      customOptions,
    });
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): DisassembleResponse {
    return decodeJSON(response.getJSONText(), DisassembleResponse);
  }
}
