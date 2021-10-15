/* eslint-disable no-bitwise */
/* eslint-disable no-case-declarations */
/* eslint-disable no-lonely-if */
/* eslint-disable*/ //TODO: remove before PR

/**
    //ABI-Types: uint<N>: An N-bit unsigned integer (8 <= N <= 512 and N % 8 = 0).
    // | byte (alias for uint8)
    // | ufixed <N> x <M> (8 <= N <= 512, N % 8 = 0, and 0 < M <= 160)
    // | bool
    // | address (alias for byte[32])
    // | <type> [<N>]
    // | <type> []
    // | string
    // | (T1, ..., Tn)
*/
import algosdk from '../../';

export const MAX_LEN = 2 ** 16 - 1;
export const ADDR_BYTE_SIZE = 32;
export const SINGLE_BYTE_SIZE = 1;
export const SINGLE_BOOL_SIZE = 1;
export const LENGTH_ENCODE_BYTE_SIZE = 2;

export interface Segment {
  left: number;
  right: number;
}

const staticArrayRegexp = /^([a-z\d\[\](),]+)\[([1-9][\d]*)]$/;
const ufixedRegexp = /^ufixed([1-9][\d]*)x([1-9][\d]*)$/;

interface BaseType {
  // Can only be applied to `uint` bitSize <N> or `ufixed` bitSize <N>
  bitSize?: number;
  // Can only be applied to `ufixed` precision <M>
  precision?: number;
  // Type of elements in a static/dynamic array
  childType?: BaseType;
  // Type of elements in a tuple
  childTypes?: BaseType[];
  // Defines the length of a static array
  staticLength?: number;

  toString(): string;
  Equal(other: BaseType): boolean;
  IsDynamic(): boolean;
  ByteLen(): number;
  Encode(value: any | any[]): Uint8Array;
  // Decode(Uint8Array): Object;
}

export class UintType implements BaseType {
  bitSize: number;

  constructor(public size: number) {
    if (size % 8 !== 0 || size < 8 || size > 512) {
      throw new Error(`unsupported uint type bitSize: ${size}`);
    }
    this.bitSize = size;
  }

  toString() {
    return 'uint' + this.bitSize;
  }

  Equal(other: UintType) {
    return (
      this.constructor === other.constructor && this.bitSize === other.bitSize
    );
  }

  IsDynamic() {
    return false;
  }

  ByteLen() {
    return this.bitSize / 8;
  }

  Encode(value: BigInt) {
    if (value >= BigInt(Math.pow(2, this.bitSize)) || value < 0n) {
      throw new Error(
        `${value} is not a non-negative int or too big to fit in size uint${this.bitSize}`
      );
    }
    return bigIntToBytes(value, this.bitSize / 8);
  }
}

export class UfixedType implements BaseType {
  bitSize: number;
  precision: number;

  constructor(public size: number, public denominator: number) {
    if (size % 8 !== 0 || size < 8 || size > 512) {
      throw new Error(`unsupported ufixed type bitSize: ${size}`);
    }
    if (denominator > 160 || denominator < 1) {
      throw new Error(`unsupported ufixed type precision:: ${denominator}`);
    }
    this.bitSize = size;
    this.precision = denominator;
  }

  toString() {
    return 'ufixed' + this.bitSize + 'x' + this.precision;
  }

  Equal(other: UfixedType) {
    return (
      this.constructor === other.constructor &&
      this.bitSize === other.bitSize &&
      this.precision === this.precision
    );
  }

  IsDynamic() {
    return false;
  }

  ByteLen() {
    return this.bitSize / 8;
  }

  Encode(value: BigInt) {
    if (value >= BigInt(Math.pow(2, this.bitSize)) || value < 0n) {
      throw new Error(
        `${value} is not a non-negative int or too big to fit in size uint${this.bitSize}`
      );
    }
    return bigIntToBytes(value, this.bitSize / 8);
  }
}

export class AddressType implements BaseType {
  toString() {
    return 'address';
  }

  Equal(other: AddressType) {
    return this.constructor === other.constructor;
  }

  IsDynamic() {
    return false;
  }

  ByteLen() {
    return ADDR_BYTE_SIZE;
  }

  Encode(value: string) {
    const decodedAddress = algosdk.decodeAddress(value);
    return decodedAddress.publicKey;
  }
}

export class BoolType implements BaseType {
  toString() {
    return 'bool';
  }

  Equal(other: BoolType) {
    return this.constructor === other.constructor;
  }

  IsDynamic() {
    return false;
  }

