import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

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
 * Executes compile
 */
export default class Compile extends JSONRequest {
  constructor(c: HTTPClient, private source: string | Uint8Array) {
    super(c);
    this.source = source;
  }

  /**
   * Include sourcemap
   *
   * @param value - default true when called without passing a value
   * @category query
   */
  sourcemap(value = true) {
    this.query.sourcemap = value;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/teal/compile`;
  }

  /**
   * Executes compile
   * @param headers - A headers object
   */
  async do(headers = {}) {
    const txHeaders = setHeaders(headers);
    const res = await this.c.post(
      this.path(),
      Buffer.from(this.source),
      txHeaders,
      this.query
    );
    return res.body;
  }
}
