import { coerceToBytes } from '../../../encoding/binarydata.js';
import IntDecoding from '../../../types/intDecoding.js';
import { HTTPClient } from '../../client.js';
import { CompileResponse } from './models/types.js';
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
 * Executes compile
 */
export default class Compile extends JSONRequest<
  CompileResponse,
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
    return `/v2/teal/compile`;
  }

  sourcemap(map: boolean = true) {
    this.query.sourcemap = map;
    return this;
  }

  /**
   * Executes compile
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
    return this.prepare(res.body);
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): CompileResponse {
    return CompileResponse.from_obj_for_encoding(body);
  }
}
