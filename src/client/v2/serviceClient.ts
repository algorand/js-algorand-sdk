import HTTPClient, { TokenHeader } from '../client';
import IntDecoding from '../../types/intDecoding';

/**
 * Convert a token string to a token header
 * @param token - The token string
 */
function convertTokenStringToTokenHeader(
  token: string,
  className: string
): TokenHeader {
  switch (className) {
    case 'IndexerClient':
      return {
        'X-Indexer-API-Token': token,
      };
    case 'Kmd':
      return {
        'X-KMD-API-Token': token,
      };
    case 'AlgodClient':
    default:
      return {
        'X-Algo-API-Token': token,
      };
  }
}

/**
 * Abstract service client to encapsulate shared AlgodClient and IndexerClient logic
 */
export default abstract class ServiceClient {
  c: HTTPClient;
  intDecoding: IntDecoding;

  constructor(
    tokenHeaderOrStr: string | TokenHeader,
    baseServer: string,
    port?: number,
    defaultHeaders: Record<string, any> = {}
  ) {
    // Accept token header as string or object
    // - workaround to allow backwards compatibility for multiple headers
    const tokenHeader =
      typeof tokenHeaderOrStr === 'string'
        ? convertTokenStringToTokenHeader(
            tokenHeaderOrStr,
            this.constructor.name
          )
        : tokenHeaderOrStr;

    this.c = new HTTPClient(tokenHeader, baseServer, port, defaultHeaders);
    this.intDecoding = IntDecoding.DEFAULT;
  }

  /**
   * Set the default int decoding method for all JSON requests this client creates.
   * @param {"default" | "safe" | "mixed" | "bigint"} method The method to use when parsing the
   *   response for request. Must be one of "default", "safe", "mixed", or "bigint". See
   *   JSONRequest.setIntDecoding for more details about what each method does.
   */
  setIntEncoding(method: IntDecoding) {
    this.intDecoding = method;
  }

  /**
   * Get the default int decoding method for all JSON requests this client creates.
   */
  getIntEncoding() {
    return this.intDecoding;
  }
}
