import JSONRequest from '../jsonrequest.js';

export default class Genesis extends JSONRequest {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return '/genesis';
  }
}
