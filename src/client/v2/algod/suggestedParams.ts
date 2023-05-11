import JSONRequest from '../jsonrequest';
import { SuggestedParamsWithMinFee } from '../../../types/transactions/base';

/**
 * Returns the common needed parameters for a new transaction, in a format the transaction builder expects
 */
export default class SuggestedParamsRequest extends JSONRequest<SuggestedParamsWithMinFee> {
  /* eslint-disable class-methods-use-this */
  path() {
    return '/v2/transactions/params';
  }

  prepare(body: Record<string, any>): SuggestedParamsWithMinFee {
    return {
      flatFee: false,
      fee: body.fee,
      firstRound: body['last-round'],
      lastRound: body['last-round'] + 1000,
      genesisID: body['genesis-id'],
      genesisHash: body['genesis-hash'],
      minFee: body['min-fee'],
    };
  }
  /* eslint-enable class-methods-use-this */
}
