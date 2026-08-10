/* eslint-disable no-bitwise */

const p = (1n << 255n) - 19n;

const ED25519_PUBLIC_KEY_LENGTH = 32;

function powMod(base: bigint, exp: bigint) {
  let res = 1n;

  let currentExp = exp;
  let currentBase = ((base % p) + p) % p;

  while (currentExp > 0n) {
    if (currentExp & 1n) res = (res * currentBase) % p;
    currentBase = (currentBase * currentBase) % p;
    currentExp >>= 1n;
  }
  return res;
}

const d = (((-121665n * powMod(121666n, p - 2n)) % p) + p) % p;
const I = powMod(2n, (p - 1n) / 4n);

/**
 * Decode the little-endian y coordinate of an Ed25519 point encoding, dropping
 * the sign-of-x bit. The result is not reduced mod p; `hasValidX` reduces it.
 */
function decodeY(keyBytes: Uint8Array): bigint {
  const bytes = keyBytes.slice();
  bytes[31] &= 0x7f;
  let y = 0n;
  for (let i = 31; i >= 0; i--) y = (y << 8n) | BigInt(bytes[i]);
  return y;
}

function hasValidX(y: bigint): boolean {
  // Reducing here is what makes this the broad predicate: non-canonical
  // encodings with y >= p are accepted if their reduced value is on the curve.
  const yr = ((y % p) + p) % p;
  const y2 = (yr * yr) % p;
  const u = (y2 - 1n + p) % p;
  const v = (d * y2 + 1n) % p;
  if (v === 0n) return false; // no x exists for this y
  const vInv = powMod(v, p - 2n);
  const x2 = (u * vInv) % p;
  const x1 = powMod(x2, (p + 3n) / 8n);
  if ((x1 * x1) % p === x2) return true;
  const x1b = (x1 * I) % p;
  if ((x1b * x1b) % p === x2) return true;
  return false;
}

/**
 * Report whether the given bytes decode to an Edwards25519 curve point.
 *
 * This over-approximates whatever the verifier's decoder accepts: small-order
 * points and non-canonical encodings (such as y == p) count as curve points,
 * matching decoders like filippo.io/edwards25519. Over-approximating is the
 * safe direction here, because the only caller uses this to *reject* candidate
 * post-quantum addresses that an Ed25519 key could also occupy.
 */
export function couldBeCurvePoint(keyBytes: Uint8Array): boolean {
  // An Ed25519 public key is always exactly 32 bytes, so nothing else can
  // collide with one.
  if (keyBytes.length !== ED25519_PUBLIC_KEY_LENGTH) return false;
  return hasValidX(decodeY(keyBytes));
}
