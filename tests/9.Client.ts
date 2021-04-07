import assert from 'assert';
import HTTPClient from '../src/client/client';

describe('client', () => {
  describe('url construction', () => {
    /* eslint-disable dot-notation */
    it('should work with trivial paths', () => {
      const client = new HTTPClient({}, 'http://localhost');
      const actual = client['addressWithPath']('/relative');
      const expected = 'http://localhost/relative';

      assert.strictEqual(actual, expected);
    });

    it('should work with number ports and trivial paths', () => {
      const client = new HTTPClient({}, 'http://localhost', 3000);
      const actual = client['addressWithPath']('/relative');
      const expected = 'http://localhost:3000/relative';

      assert.strictEqual(actual, expected);
    });

    it('should work with complex base URLs and complex paths', () => {
      const client = new HTTPClient(
        {},
        'https://testnet-algorand.api.purestake.io/ps2/',
        8080
      );
      const actual = client['addressWithPath']('/relative?with=query');
      const expected =
        'https://testnet-algorand.api.purestake.io:8080/ps2/relative?with=query';
      assert.strictEqual(actual, expected);
    });

    it('should handle slash variations on complex paths', () => {
      const regularBase = 'https://localhost/absolute';
      const regularBaseWithFinalSlash = `${regularBase}/`;
      const client = new HTTPClient({}, regularBase);
      const clientWithSlash = new HTTPClient({}, regularBaseWithFinalSlash);

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

      assert.throws(() => new HTTPClient({}, baseServer));
    });
    /* eslint-enable dot-notation */
  });
});