  ByteLen() {
    return SINGLE_BYTE_SIZE;
  }

  Encode(value: boolean) {
    if (value) {
      return new Uint8Array([128]);
    }
    return new Uint8Array([0]);
  }
}

export class ByteType implements BaseType {
  toString() {
    return 'byte';
  }

  Equal(other: ByteType) {
    return this.constructor === other.constructor;
  }

  IsDynamic() {
    return false;
  }

  ByteLen() {
    return SINGLE_BOOL_SIZE;
  }

  Encode(value: number) {
    if (value < 0 || value > 255) {
      throw new Error(`${value} cannot be encoded into a byte`);
    }
    return new Uint8Array([value]);
  }
}

export class StringType implements BaseType {
  toString() {
    return 'string';
  }

  Equal(other: StringType) {
    return this.constructor === other.constructor;
  }

  IsDynamic() {
    return true;
  }

  ByteLen(): never {
    throw new Error(`${this.toString()} is a dynamic type`);
  }

  Encode(value: string) {
    const encoder = new TextEncoder();
    const encodedBytes = encoder.encode(value);
    const encodedLength = bigIntToBytes(value.length, LENGTH_ENCODE_BYTE_SIZE);
    let mergedBytes = new Uint8Array(value.length + LENGTH_ENCODE_BYTE_SIZE);
    mergedBytes.set(encodedLength);
    mergedBytes.set(encodedBytes, LENGTH_ENCODE_BYTE_SIZE);
    return mergedBytes;
  }
}

export class ArrayStaticType implements BaseType {
  childType: BaseType;
  staticLength: number;

  constructor(public argType: BaseType, public arrayLength: number) {
    if (arrayLength < 1) {
      throw new Error(
        `static array must have a length greater than 1: ${arrayLength}`
      );
    }
    this.childType = argType;
    this.staticLength = arrayLength;
  }

  toString() {
    return this.childType.toString() + '[' + this.staticLength + ']';
  }

  Equal(other: ArrayStaticType) {
    return (
      this.constructor === other.constructor &&
      this.childType === other.childType &&
      this.staticLength === other.staticLength
    );
  }

  IsDynamic() {
    return this.childType.IsDynamic();
  }

  ByteLen() {
    if (this.childType.constructor === BoolType) {
      return Math.ceil(this.arrayLength / 8);
    }
    let elemByteLen = this.childType.ByteLen();
    return this.staticLength * elemByteLen;
  }

  Encode(values: any[]) {
    if (values.length != this.staticLength) {
      throw new Error(`value array does not match static array length`);
    }
    const convertedTuple = this.toTupleType();
    return convertedTuple.Encode(values);
  }

  toTupleType() {
    return new TupleType(Array(this.staticLength).fill(this.childType));
  }
}

export class ArrayDynamicType implements BaseType {
  childType: BaseType;

  constructor(public argType: BaseType) {
    this.childType = argType;
  }

  toString() {
    return this.childType.toString() + '[]';
  }

  Equal(other: ArrayDynamicType) {
    return (
      this.constructor === other.constructor &&
      this.childType === other.childType
    );
  }

  IsDynamic() {
    return true;
  }

  ByteLen(): never {
    throw new Error(`${this.toString()} is a dynamic type`);
  }

  Encode(values: any[]) {
    const convertedTuple = this.toTupleType(values.length);
    const encodedTuple = convertedTuple.Encode(values);
    const encodedLength = bigIntToBytes(
      convertedTuple.childTypes.length,
      LENGTH_ENCODE_BYTE_SIZE
    );
    let mergedBytes = new Uint8Array(
      convertedTuple.ByteLen() + LENGTH_ENCODE_BYTE_SIZE
    );
    mergedBytes.set(encodedLength);
    mergedBytes.set(encodedTuple, LENGTH_ENCODE_BYTE_SIZE);
    return mergedBytes;
  }

  toTupleType(length: number) {
    return new TupleType(Array(length).fill(this.childType));
  }
}

export class TupleType implements BaseType {
  childTypes: BaseType[];

  constructor(public argTypes: BaseType[]) {
    if (argTypes.length >= MAX_LEN) {
      throw new Error(
        'tuple type child type number larger than maximum uint16 error'
      );
    }
    this.childTypes = argTypes;
  }

  toString() {
    let typeStrings: Array<String> = [];
    for (let i = 0; i < this.childTypes.length; i++) {
      typeStrings[i] = this.childTypes[i].toString();
    }
    return '(' + typeStrings.join(',') + ')';
  }

