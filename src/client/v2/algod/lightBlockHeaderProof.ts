import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

export default class LightBlockHeaderProof extends JSONRequest {
  constructor(c: HTTPClient, private round: number) {
    super(c);

    this.round = round;
  }

  path() {
    return `/v2/blocks/${this.round}/lightheader/proof`;
  }
}
