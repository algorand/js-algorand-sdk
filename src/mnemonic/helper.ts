import * as nacl from '../nacl/naclWrappers';
import { wordList } from "./mnemonic";
import { Buffer } from 'buffer'

export const padding = (
  data: string,
  max: number = 8,
  pad:
 string = "0"
): string => {
  const len = data.length;
  if (len < max) {
    const repeat = pad.repeat(max - len);
    return repeat + data;
  }
  return data;
};



// https://stackoverflow.com/a/51452614
export function toUint11Array(buffer8: Uint8Array | number[]) {
  const buffer11 = [];
  let acc = 0;
  let accBits = 0;
  function add(octet) {
    acc |= octet << accBits;
    accBits += 8;
    if (accBits >= 11) {
      buffer11.push(acc & 0x7ff);
      acc >>= 11;
      accBits -= 11;
    }
  }
  function flush() {
    if (accBits) {
      buffer11.push(acc);
    }
  }

  buffer8.forEach(add);
  flush();
  return buffer11;
}


// from Uint11Array
// https://stackoverflow.com/a/51452614
export function toUint8Array(buffer11: number[]) {
  const buffer8 = [];
  let acc = 0;
  let accBits = 0;
  function add(ui11) {
    acc |= ui11 << accBits;
    accBits += 11;
    while (accBits >= 8) {
      buffer8.push(acc & 0xff);
      acc >>= 8;
      accBits -= 8;
    }
  }
  function flush() {
    if (accBits) {
      buffer8.push(acc);
    }
  }

  buffer11.forEach(add);
  flush();
  return new Uint8Array(buffer8);
}


export function applyWords(nums: number[]) {
  return nums.map((n) => wordList.english[n]);
}

export function computeChecksum(seed: Uint8Array) {
  const hashBuffer = nacl.genericHash(seed);
  const uint11Hash = toUint11Array(hashBuffer);
  const words = applyWords(uint11Hash);

  return words[0];
}

// helper func - unused
export const bufToBinary = (buf: Buffer): string => {
  return Array.from(buf)
    .map(v => padding(v.toString(2)))
    .join("");
};

// helper func - unused
export const toUtf8 = (data: string): Buffer => {
  const nor: string = data.normalize("NFKD");
  return Buffer.from(nor, "utf8");
};


