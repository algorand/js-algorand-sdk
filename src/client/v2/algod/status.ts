import JSONRequest from '../jsonrequest';
import { NodeStatusResponse } from './models/types';

export default class Status extends JSONRequest<NodeStatusResponse> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/v2/status';
  }
}
