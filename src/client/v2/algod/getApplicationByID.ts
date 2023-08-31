import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { Application } from './models/types';

export default class GetApplicationByID extends JSONRequest<
  Application,
  Record<string, any>
> {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private index: number) {
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
