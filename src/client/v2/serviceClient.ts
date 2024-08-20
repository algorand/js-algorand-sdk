import { HTTPClient } from '../client.js';
import { BaseHTTPClient } from '../baseHTTPClient.js';
import { TokenHeader } from '../urlTokenBaseHTTPClient.js';

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
  headerIdentifier: TokenHeaderIdentifier,
  token: string = ''
): TokenHeader {
  const tokenHeader: TokenHeader = {};
  if (token === '') {
    return tokenHeader;
  }
  tokenHeader[headerIdentifier] = token;
  return tokenHeader;
}

function isBaseHTTPClient(
  tbc: string | TokenHeader | BaseHTTPClient
): tbc is BaseHTTPClient {
  return typeof (tbc as BaseHTTPClient).get === 'function';
}

/**
 * Abstract service client to encapsulate shared AlgodClient and IndexerClient logic
 */
export default abstract class ServiceClient {
  /** @ignore */
  c: HTTPClient;

  constructor(
    tokenHeaderIdentifier: TokenHeaderIdentifier,
    tokenHeaderOrStrOrBaseClient: string | TokenHeader | BaseHTTPClient,
    baseServer: string,
    port?: string | number,
    defaultHeaders: Record<string, any> = {}
  ) {
    if (isBaseHTTPClient(tokenHeaderOrStrOrBaseClient)) {
      // we are using a base client
      this.c = new HTTPClient(tokenHeaderOrStrOrBaseClient);
    } else {
      // Accept token header as string or object
      // - workaround to allow backwards compatibility for multiple headers
      let tokenHeader: TokenHeader;
      if (typeof tokenHeaderOrStrOrBaseClient === 'string') {
        tokenHeader = convertTokenStringToTokenHeader(
          tokenHeaderIdentifier,
          tokenHeaderOrStrOrBaseClient
        );
      } else {
        tokenHeader = tokenHeaderOrStrOrBaseClient;
      }

      this.c = new HTTPClient(tokenHeader, baseServer, port, defaultHeaders);
    }
  }
}
