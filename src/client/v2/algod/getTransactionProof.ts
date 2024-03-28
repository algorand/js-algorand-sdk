import JSONRequest from '../jsonrequest.js';
import { HTTPClient } from '../../client.js';
import { TransactionProofResponse } from './models/types.js';

export default class GetTransactionProof extends JSONRequest<
  TransactionProofResponse,
  Record<string, any>
> {
  constructor(
    c: HTTPClient,
    private round: number,
    private txID: string
  ) {
    super(c);
  }

  path() {
    return `/v2/blocks/${this.round}/transactions/${this.txID}/proof`;
  }

  /**
   * Exclude assets and application data from results
   * The type of hash function used to create the proof, must be one of: "sha512_256", "sha256"
   *
   * #### Example
   * ```typescript
   * const hashType = "sha256";
   * const round = 123456;
   * const txId = "abc123;
   * const txProof = await algodClient.getTransactionProof(round, txId)
   *        .hashType(hashType)
   *        .do();
   * ```
   *
   * @param hashType
   * @category query
   */
  hashType(hashType: string) {
    this.query.hashtype = hashType;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): TransactionProofResponse {
    return TransactionProofResponse.fromDecodedJSON(body);
  }
}
