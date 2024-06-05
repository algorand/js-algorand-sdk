import JSONRequest from '../jsonrequest.js';
import { GetBlockTimeStampOffsetResponse } from './models/types.js';

export default class GetBlockOffsetTimestamp extends JSONRequest<
  GetBlockTimeStampOffsetResponse,
  Record<string, any>
> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/devmode/blocks/offset`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): GetBlockTimeStampOffsetResponse {
    return GetBlockTimeStampOffsetResponse.fromEncodingData(
      GetBlockTimeStampOffsetResponse.encodingSchema.fromPreparedJSON(body)
    );
  }
}
