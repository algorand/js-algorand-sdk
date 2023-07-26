import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { BlockHashResponse } from './models/types';

export default class GetBlockHash extends JSONRequest<BlockHashResponse> {
  round: number;

  constructor(c: HTTPClient, intDecoding: IntDecoding, roundNumber: number) {
    super(c, intDecoding);
    if (!Number.isInteger(roundNumber))
      throw Error('roundNumber should be an integer');
    this.round = roundNumber;
  }

  path() {
    return `/v2/blocks/${this.round}/hash`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Uint8Array): BlockHashResponse {
    return BlockHashResponse.from_obj_for_encoding(body);
  }
}