  Equal(other: TupleType) {
    return (
      this.constructor === other.constructor &&
      this.childTypes === other.childTypes
    );
  }

  IsDynamic() {
    for (const childT of this.childTypes) {
      if (childT.IsDynamic()) {
        return true;
      }
    }
    return false;
  }

  ByteLen() {
    let size = 0;
    for (let i = 0; i < this.childTypes.length; i++) {
      if (this.childTypes[i].constructor === BoolType) {
        const after = TupleType.findBoolLR(this.childTypes, i, 1);
        const boolNum = after + 1;
        i += after;
        size += Math.trunc(boolNum / 8);
        if (boolNum % 8 !== 0) {
          size += 1;
        }
      } else {
        let childByteSize = this.childTypes[i].ByteLen();
        size += childByteSize;
      }
    }
    return size;
  }

  Encode(values: any[]) {
    if (values.length > MAX_LEN) {
      throw new Error('length of tuple array should not exceed a uint16');
    }
    const tupleTypes = this.childTypes;
    let heads = []; //new Array(new Uint8Array(tupleTypes.length));
    let tails = []; // = new Array(new Uint8Array(tupleTypes.length)); //= new Uint8Array(tupleTypes.length);
    let isDynamicIndex = new Map();
    let i = 0;

    while (i < tupleTypes.length) {
      let tupleType = tupleTypes[i];
      if (tupleType.IsDynamic()) {
        // Head is not pre-determined for dynamic types; store a placeholder for now
        isDynamicIndex.set(heads.length, true);
        heads.push(new Uint8Array([0, 0]));
        tails.push(tupleType.Encode(values[i]));
      } else {
        if (tupleType.constructor === BoolType) {
          const before = TupleType.findBoolLR(tupleTypes, i, -1);
          let after = TupleType.findBoolLR(tupleTypes, i, 1);

          // Pack bytes to heads and tails
          if (before % 8 != 0) {
            throw new Error(
              'expected before index should have number of bool mod 8 equal 0'
            );
          }
          after = Math.min(7, after);
          const compressedInt = TupleType.compressMultipleBool(
            values.slice(i, i + after + 1)
          );
          heads.push(bigIntToBytes(compressedInt, 1));
          i += after;
        } else {
          const encodedTupleValue = tupleType.Encode(values[i]);
          heads.push(encodedTupleValue);
        }
        isDynamicIndex.set(i, false);
        tails.push(new Uint8Array());
      }
      i += 1;
    }

    // Adjust head lengths for dynamic types
    let headLength = 0;
    for (let headElement of heads) {
      headLength += headElement.length;
    }

    // Encode any placeholders for dynamic types
    let tailLength = 0;
    for (let i = 0; i < heads.length; i++) {
      if (isDynamicIndex.get(i)) {
        const headValue = headLength + tailLength;
        if (headValue > MAX_LEN) {
          throw new Error(
            `byte length of ${headValue} should not exceed a uint16`
          );
        }
        heads[i] = bigIntToBytes(headValue, LENGTH_ENCODE_BYTE_SIZE);
      }
      if (tails[i]) {
        tailLength += tails[i].length;
      }
    }

    // Concatenate into fixed Uint8Array
    let mergedBytes = new Uint8Array(headLength + tailLength);
    i = 0;
    for (let h of heads) {
      mergedBytes.set(h, i);
      i += h.length;
    }
    for (let t of tails) {
      mergedBytes.set(t, i);
      i += t.length;
    }
    return mergedBytes;
  }

  // Assume that the current index on the list of type is an ABI bool type.
  // It returns the difference between the current index and the index of the furthest consecutive Bool type.
  static findBoolLR(
    typeList: BaseType[],
    index: number,
    delta: number
  ): number {
    let until = 0;
    while (1) {
      let curr = index + delta * until;
      if (typeList[curr].constructor === BoolType) {
        if (curr !== typeList.length - 1 && delta > 0) {
          until += 1;
        } else if (curr > 0 && delta < 0) {
          until += 1;
        } else {
          break;
        }
      } else {
        until -= 1;
        break;
      }
    }
    return until;
  }

