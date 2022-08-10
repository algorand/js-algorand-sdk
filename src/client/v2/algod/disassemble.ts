import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import { setHeaders } from './compile';

/**
 * Executes disassemble
 */
export default class Disassemble extends JSONRequest {
  constructor(c: HTTPClient, private bytecode: string) {
    super(c);
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/teal/disassemble`;
  }

  sourcemap(map: boolean = true) {
    this.query.sourcemap = map;
    return this;
  }

  /**
   * Executes disassemble
   * @param headers - A headers object
   */
  async do(headers = {}) {
    const txHeaders = setHeaders(headers, 'application/x-binary');
    const res = await this.c.post(
      this.path(),
      Buffer.from(this.bytecode, 'base64'),
      txHeaders,
      this.query
    );
    return res.body;
  }
}
