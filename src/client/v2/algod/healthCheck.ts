import JSONRequest from '../jsonrequest.js';
import { HTTPClientResponse } from '../../client.js';

/**
 * healthCheck returns an empty object iff the node is running
 */
export default class HealthCheck extends JSONRequest<void> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/health';
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  prepare(_response: HTTPClientResponse): void {}
}
