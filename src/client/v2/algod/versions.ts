import JSONRequest from '../jsonrequest.js';
import { HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { Version } from './models/types.js';

/**
 * retrieves the VersionResponse from the running node
 */
export default class Versions extends JSONRequest<Version> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/versions';
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): Version {
    return decodeJSON(response.getJSONText(), Version);
  }
}
