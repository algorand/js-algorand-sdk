import { HTTPClient, HTTPClientResponse } from '../client.js';

/**
 * Base abstract class for JSON requests.
 *
 * Data: The type returned from the `do()` method
 *
 * Body: The structure of the response's body
 */
export default abstract class JSONRequest<Data> {
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
   * Use this method to unpack response ata as needed after receiving it from the `do()` method.
   * @param response - Response body received
   * @category JSONRequest
   */
  abstract prepare(response: HTTPClientResponse): Data;

  /**
   * Execute the request
   */
  protected executeRequest(
    headers?: Record<string, string>,
    customOptions?: Record<string, unknown>
  ): Promise<HTTPClientResponse> {
    return this.c.get({
      relativePath: this.path(),
      query: this.query,
      requestHeaders: headers,
      customOptions,
    });
  }

  /**
   * Execute the request and decode the response.
   * @param headers - Additional headers to send in the request. Optional.
   * @param customOptions - Additional options to pass to the underlying BaseHTTPClient. For
   *   {@link URLTokenBaseHTTPClient}, which is the default client, this will be treated as
   *   additional options to pass to the network `fetch` method.
   * @returns A promise which resolves to the parsed response object.
   * @category JSONRequest
   */
  async do(
    headers?: Record<string, string>,
    customOptions?: Record<string, unknown>
  ): Promise<Data> {
    const res = await this.executeRequest(headers, customOptions);
    return this.prepare(res);
  }

  /**
   * Execute the request, but do not process the response data in any way.
   * @param headers - Additional headers to send in the request. Optional.
   * @param customOptions - Additional options to pass to the underlying BaseHTTPClient. For
   *   {@link URLTokenBaseHTTPClient}, which is the default client, this will be treated as
   *   additional options to pass to the network `fetch` method.
   * @returns A promise which resolves to the raw response data, exactly as returned by the server.
   * @category JSONRequest
   */
  async doRaw(
    headers?: Record<string, string>,
    customOptions?: Record<string, unknown>
  ): Promise<Uint8Array> {
    const res = await this.executeRequest(headers, customOptions);
    return res.body;
  }
}
