import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { BoxReference } from '../../../types';

/**
 * Given an application ID and the box name (key), return the value stored in the box.
 *
 * #### Example
 * ```typescript
 * const index = 1234;
 * const boxName = Buffer.from("foo");
 * const app = await algodClient.getApplicationBoxByName(index).name(boxName).do();
 * ```
 *
 * [Response data schema details](https://developer.algorand.org/docs/rest-apis/algod/v2/#get-v2applicationsapplication-idbox)
 * @param index - The application ID to look up.
 * @category GET
 */
export default class GetApplicationBoxByName extends JSONRequest<BoxReference> {
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
   * const boxValue = await algodClient
   *        .getApplicationBoxByName(1234)
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
