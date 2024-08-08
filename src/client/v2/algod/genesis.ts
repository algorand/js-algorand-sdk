import JSONRequest from '../jsonrequest.js';
import { HTTPClientResponse } from '../../client.js';

export default class Genesis extends JSONRequest<string> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/genesis';
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): string {
    return response.getJSONText();
  }
}
