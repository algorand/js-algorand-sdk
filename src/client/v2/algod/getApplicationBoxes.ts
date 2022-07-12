import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { BoxesResponse } from './models/types';

export default class GetApplicationBoxes extends JSONRequest<BoxesResponse> {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private index: number) {
    super(c, intDecoding);
    this.index = index;
    this.query.max = 0;
  }

  path() {
    return `/v2/applications/${this.index}/boxes`;
  }

  // max sets the maximum number of results to be returned from this query.
  max(max: number) {
    this.query.max = max;
    return this;
  }
}
