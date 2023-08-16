import HTTPClient from '../client';

/**
 * Base abstract class for JSON requests.
 *
 * Data: The type returned from the `do()` method
 *
 * Body: The structure of the response's body
 */
export default abstract class JSONRequest<
  Data = Record<string, any>,
  Body = Data | Uint8Array
> {
  c: HTTPClient;
  query: Record<string, any>;

  /**
   * @param client - HTTPClient object.
   */
  constructor(client: HTTPClient) {
    this.c = client;
    this.query = {};
  }

  /**
   * @returns The path of this request.
   * @category JSONRequest
   */
  abstract path(): string;

  /**
   * Prepare a JSON response before returning it.
   *
   * Use this method to change and restructure response
   * data as needed after receiving it from the `do()` method.
   * @param body - Response body received
   * @category JSONRequest
   */
  // eslint-disable-next-line class-methods-use-this
  prepare(body: Body): Data {
    return (body as unknown) as Data;
  }

  /**
   * Execute the request.
   * @param headers - Additional headers to send in the request. Optional.
   * @returns A promise which resolves to the parsed response data.
   * @category JSONRequest
   */
  async do(headers: Record<string, any> = {}): Promise<Data> {
    const res = await this.c.get(this.path(), this.query, headers);
    return this.prepare(res.body);
  }

  /**
   * Execute the request, but do not process the response data in any way.
   * @param headers - Additional headers to send in the request. Optional.
   * @returns A promise which resolves to the raw response data, exactly as returned by the server.
   * @category JSONRequest
   */
  async doRaw(headers: Record<string, any> = {}): Promise<Uint8Array> {
    const res = await this.c.get(this.path(), this.query, headers, {}, false);
    return res.body;
  }
}
