import assert from 'assert';
import HTTPClient from '../src/client/client';
import { URLTokenBaseHTTPClient } from '../src/client/urlTokenBaseHTTPClient';
import IntDecoding from '../src/types/intDecoding';
import * as utils from '../src/utils/utils';

describe('client', () => {
  describe('url construction', () => {
    /* eslint-disable dot-notation */
    it('should work with trivial paths', () => {
      const client = new URLTokenBaseHTTPClient({}, 'http://localhost');
      const actual = client['addressWithPath']('/relative');
      const expected = 'http://localhost/relative';

      assert.strictEqual(actual, expected);
    });

    it('should work with number ports and trivial paths', () => {
      const client = new URLTokenBaseHTTPClient({}, 'http://localhost', 3000);
      const actual = client['addressWithPath']('/relative');
      const expected = 'http://localhost:3000/relative';

      assert.strictEqual(actual, expected);
    });

    it('should work with complex base URLs and complex paths', () => {
      const client = new URLTokenBaseHTTPClient(
        {},
        'https://testnet-algorand.api.purestake.io/ps2/',
        8080
      );
      const actual = client['addressWithPath']('/relative?with=query');
      const expected =
        'https://testnet-algorand.api.purestake.io:8080/ps2/relative?with=query';
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
          const actual = c['addressWithPath'](p);
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
});
