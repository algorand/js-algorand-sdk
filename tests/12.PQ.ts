/* eslint-env mocha */
import assert from 'assert';
import {
  decodeAddress,
  ALGORAND_ADDRESS_LENGTH,
  addressFromPQKey,
} from '../src/encoding/address.js';
import {
  addressWithSignersFromRawFalcon1024Signer,
  Falcon1024SigningKey,
  FALCON_1024_SCHEME,
} from '../src/falcon-signer.js';
import pqTxnData from './pq_test_data/txn.json';
import {
  decodeMsgpack,
  signTransactionWithSigner,
  Transaction,
} from '../src/main.js';
import { arrayEqual, concatArrays } from '../src/utils/utils.js';
import { genericHash } from '../src/nacl/naclWrappers.js';

// falcon-1024 ships a browser-oriented WASM build that locates its `.wasm` file
// via `fetch(new URL("falcon_wasm.wasm", import.meta.url))`. Node's fetch cannot
// read `file://` URLs, so under the Node test runner we shim fetch to serve the
// local `.wasm` from disk. In the browser test runner webpack bundles the wasm
// and real fetch works, so this shim (and its `node:` imports, skipped by the
// webpackIgnore magic comment) is never used.
async function installNodeWasmFetchShim(): Promise<void> {
  const isNode =
    typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null;
  if (!isNode) return;

  const { readFile } = await import(
    /* webpackIgnore: true */ 'node:fs/promises'
  );
  const { fileURLToPath } = await import(/* webpackIgnore: true */ 'node:url');

  const originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (async (input: unknown, init?: unknown) => {
    const url = input instanceof URL ? input.href : String(input);
    if (url.startsWith('file://') && url.endsWith('.wasm')) {
      const bytes = await readFile(fileURLToPath(url));
      return new Response(bytes, {
        headers: { 'Content-Type': 'application/wasm' },
      });
    }
    return originalFetch(
      input as Parameters<typeof fetch>[0],
      init as Parameters<typeof fetch>[1]
    );
  }) as typeof fetch;
}

// falcon-1024 is ESM-only; a static import would be transpiled to require() by
// tsx (the project is not "type": "module") and fail to resolve. Load it
// dynamically instead, after the wasm shim is in place.
let generateKey: (seed?: Uint8Array) => {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
};

// Mirrors Go's falconPublicKeyForPQAddressTest: a 48-byte zero-filled seed with
// only the first byte set.
function falconPublicKeyForSeedByte(firstSeedByte: number): Uint8Array {
  const seed = new Uint8Array(48);
  seed[0] = firstSeedByte;
  return generateKey(seed).publicKey;
}

describe('PQ Address', function pqAddressSuite() {
  // Allow time for WASM instantiation and Falcon key generation.
  this.timeout(20000);

  before(async () => {
    await installNodeWasmFetchShim();
    ({ generateKey } = await import('falcon-1024'));
  });

  describe('known answers (canonical salt)', () => {
    // These are the Go known-answer rows whose explicit salt equals the
    // canonical salt for that key, so they are reachable via fromPQKey.
    const testCases = [
      {
        name: 'seed byte 0 (canonical salt 0)',
        firstSeedByte: 0,
        expectedAddress:
          '7ZQ6VZDWW5NECRV3XMW6L7YX743PFC55IEVS4X3GDHIW4NBMYLYTJT4VTA',
      },
      {
        name: 'seed byte 1 (canonical salt 1)',
        firstSeedByte: 1,
        expectedAddress:
          '4X6LFIO4F7WZFXM24J567HAXW4FHXWKGVGPNCA4SMPPAYMZYSHYTB6XXC4',
      },
    ];

    testCases.forEach((tc) => {
      it(`derives the expected address for ${tc.name}`, () => {
        const publicKey = falconPublicKeyForSeedByte(tc.firstSeedByte);

        const { address } = addressFromPQKey(FALCON_1024_SCHEME, publicKey);
        assert.strictEqual(address.toString(), tc.expectedAddress);

        // Go's addrAgain check: derivation is deterministic.
        const { address: addrAgain } = addressFromPQKey(
          FALCON_1024_SCHEME,
          publicKey
        );

        assert.ok(address.equals(addrAgain));
        assert.strictEqual(address.toString(), addrAgain.toString());
      });
    });
  });

  describe('address validity', () => {
    it('produces a well-formed, round-trippable address', () => {
      const publicKey = falconPublicKeyForSeedByte(1);
      const { address } = addressFromPQKey(FALCON_1024_SCHEME, publicKey);

      const encoded = address.toString();
      assert.strictEqual(encoded.length, ALGORAND_ADDRESS_LENGTH);
      assert.ok(decodeAddress(encoded).equals(address));
    });
  });

  describe('scheme length validation', () => {
    // Port of TestCanonicalPQAddressSaltRejectsInvalidSchemeLength.
    ['', 'x', 'xyz'].forEach((scheme) => {
      it(`rejects scheme ${JSON.stringify(scheme)}`, () => {
        const publicKey = falconPublicKeyForSeedByte(0);
        assert.throws(
          () =>
            addressFromPQKey(new TextEncoder().encode(scheme), publicKey)
              .address,
          /invalid PQ scheme length/
        );
      });
    });
  });

  describe('does not require a registered scheme or validated key', () => {
    // Port of TestCanonicalPQAddressSaltDoesNotRequireRegisteredSchemeOrValidatedKey.
    it('derives a deterministic address for an arbitrary scheme and key', () => {
      const scheme = new TextEncoder().encode('x1');
      const publicKey = Uint8Array.of(0xab, 0xcd, 0xef);

      const { address } = addressFromPQKey(scheme, publicKey);
      const { address: addrAgain } = addressFromPQKey(scheme, publicKey);

      assert.ok(address.equals(addrAgain));
    });
  });
});

describe('PQ signers', () => {
  it('properly attaches a signature to a transaction', async () => {
    const txn = decodeMsgpack(
      Buffer.from(pqTxnData.txnBlob, 'base64'),
      Transaction
    );

    const falconSigningKey: Falcon1024SigningKey = {
      falcon1024PublicKey: new Uint8Array(
        Buffer.from(pqTxnData.publicKey, 'base64')
      ),
      falcon1024Signer: async (data: Uint8Array) => {
        assert.deepEqual(data, new Uint8Array(genericHash(txn.bytesToSign())));

        return new Uint8Array(Buffer.from(pqTxnData.txnSig, 'base64'));
      },
    };

    const addrWithSigners =
      addressWithSignersFromRawFalcon1024Signer(falconSigningKey);

    const { blob } = await signTransactionWithSigner(
      txn,
      addrWithSigners.txnSigner
    );
    assert.deepEqual(
      blob,
      new Uint8Array(Buffer.from(pqTxnData.stxnBlob, 'base64'))
    );
  });
});
