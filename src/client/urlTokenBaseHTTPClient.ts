import fetch from 'cross-fetch';
import {
  BaseHTTPClient,
  BaseHTTPClientResponse,
  Query,
} from './baseHTTPClient';

export interface AlgodTokenHeader {
  'X-Algo-API-Token': string;
}

export interface IndexerTokenHeader {
  'X-Indexer-API-Token': string;
}

export interface KMDTokenHeader {
  'X-KMD-API-Token': string;
}

export interface CustomTokenHeader {
  [headerName: string]: string;
}

export type TokenHeader =
  | AlgodTokenHeader
  | IndexerTokenHeader
  | KMDTokenHeader
  | CustomTokenHeader;

/**
 * Implementation of BaseHTTPClient that uses a URL and a token
 * and make the REST queries using fetch.
 * This is the default implementation of BaseHTTPClient.
 */
export class URLTokenBaseHTTPClient implements BaseHTTPClient {
  private readonly baseURL: URL;
  private readonly tokenHeader: TokenHeader;

  constructor(
    tokenHeader: TokenHeader,
    baseServer: string,
    port?: string | number,
    private defaultHeaders: Record<string, any> = {}
  ) {
    // Append a trailing slash so we can use relative paths. Without the trailing
    // slash, the last path segment will be replaced by the relative path. See
    // usage in `addressWithPath`.
    const fixedBaseServer = baseServer.endsWith('/')
      ? baseServer
      : `${baseServer}/`;
    const baseServerURL = new URL(fixedBaseServer);
    if (typeof port !== 'undefined') {
      baseServerURL.port = port.toString();
    }

    if (baseServerURL.protocol.length === 0) {
      throw new Error('Invalid base server URL, protocol must be defined.');
    }

    this.baseURL = baseServerURL;
    this.tokenHeader = tokenHeader;
  }

  /**
   * Compute the URL for a path relative to the instance's address
   * @param relativePath - A path string
   * @returns A URL string
   */
  private addressWithPath(relativePath: string) {
    let fixedRelativePath: string;
    if (relativePath.startsWith('./')) {
      fixedRelativePath = relativePath;
    } else if (relativePath.startsWith('/')) {
      fixedRelativePath = `.${relativePath}`;
    } else {
      fixedRelativePath = `./${relativePath}`;
    }
    const address = new URL(fixedRelativePath, this.baseURL);
    return address.toString();
  }

  private static async formatFetchResponse(res: any): Promise<Uint8Array> {
    // Clone the response so that it's not consumed in the json check
    const resClone = res.clone();
    try {
      // 'content-type' headers can not be relied on in all cases, so just check for json
      return Buffer.from(JSON.stringify(await res.json()));
    } catch {
      // Failures are expected to be message packed so transform it to Uint8Array
      return new Uint8Array(await resClone.arrayBuffer());
    }
  }

  private static formatFetchError(err: any): Error {
    if (err.response) {
      try {
        const decoded = JSON.parse(Buffer.from(err.response.body).toString());
        // eslint-disable-next-line no-param-reassign
        err.message = `Network request error. Received status ${err.response.status}: ${decoded.message}`;
      } catch (err2) {
        // ignore any error that happened while we are formatting the original error
      }
    }
    return err;
  }

  private static getQueryPath(query: Query<string>): string {
    // Create a queryPath for params
    let queryPath = '';
    if (query && Object.keys(query).length !== 0) {
      queryPath += `?${new URLSearchParams(query)}`;
    }
    return queryPath;
  }

  async get(
    relativePath: string,
    query?: Query<string>,
    requestHeaders: Record<string, string> = {}
  ): Promise<BaseHTTPClientResponse> {
    // Expand headers for use in fetch
    const headers = {
      ...this.tokenHeader,
      ...this.defaultHeaders,
      ...requestHeaders,
    };

    return fetch(
      `${this.addressWithPath(
        relativePath
      )}${URLTokenBaseHTTPClient.getQueryPath(query)}`,
      {
        headers,
      }
    )
      .then(
        async (res: Response): Promise<BaseHTTPClientResponse> =>
          (({
            body: await URLTokenBaseHTTPClient.formatFetchResponse(res),
            status: res.status,
            headers: res.headers,
          } as unknown) as BaseHTTPClientResponse)
      )
      .catch((err) => {
        throw URLTokenBaseHTTPClient.formatFetchError(err);
      });
  }

  async post(
    relativePath: string,
    data: Uint8Array,
    query?: Query<string>,
    requestHeaders: Record<string, string> = {}
  ): Promise<BaseHTTPClientResponse> {
    // Expand headers for use in fetch
    const headers = {
      ...this.tokenHeader,
      ...this.defaultHeaders,
      ...requestHeaders,
    };

    return fetch(
      `${this.addressWithPath(
        relativePath
      )}${URLTokenBaseHTTPClient.getQueryPath(query)}`,
      {
        method: 'POST',
        body: data,
        headers,
      }
    )
      .then(
        async (res: Response): Promise<BaseHTTPClientResponse> =>
          (({
            body: await URLTokenBaseHTTPClient.formatFetchResponse(res),
            status: res.status,
            headers: res.headers,
          } as unknown) as BaseHTTPClientResponse)
      )
      .catch((err) => {
        throw URLTokenBaseHTTPClient.formatFetchError(err);
      });
  }

  async delete(
    relativePath: string,
    data: Uint8Array,
    query?: Query<string>,
    requestHeaders: Record<string, string> = {}
  ): Promise<BaseHTTPClientResponse> {
    // Expand headers for use in fetch
    const headers = {
      ...this.tokenHeader,
      ...this.defaultHeaders,
      ...requestHeaders,
    };

    return fetch(
      `${this.addressWithPath(
        relativePath
      )}${URLTokenBaseHTTPClient.getQueryPath(query)}`,
      {
        method: 'DELETE',
        body: data,
        headers,
      }
    )
      .then(
        async (res: Response): Promise<BaseHTTPClientResponse> =>
          (({
            body: await URLTokenBaseHTTPClient.formatFetchResponse(res),
            status: res.status,
            headers: res.headers,
          } as unknown) as BaseHTTPClientResponse)
      )
      .catch((err) => {
        throw URLTokenBaseHTTPClient.formatFetchError(err);
      });
  }
}
