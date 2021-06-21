import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import { DryrunRequest } from './models/types';
import { setHeaders } from './compile';

export default class Dryrun extends JSONRequest {
  constructor(c: HTTPClient, private dr: DryrunRequest) {
    super(c);
    this.dr = dr;
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
    const body = JSON.stringify(this.dr.get_obj_for_encoding());

    const res = await this.c.post(this.path(), body, txHeaders);
    return res.body;
  }
}
