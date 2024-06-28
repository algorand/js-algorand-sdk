import JSONRequest from '../jsonrequest.js';
import { HealthCheck } from './models/types.js';

/**
 * Returns the health object for the service.
 * Returns 200 if healthy.
 *
 * #### Example
 * ```typescript
 * const health = await indexerClient.makeHealthCheck().do();
 * ```
 *
 * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-health)
 * @category GET
 */
export default class MakeHealthCheck extends JSONRequest<
  HealthCheck,
  Record<string, any>
> {
  /**
   * @returns `/health`
   */
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/health';
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): HealthCheck {
    return HealthCheck.fromEncodingData(
      HealthCheck.encodingSchema.fromPreparedJSON(body)
    );
  }
}
