/* eslint-env mocha */
import assert from 'assert';
import { HTTPClient } from '../src/client/client';
import { URLTokenBaseHTTPClient } from '../src/client/urlTokenBaseHTTPClient';
import IntDecoding from '../src/types/intDecoding';
import { AlgodClient } from '../src/client/v2/algod/algod';
import * as utils from '../src/utils/utils';

describe('client', () => {
  describe('url construction', () => {
    /* eslint-disable dot-notation */
    it('should work with trivial paths', () => {
      const client = new URLTokenBaseHTTPClient({}, 'http://localhost');
      const actual = client['getURL']('/relative');
      const expected = 'http://localhost/relative';

      assert.strictEqual(actual, expected);
    });

    it('should work with number ports and trivial paths', () => {
      const client = new URLTokenBaseHTTPClient({}, 'http://localhost', 3000);
      const actual = client['getURL']('/relative');
      const expected = 'http://localhost:3000/relative';

      assert.strictEqual(actual, expected);
    });

    it('should work with complex base URLs and complex paths', () => {
      const client = new URLTokenBaseHTTPClient(
        {},
        'https://testnet-algorand.api.purestake.io/ps2/',
        8080
      );
      const actual = client['getURL']('/relative?with=query');
      const expected =
        'https://testnet-algorand.api.purestake.io:8080/ps2/relative?with=query';
      assert.strictEqual(actual, expected);
    });

    it('should work with search params', () => {
      const client = new URLTokenBaseHTTPClient({}, 'http://localhost', 3000);
      const actual = client['getURL']('/relative', {
        format: 'json',
        abc: 'xyz',
        l: '2',
      });
      const expected = 'http://localhost:3000/relative?format=json&abc=xyz&l=2';

      assert.strictEqual(actual, expected);
    });

    it('should work with search params when the requested URL already has search params', () => {
      const client = new URLTokenBaseHTTPClient(
        {},
        'https://testnet-algorand.api.purestake.io/ps2/',
        8080
      );
      const actual = client['getURL']('/relative?with=query', {
        format: 'json',
        abc: 'xyz',
        l: '2',
      });
      const expected =
        'https://testnet-algorand.api.purestake.io:8080/ps2/relative?with=query&format=json&abc=xyz&l=2';
      assert.strictEqual(actual, expected);
    });

    it('should encode and decode values correctly', () => {
      const j = '{"total":18446744073709551615, "base":42}';

      let options = {
        // intDecoding: IntDecoding.DEFAULT,
      };
      let actual = HTTPClient.parseJSON(j, 200, options);
      let expected = JSON.parse(j);
      assert.strictEqual(actual.total, expected.total);
      assert.strictEqual(typeof actual.total, 'number');

      options = {
        intDecoding: IntDecoding.BIGINT,
      };
      actual = HTTPClient.parseJSON(j, 200, options);
      expected = utils.parseJSON(j, options);
      assert.strictEqual(actual.total, expected.total);
      assert.strictEqual(typeof actual.total, 'bigint');

      options = {
        intDecoding: IntDecoding.MIXED,
      };
      actual = HTTPClient.parseJSON(j, 200, options);
      expected = utils.parseJSON(j, options);
      assert.strictEqual(actual.total, expected.total);
      assert.strictEqual(typeof actual.total, 'bigint');
      assert.strictEqual(typeof actual.base, 'number');

      options = {
        intDecoding: IntDecoding.SAFE,
      };
      assert.throws(() => HTTPClient.parseJSON(j, 200, options), Error);
    });

    it('should handle slash variations on complex paths', () => {
      const regularBase = 'https://localhost/absolute';
      const regularBaseWithFinalSlash = `${regularBase}/`;
      const client = new URLTokenBaseHTTPClient({}, regularBase);
      const clientWithSlash = new URLTokenBaseHTTPClient(
        {},
        regularBaseWithFinalSlash
      );

      const relativePath = 'relative';
      const relativePathWithInitialSlash = `/${relativePath}`;

      const clients = [client, clientWithSlash];
      const relativePaths = [relativePath, relativePathWithInitialSlash];

      const expected = 'https://localhost/absolute/relative';

      for (const c of clients) {
        for (const p of relativePaths) {
          const actual = c['getURL'](p);
          assert.strictEqual(actual, expected);
        }
      }
    });

    it('should throw an error if protocol is the empty', () => {
      const baseServer = 'localhost'; // should be http://localhost

      assert.throws(() => new URLTokenBaseHTTPClient({}, baseServer));
    });
    /* eslint-enable dot-notation */
  });
  describe('HTTPClient construction', () => {
    it('should throw an error if protocol is the empty', () => {
      const baseServer = 'localhost'; // should be http://localhost

      assert.throws(() => new HTTPClient({}, baseServer));
    });
  });
  describe('AlgodClient construction', () => {
    /* eslint-disable dot-notation */
    const baseServer = 'http://localhost';
    it('should not assign a bogus port', () => {
      const client = new AlgodClient('', baseServer);
      assert.strictEqual(client.c['bc']['baseURL']['port'], '');
    });

    it('should accept a port as an argument and assign it correctly', () => {
      const client = new AlgodClient('', baseServer, 123);
      assert.strictEqual(client.c['bc']['baseURL']['port'], '123');
    });

    it('should accept a port in the url assign it correctly', () => {
      const client = new AlgodClient('', `${baseServer}:${123}`);
      assert.strictEqual(client.c['bc']['baseURL']['port'], '123');
    });

    it('should override the port from the URL with the one specified in the argument', () => {
      const client = new AlgodClient('', `${baseServer}:${123}`, 456);
      assert.strictEqual(client.c['bc']['baseURL']['port'], '456');
    });

    it('should not provide auth request headers when the token is empty', () => {
      const client = new AlgodClient('', `${baseServer}:${123}`, 456);
      assert.deepStrictEqual(
        {
          ...client.c['bc']['tokenHeaders'],
          ...client.c['bc']['defaultHeaders'],
        },
        {}
      );
    });

    /* eslint-disable dot-notation */
  });
});
