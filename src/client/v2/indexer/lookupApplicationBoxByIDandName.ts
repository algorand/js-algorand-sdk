import { bytesToBase64 } from '../../../encoding/binarydata.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import JSONRequest from '../jsonrequest.js';
import { Box } from './models/types.js';

export default class LookupApplicationBoxByIDandName extends JSONRequest<Box> {
  private index: bigint;

  /**
   * Returns information about indexed application boxes.
   *
   * #### Example
   * ```typescript
   * const boxName = Buffer.from("foo");
   * const boxResponse = await indexerClient
   *        .LookupApplicationBoxByIDandName(1234, boxName)
   *        .do();
   * const boxValue = boxResponse.value;
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2applicationsapplication-idbox)
   * @oaram index - application index.
   * @category GET
   */
  constructor(c: HTTPClient, index: number | bigint, boxName: Uint8Array) {
    super(c);
    this.index = BigInt(index);
    // Encode query in base64 format and append the encoding prefix.
    const encodedName = bytesToBase64(boxName);
    this.query.name = encodeURI(`b64:${encodedName}`);
  }

  /**
   * @returns `/v2/applications/${index}/box`
   */
  path() {
    return `/v2/applications/${this.index}/box`;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(response: HTTPClientResponse): Box {
    return decodeJSON(response.getJSONText(), Box);
  }
}
