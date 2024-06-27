import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import { Application } from './models/types.js';

export default class GetApplicationByID extends JSONRequest<
  Application,
  Record<string, any>
> {
  constructor(
    c: HTTPClient,
    private index: number | bigint
  ) {
    super(c);
  }

  path() {
    return `/v2/applications/${this.index}`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): Application {
    return Application.fromEncodingData(
      Application.encodingSchema.fromPreparedJSON(body)
    );
  }
}
