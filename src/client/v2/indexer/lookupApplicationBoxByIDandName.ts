import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';

export default class LookupApplicationBoxByIDandName extends JSONRequest {
  /**
   * Returns information about indexed application boxes.
   *
   * #### Example
   * ```typescript
   * const boxValue = await indexerClient.LookupApplicationBoxByIDandName(1234).do();
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2applicationsapplication-idbox)
   * @oaram index - application index.
   * @category GET
   */
  constructor(c: HTTPClient, intDecoding: IntDecoding, private index: number) {
    super(c, intDecoding);
    this.index = index;
  }

  /**
   * @returns `/v2/applications/${index}/box`
   */
  path() {
    return `/v2/applications/${this.index}/box`;
  }

  /**
   * Box name in bytes, and encodes it into a b64 string with goal encoded prefix.
   *
   * #### Example
   * ```typescript
   * const boxName = Buffer.from("foo");
   * const boxValue = await indexerClient
   *        .LookupApplicationBoxByIDandName(1234)
   *        .name(boxName)
   *        .do();
   * ```
   *
   * @param name - name of box in bytes.
   * @category query
   */
  name(name: Uint8Array) {
    // Encode query in base64 format and append the encoding prefix.
    let encodedName = Buffer.from(name).toString('base64');
    encodedName = `b64:${encodedName}`;
    this.query.name = encodeURI(encodedName);
    return this;
  }
}
