import JSONRequest from '../jsonrequest';
import HTTPClient from '../../client';
import IntDecoding from '../../../types/intDecoding';
import { BoxDescriptor } from '../algod/models/types';

export interface SearchForApplicationBoxesResponse {
  applicationId: number;
  boxes: BoxDescriptor[];
  nextToken?: string;
}

export default class SearchForApplicationBoxes extends JSONRequest<
  SearchForApplicationBoxesResponse,
  Record<string, any>
> {
  /**
   * Returns information about indexed application boxes.
   *
   * #### Example
   * ```typescript
   * const maxResults = 20;
   * const appID = 1234;
   *
   * const responsePage1 = await indexerClient
   *        .searchForApplicationBoxes(appID)
   *        .limit(maxResults)
   *        .do();
   * const boxNamesPage1 = responsePage1.boxes.map(box => box.name);
   *
   * const responsePage2 = await indexerClient
   *        .searchForApplicationBoxes(appID)
   *        .limit(maxResults)
   *        .nextToken(responsePage1.nextToken)
   *        .do();
   * const boxNamesPage2 = responsePage2.boxes.map(box => box.name);
   * ```
   *
   * [Response data schema details](https://developer.algorand.org/docs/rest-apis/indexer/#get-v2applicationsapplication-idboxes)
   * @oaram index - application index.
   * @category GET
   */
  constructor(c: HTTPClient, intDecoding: IntDecoding, private index: number) {
    super(c, intDecoding);
    this.index = index;
  }

  /**
   * @returns `/v2/applications/${index}/boxes`
   */
  path() {
    return `/v2/applications/${this.index}/boxes`;
  }

  /**
   * Specify the next page of results.
   *
   * #### Example
   * ```typescript
   * const maxResults = 20;
   * const appID = 1234;
   *
   * const responsePage1 = await indexerClient
   *        .searchForApplicationBoxes(appID)
   *        .limit(maxResults)
   *        .do();
   * const boxNamesPage1 = responsePage1.boxes.map(box => box.name);
   *
   * const responsePage2 = await indexerClient
   *        .searchForApplicationBoxes(appID)
   *        .limit(maxResults)
   *        .nextToken(responsePage1.nextToken)
   *        .do();
   * const boxNamesPage2 = responsePage2.boxes.map(box => box.name);
   * ```
   * @param nextToken - provided by the previous results.
   * @category query
   */
  nextToken(next: string) {
    this.query.next = next;
    return this;
  }

  /**
   * Limit results for pagination.
   *
   * #### Example
   * ```typescript
   * const maxResults = 20;
   * const boxesResponse = await indexerClient
   *        .searchForApplicationBoxes(1234)
   *        .limit(maxResults)
   *        .do();
   * ```
   *
   * @param limit - maximum number of results to return.
   * @category query
   */
  limit(limit: number) {
    this.query.limit = limit;
    return this;
  }

  // eslint-disable-next-line class-methods-use-this
  prepare(body: Record<string, any>): SearchForApplicationBoxesResponse {
    if (typeof body['application-id'] !== 'number') {
      throw new Error(
        `Response does not contain "application-id" number property: ${body}`
      );
    }
    const applicationId: number = body['application-id'];

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

    const response: SearchForApplicationBoxesResponse = {
      applicationId,
      boxes,
    };
    if (body['next-token'] != null) {
      response.nextToken = body['next-token'];
    }

    return response;
  }
}
