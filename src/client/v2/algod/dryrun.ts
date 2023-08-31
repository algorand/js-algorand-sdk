import * as encoding from '../../../encoding/encoding';
import HTTPClient from '../../client';
import JSONRequest from '../jsonrequest';
import { setHeaders } from './compile';
import { DryrunResponse } from './models/types';
import * as modelsv2 from './models/types';

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
