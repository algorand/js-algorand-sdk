import { bytesToBase64 } from '../../../encoding/binarydata';
import IntDecoding from '../../../types/intDecoding';
import HTTPClient from '../../client';
import JSONRequest from '../jsonrequest';
import { Box } from './models/types';

export default class LookupApplicationBoxByIDandName extends JSONRequest<
  Box,
  Record<string, any>
> {
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
  constructor(
    c: HTTPClient,
    intDecoding: IntDecoding,
    private index: number,
    boxName: Uint8Array
  ) {
    super(c, intDecoding);
    this.index = index;
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
  prepare(body: Record<string, any>): Box {
    return Box.from_obj_for_encoding(body);
  }
}
