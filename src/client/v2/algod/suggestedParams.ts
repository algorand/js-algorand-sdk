import JSONRequest from '../jsonrequest.js';
import { HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { TransactionParametersResponse } from './models/types.js';
import { SuggestedParams } from '../../../types/transactions/base.js';

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
   * ConsensusVersion indicates the consensus protocol version as of the last round.
   */
  consensusVersion: string;
}

/**
 * Returns the common needed parameters for a new transaction, in a format the transaction builder expects
 */
export default class SuggestedParamsRequest extends JSONRequest<SuggestedParamsFromAlgod> {
  /* eslint-disable class-methods-use-this */
  path() {
    return '/v2/transactions/params';
  }

  prepare(response: HTTPClientResponse): SuggestedParamsFromAlgod {
    const params = decodeJSON(
      response.getJSONText(),
      TransactionParametersResponse
    );
    return {
      flatFee: false,
      fee: params.fee,
      firstValid: params.lastRound,
      lastValid: params.lastRound + BigInt(1000),
      genesisID: params.genesisId,
      genesisHash: params.genesisHash,
      minFee: params.minFee,
      consensusVersion: params.consensusVersion,
    };
  }
  /* eslint-enable class-methods-use-this */
}
