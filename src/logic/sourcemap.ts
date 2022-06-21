/* eslint-disable no-bitwise */

// Adapted from https://github.com/Rich-Harris/vlq, thanks!

const alphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

const charToInt = {};
const intToChar = {};
alphabet.split('').forEach((char, i) => {
  charToInt[char] = i;
  intToChar[i] = char;
});

export function base64VLQDecode(VLQVal: string) {
  const result: number[] = [];

  let shift = 0;
  let value = 0;

  for (let i = 0; i < VLQVal.length; i += 1) {
    let intVal = charToInt[VLQVal[i]];

    if (intVal === undefined)
      throw new Error(`Invalid character (${VLQVal[i]})`);

    const hasContinueBit = intVal & 32;

    intVal &= 31;
    value += intVal << shift;

    if (hasContinueBit) {
      shift += 5;
    } else {
      const shouldNegate = value & 1;

      value >>>= 1;

      if (shouldNegate) {
        result.push(value === 0 ? -0x80000000 : -value);
      } else {
        result.push(value);
      }

      value = 0;
      shift = 0;
    }
  }

  return result;
}

function encodeInteger(n: number) {
  let result = '';

  let num = n;

  if (num < 0) num = (-num << 1) | 1;
  else num <<= 1;

  do {
    let clamped = num & 31;
    num >>>= 5;

    if (num > 0) clamped |= 32;

    result += intToChar[clamped];
  } while (num > 0);

  return result;
}

export function base64VLQEncode(val: number | number[]) {
  if (typeof val === 'number') return encodeInteger(val);
  return val.map((i) => encodeInteger(i)).join();
}

export class SourceMap {
  version: number;
  sources: string[];
  names: string[];
  mapping: string;
  delimiter: string;
  comments: string[];

  pcToLine: { [key: number]: number };
  lineToPc: { [key: number]: number[] };

  constructor(
    version: number,
    sources: string[],
    names: string[],
    mapping: string,
    delimiter: string = ';',
    comments?: string[]
  ) {
    this.version = version;
    this.sources = sources;
    this.names = names;
    this.mapping = mapping;
    this.delimiter = delimiter;
    this.comments = comments === undefined ? [] : comments;

    const rawMapping = this.mapping.split(this.delimiter);
    const pcList = rawMapping.map((m) => {
      const decoded = base64VLQDecode(m);
      if (decoded.length > 1) return decoded[2];
      return undefined;
    });

    let lastLine = 0;
    for (const [idx, val] of pcList.entries()) {
      if (val !== undefined) {
        if (!(val in this.lineToPc)) this.lineToPc[val] = [];
        this.lineToPc[val].push(idx);
        lastLine = val;
      }
      this.pcToLine[idx] = lastLine;
    }
  }

  getLineForPc(pc: number): number {
    return this.pcToLine[pc];
  }

  getPcsForLine(line: number): number[] {
    return this.lineToPc[line];
  }

  getCommentForLine(line: number): string {
    return this.comments[line];
  }
}