  static parseTupleContent(str: String): String[] {
    if (str.length === 0) {
      return [];
    }
    if (str.endsWith(',') || str.startsWith(',')) {
      throw new Error('tuple string should not start with comma');
    }
    if (str.includes(',,')) {
      throw new Error('tuple string should not have consecutive commas');
    }

    let tupleStrings = [];
    let depth = 0;
    let word = '';

    for (const char of str) {
      word += char;
      if (char == '(') {
        depth += 1;
      } else if (char == ')') {
        depth -= 1;
      } else if (char == ',') {
        // If the comma is at depth 0, then append the word as token.
        if (depth == 0) {
          tupleStrings.push(word.slice(0, word.length - 1));
          word = '';
        }
      }
    }
    if (word.length != 0) {
      tupleStrings.push(word);
    }
    if (depth != 0) {
      throw new Error('tuple string has mismatched parentheses');
    }
    return tupleStrings;
  }

  // compressMultipleBool compresses consecutive bool values into a byte in ABI tuple / array value.
  static compressMultipleBool(valueList: boolean[]): number {
    let res = 0;
    if (valueList.length > 8) {
      throw new Error(
        'value list passed in should be no greater than length 8'
      );
    }
    for (let i = 0; i < valueList.length; i++) {
      let boolVal = valueList[i];
      if (boolVal) {
        res |= 1 << (7 - i);
      }
    }
    return res;
  }
}

// TypeFromString de-serialize ABI type from a string following ABI encoding.
export function TypeFromString(str: String): BaseType {
  if (str.endsWith('[]')) {
    const arrayArgType = TypeFromString(str.slice(0, str.length - 2));
    if (arrayArgType === null) {
      return null;
    }
    return new ArrayDynamicType(arrayArgType);
  } else if (str.endsWith(']')) {
    const stringMatches = str.match(staticArrayRegexp);
    // match the string itself, array element type, then array length
    if (stringMatches.length !== 3) {
      throw new Error(`malformed static array string: ${str}`);
    }
    // guaranteed that the length of array is existing
    const arrayLengthStr = stringMatches[2];
    const arrayLength = Number(arrayLengthStr);
    // allowing only decimal static array length, with limit size to 2^16 - 1
    if (arrayLength > MAX_LEN) {
      throw new Error(`array length exceeds limit ${MAX_LEN}`);
    }
    // parse the array element type
    const arrayType = TypeFromString(stringMatches[1]);
    return new ArrayStaticType(arrayType, arrayLength);
  } else if (str.startsWith('uint')) {
    // Checks if the parsed number contains only digits, no whitespaces
    const digitsOnly = (string) =>
      [...string].every((c) => '0123456789'.includes(c));
    const typeSizeStr = str.slice(4, str.length);
    if (!digitsOnly(typeSizeStr)) {
      throw new Error(`malformed uint string: ${typeSizeStr}`);
    }
    const typeSize = Number(typeSizeStr);
    if (typeSize > MAX_LEN) {
      throw new Error(`malformed uint string: ${typeSize}`);
    }
    return new UintType(typeSize);
  } else if (str === 'byte') {
    return new ByteType();
  } else if (str.startsWith('ufixed')) {
    const stringMatches = str.match(ufixedRegexp);
    if (stringMatches.length !== 3) {
      throw new Error(`malformed ufixed type: ${str}`);
    }
    const ufixedSize = Number(stringMatches[1]);
    const ufixedPrecision = Number(stringMatches[2]);
    return new UfixedType(ufixedSize, ufixedPrecision);
  } else if (str === 'bool') {
    return new BoolType();
  } else if (str === 'address') {
    return new AddressType();
  } else if (str === 'string') {
    return new StringType();
  } else if (str.length >= 2 && str[0] === '(' && str[str.length - 1] === ')') {
    const tupleContent = TupleType.parseTupleContent(
      str.slice(1, str.length - 1)
    );
    if (tupleContent.length === 0) {
      return new TupleType([]);
    }
    let tupleTypes: BaseType[] = [];
    for (let i = 0; i < tupleContent.length; i++) {
      const ti = TypeFromString(tupleContent[i]);
      tupleTypes.push(ti);
    }
    return new TupleType(tupleTypes);
  } else {
    throw new Error(`cannot convert a string ${str} to an ABI type`);
  }
}

// Convert a BigInt to a big-endian Uint8Array for encoding.
function bigIntToBytes(bi: BigInt | number, size: number) {
  let hex = bi.toString(16);
  // Pad the hex with zeros so it matches the size in bytes
  for (let i = hex.length; i < size * 2; i++) {
    hex = '0' + hex;
  }
  let byteArray = new Uint8Array(hex.length / 2);
  for (let i = 0, j = 0; i < hex.length / 2; i++, j += 2) {
    byteArray[i] = parseInt(hex.slice(j, j + 2), 16);
  }
  return byteArray;
}
