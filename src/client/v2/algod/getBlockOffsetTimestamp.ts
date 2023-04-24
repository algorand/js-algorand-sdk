import JSONRequest from '../jsonrequest';

export default class GetBlockOffsetTimestamp extends JSONRequest {
  // eslint-disable-next-line class-methods-use-this
  path() {
    return `/v2/devmode/blocks/offset`;
  }
}
