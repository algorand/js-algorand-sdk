import { bytesToBase64 } from '../../../encoding/binarydata.js';
import { HTTPClient, HTTPClientResponse } from '../../client.js';
import { decodeJSON } from '../../../encoding/encoding.js';
import JSONRequest from '../jsonrequest.js';
import { Box } from './models/types.js';

/**
 * Given an application ID and the box name (key), return the value stored in the box.
 *
 * #### Example
 * ```typescript
 * const index = 60553466;
 * const boxName = Buffer.from("foo");
 * const boxResponse = await algodClient.getApplicationBoxByName(index, boxName).do();
 * const boxValue = boxResponse.value;
 * ```
 *
 * [Response data schema details](https://developer.algorand.org/docs/rest-apis/algod/#get-v2applicationsapplication-idbox)
 * @param index - The application ID to look up.
 * @category GET
 */
export default class GetApplicationBoxByName extends JSONRequest<Box> {
  private index: bigint;

  constructor(c: HTTPClient, index: number | bigint, name: Uint8Array) {
    super(c);
    this.index = BigInt(index);
    // Encode name in base64 format and append the encoding prefix.
    const encodedName = bytesToBase64(name);
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
