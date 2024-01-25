import JSONRequest from '../jsonrequest.js';
import { SuggestedParams } from '../../../types/transactions/base.js';

export interface SuggestedParamsFromAlgod extends SuggestedParams {
  flatFee: boolean;
  fee: bigint;
  minFee: bigint;
  firstValid: bigint;
  lastValid: bigint;
  genesisID: string;
  genesisHash: string;
}

/**
 * Returns the common needed parameters for a new transaction, in a format the transaction builder expects
 */
export default class SuggestedParamsRequest extends JSONRequest<
  SuggestedParamsFromAlgod,
  Record<string, any>
> {
  /* eslint-disable class-methods-use-this */
  path() {
    return '/v2/transactions/params';
  }

  prepare(body: Record<string, any>): SuggestedParamsFromAlgod {
    return {
      flatFee: false,
      fee: BigInt(body.fee),
      firstValid: BigInt(body['last-round']),
      lastValid: BigInt(body['last-round']) + BigInt(1000),
      genesisID: body['genesis-id'],
      genesisHash: body['genesis-hash'],
      minFee: BigInt(body['min-fee']),
    };
  }
  /* eslint-enable class-methods-use-this */
}
