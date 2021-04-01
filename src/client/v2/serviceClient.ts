import HTTPClient, { TokenHeader } from '../client';
import IntDecoding from '../../types/intDecoding';

export type TokenHeaderIdentifier =
  | 'X-Indexer-API-Token'
  | 'X-KMD-API-Token'
  | 'X-Algo-API-Token'
  | string;

/**
 * Convert a token string to a token header
 * @param token - The token string
 * @param headerIdentifier - An identifier for the token header
 */
function convertTokenStringToTokenHeader(
  token: string = '',
  headerIdentifier: TokenHeaderIdentifier
): TokenHeader {
  const tokenHeader = {};
  tokenHeader[headerIdentifier] = token;
  return tokenHeader as TokenHeader;
}

/**
 * Abstract service client to encapsulate shared AlgodClient and IndexerClient logic
 */
export default abstract class ServiceClient {
  c: HTTPClient;
  intDecoding: IntDecoding;

  constructor(
    tokenHeaderIdentifier: TokenHeaderIdentifier,
    tokenHeaderOrStr: string | TokenHeader,
    baseServer: string,
    port?: string | number,
    defaultHeaders: Record<string, any> = {}
  ) {
    // Accept token header as string or object
    // - workaround to allow backwards compatibility for multiple headers
    let tokenHeader: TokenHeader;
    if (typeof tokenHeaderOrStr === 'string') {
      tokenHeader = convertTokenStringToTokenHeader(
        tokenHeaderOrStr,
        tokenHeaderIdentifier
      );
    } else {
      tokenHeader = tokenHeaderOrStr;
    }

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
