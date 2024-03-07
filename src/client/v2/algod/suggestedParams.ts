import JSONRequest from '../jsonrequest.js';
import { SuggestedParams } from '../../../types/transactions/base.js';
import { base64ToBytes } from '../../../encoding/binarydata.js';

/**
 * SuggestedParamsFromAlgod contains the suggested parameters for a new transaction, as returned by
 * the algod REST API.
 *
 * This exists because the SuggestedParams interface is purposefully general (e.g. fee can be a
 * number or a bigint), and compared to that the algod API returns a narrower type.
 */
export interface SuggestedParamsFromAlgod extends SuggestedParams {
  flatFee: boolean;
  fee: bigint;
  minFee: bigint;
  firstValid: bigint;
  lastValid: bigint;
  genesisID: string;
  genesisHash: Uint8Array;

  /**
   * TODO description
   */
  consensusVersion: string;
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
      genesisHash: base64ToBytes(body['genesis-hash']),
      minFee: BigInt(body['min-fee']),
      consensusVersion: body['consensus-version'],
    };
  }
  /* eslint-enable class-methods-use-this */
}
