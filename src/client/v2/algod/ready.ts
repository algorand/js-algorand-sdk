import JSONRequest from '../jsonrequest';

export default class Ready extends JSONRequest {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/ready`;
  }
}
