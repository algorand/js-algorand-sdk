import JSONRequest from '../jsonrequest.js';
import { HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { NodeStatusResponse } from './models/types.js';

export default class Status extends JSONRequest<NodeStatusResponse> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/status';
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): NodeStatusResponse {
    return decodeJSON(response.getJSONText(), NodeStatusResponse);
  }
}
