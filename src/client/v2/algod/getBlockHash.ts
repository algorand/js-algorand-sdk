import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';

export default class GetBlockHash extends JSONRequest {
  round: number;

  constructor(c: HTTPClient, roundNumber: number) {
    super(c);
    if (!Number.isInteger(roundNumber))
      throw Error('roundNumber should be an integer');
    this.round = roundNumber;
  }

  path() {
    return `/v2/blocks/${this.round}/hash`;
  }
}
