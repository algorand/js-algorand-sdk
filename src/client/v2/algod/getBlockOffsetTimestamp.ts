import JSONRequest from '../jsonrequest';
import { GetBlockTimeStampOffsetResponse } from './models/types';

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
    return GetBlockTimeStampOffsetResponse.from_obj_for_encoding(body);
  }
}
