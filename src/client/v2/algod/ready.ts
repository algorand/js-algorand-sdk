import JSONRequest from '../jsonrequest.js';
import { HTTPClientResponse } from '../../client.js';

export default class Ready extends JSONRequest<void> {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/ready`;
  }

  // eslint-disable-next-line class-methods-use-this, @typescript-eslint/no-unused-vars
  prepare(_response: HTTPClientResponse): void {}
}
