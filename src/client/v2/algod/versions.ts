import JSONRequest from '../jsonrequest.js';
import { Version } from './models/types.js';

/**
 * retrieves the VersionResponse from the running node
 */
export default class Versions extends JSONRequest<
  Version,
  Record<string, any>
> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/versions';
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): Version {
    return Version.fromEncodingData(
      Version.encodingSchema.fromPreparedJSON(body)
    );
  }
}
