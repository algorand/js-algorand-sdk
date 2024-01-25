import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import IntDecoding from '../../../types/intDecoding.js';
import { Application } from './models/types.js';

export default class GetApplicationByID extends JSONRequest<
  Application,
  Record<string, any>
> {
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private index: number | bigint
  ) {
    super(c, intDecoding);
    this.index = index;
  }

  path() {
    return `/v2/applications/${this.index}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): Application {
    return Application.from_obj_for_encoding(body);
  }
}
