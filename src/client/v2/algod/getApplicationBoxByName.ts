import { bytesToBase64 } from '../../../encoding/binarydata.js';
import { HTTPClient } from '../../client.js';
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
export default class GetApplicationBoxByName extends JSONRequest<
  Box,
  Record<string, any>
> {
  constructor(
    c: HTTPClient,
    private index: number,
    name: Uint8Array
  ) {
    super(c);
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
  prepare(body: Record<string, any>): Box {
    return Box.fromEncodingData(Box.encodingSchema.fromPreparedJSON(body));
  }
}
