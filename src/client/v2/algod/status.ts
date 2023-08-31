import JSONRequest from '../jsonrequest';
import { NodeStatusResponse } from './models/types';

export default class Status extends JSONRequest<
  NodeStatusResponse,
  Record<string, any>
> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/status';
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): NodeStatusResponse {
    return NodeStatusResponse.from_obj_for_encoding(body);
  }
}
