/* eslint-disable no-bitwise */

const p = (1n << 255n) - 19n;

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

function decodeY(keyBytes: Uint8Array, reduce: boolean): bigint {
  const bytes = keyBytes.slice();
  bytes[31] &= 0x7f;
  let y = 0n;
  for (let i = 31; i >= 0; i--) y = (y << 8n) | BigInt(bytes[i]);
  return reduce ? y % p : y;
}

function hasValidX(y: bigint): boolean {
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

export function couldBeCurvePoint(keyBytes: Uint8Array): boolean {
  // test both the raw y and the mod-p-reduced y, to over-approximate
  // whatever the verifier's decoder accepts
  const raw = decodeY(keyBytes, false);
  if (hasValidX(raw)) return true;
  const reduced = decodeY(keyBytes, true);
  if (reduced !== raw && hasValidX(reduced)) return true;
  return false;
}
