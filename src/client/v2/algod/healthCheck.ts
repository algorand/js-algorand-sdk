import JSONRequest from '../jsonrequest.js';
import IntDecoding from '../../../types/intDecoding.js';

/**
 * healthCheck returns an empty object iff the node is running
 */
export default class HealthCheck extends JSONRequest {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/health';
  }

  async do(headers = {}) {
    const res = await this.c.get({
      relativePath: this.path(),
      parseBody: true,
      jsonOptions: { intDecoding: IntDecoding.BIGINT },
      requestHeaders: headers,
    });
    if (!res.ok) {
      throw new Error(`Health response: ${res.status}`);
    }
    return {};
  }
}
