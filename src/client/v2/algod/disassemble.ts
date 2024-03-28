import { coerceToBytes } from '../../../encoding/binarydata.js';
import IntDecoding from '../../../types/intDecoding.js';
import { HTTPClient } from '../../client.js';
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
export default class Disassemble extends JSONRequest<
  DisassembleResponse,
  Record<string, any>
> {
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

  /**
   * Executes disassemble
   * @param headers - A headers object
   */
  async do(headers = {}) {
    const txHeaders = setHeaders(headers);
    const res = await this.c.post({
      relativePath: this.path(),
      data: coerceToBytes(this.source),
      parseBody: true,
      jsonOptions: { intDecoding: IntDecoding.BIGINT },
      query: this.query,
      requestHeaders: txHeaders,
    });
    return res.body;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): DisassembleResponse {
    return DisassembleResponse.fromDecodedJSON(body);
  }
}
