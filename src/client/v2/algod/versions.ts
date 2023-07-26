import JSONRequest from '../jsonrequest';
import { Version } from './models/types';

/**
 * retrieves the VersionResponse from the running node
 */
export default class Versions extends JSONRequest<Version> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/versions';
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Uint8Array): Version {
    return Version.from_obj_for_encoding(body);
  }
}
