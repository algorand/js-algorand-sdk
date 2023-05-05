import { Buffer } from 'buffer';
import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import { DisassembleResponse } from './models/types';

/**
 * Sets the default header (if not previously set)
 * @param headers - A headers object
 */
export function setHeaders(headers = {}) {
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
  constructor(c: HTTPClient, private source: string | Uint8Array) {
    super(c);
    this.source = source;
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
    const res = await this.c.post(
      this.path(),
      Buffer.from(this.source),
      this.query,
      txHeaders
    );
    return res.body;
  }
}
