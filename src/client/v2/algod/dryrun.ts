import * as encoding from '../../../encoding/encoding.js';
import { HTTPClient } from '../../client.js';
import JSONRequest from '../jsonrequest.js';
import { setHeaders } from './compile.js';
import { DryrunResponse } from './models/types.js';
import * as modelsv2 from './models/types.js';

export default class Dryrun extends JSONRequest<
  DryrunResponse,
  Record<string, any>
> {
  private blob: Uint8Array;

  constructor(c: HTTPClient, dr: modelsv2.DryrunRequest) {
    super(c);
    this.blob = encoding.encode(dr.get_obj_for_encoding(true));
  }

  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/teal/dryrun';
  }

  /**
   * Executes dryrun
   * @param headers - A headers object
   */
  async do(headers = {}) {
    const txHeaders = setHeaders(headers);
    const res = await this.c.post(this.path(), this.blob, null, txHeaders);
    return this.prepare(res.body);
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): DryrunResponse {
    return DryrunResponse.from_obj_for_encoding(body);
  }
}
