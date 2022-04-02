import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { Numeric } from '../../../types';

export default class LookupBlock extends JSONRequest {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private round: Numeric) {
    super(c, intDecoding);
    this.round = round;
  }

  path() {
    return `/v2/blocks/${this.round}`;
  }
}
