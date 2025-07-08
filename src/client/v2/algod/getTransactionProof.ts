import JSONRequest from '../jsonrequest.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import { TransactionProof } from './models/types.js';

export default class GetTransactionProof extends JSONRequest<TransactionProof> {
  private round: bigint;

  constructor(
    c: HTTPClient,
    round: number | bigint,
    private txID: string
  ) {
    super(c);
    this.round = BigInt(round);
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
  prepare(response: HTTPClientResponse): TransactionProof {
    return decodeJSON(response.getJSONText(), TransactionProof);
  }
}
