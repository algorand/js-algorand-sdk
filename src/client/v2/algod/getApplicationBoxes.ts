import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { BoxesResponse, BoxDescriptor } from './models/types';

/**
 * Given an application ID, return all the box names associated with the app.
 *
 * #### Example
 * ```typescript
 * const index = 60553466;
 * const boxesResponse = await algodClient.getApplicationBoxes(index).max(3).do();
 * const boxNames = boxesResponse.boxes.map(box => box.name);
 * ```
 *
 * [Response data schema details](https://developer.algorand.org/docs/rest-apis/algod/v2/#get-v2applicationsapplication-idboxes)
 * @param index - The application ID to look up.
 * @category GET
 */
export default class GetApplicationBoxes extends JSONRequest<
  BoxesResponse,
  Record<string, any>
> {
  constructor(c: HTTPClient, intDecoding: IntDecoding, private index: number) {
    super(c, intDecoding);
    this.index = index;
    this.query.max = 0;
  }

  /**
   * @returns `/v2/applications/${index}/boxes`
   */
  path() {
    return `/v2/applications/${this.index}/boxes`;
  }

  /**
   * Limit results for pagination.
   *
   * #### Example
   * ```typescript
   * const maxResults = 20;
   * const boxesResult = await algodClient
   *        .GetApplicationBoxes(1234)
   *        .limit(maxResults)
   *        .do();
   * ```
   *
   * @param limit - maximum number of results to return.
   * @category query
   */
  max(max: number) {
    this.query.max = max;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): BoxesResponse {
    if (body.boxes == null || !Array.isArray(body.boxes))
      throw new Error(
        `Response does not contain "boxes" array property: ${body}`
      );

    const boxes = (body.boxes as any[]).map((box, index) => {
      if (box.name == null)
        throw new Error(
          `Response box at index ${index} does not contain "name" property: ${box}`
        );
      return new BoxDescriptor(box.name);
    });

    return new BoxesResponse(boxes);
  }
}
