/* eslint-disable no-bitwise */
/* eslint-disable no-use-before-define */
/* eslint-disable class-methods-use-this */

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
import algosdk from '../..';

export const MAX_LEN = 2 ** 16 - 1;
export const ADDR_BYTE_SIZE = 32;
export const SINGLE_BYTE_SIZE = 1;
export const SINGLE_BOOL_SIZE = 1;
export const LENGTH_ENCODE_BYTE_SIZE = 2;

export interface Segment {
  left: number;
  right: number;
}

const staticArrayRegexp = /^([a-z\d[\](),]+)\[([1-9][\d]*)]$/;
const ufixedRegexp = /^ufixed([1-9][\d]*)x([1-9][\d]*)$/;

type ABIValue = boolean | number | bigint | string | Uint8Array | ABIValue[];

export abstract class Type {
  // Converts a Type object to a string
  abstract toString(): string;
  // Checks if two Type objects are equal in value
  abstract equal(other: Type): boolean;
  // Checks if the Type object (or any of its child types) have dynamic length
  abstract IsDynamic(): boolean;
  // Returns the size of the Type object in bytes
  abstract ByteLen(): number;
  // Encodes a value for the Type object using the ABI specs
  abstract Encode(value: ABIValue): Uint8Array;
  // Decodes a value for the Type object using the ABI specs
  abstract Decode(byteString: Uint8Array): Object;
  // De-serializes the ABI type from a string using the ABI specs
  static Of(str: String): Type {
    if (str.endsWith('[]')) {
      const arrayArgType = Type.Of(str.slice(0, str.length - 2));
      if (arrayArgType === null) {
        return null;
      }
      return new ArrayDynamicType(arrayArgType);
    }
    if (str.endsWith(']')) {
      const stringMatches = str.match(staticArrayRegexp);
      // Match the string itself, array element type, then array length
      if (stringMatches.length !== 3) {
        throw new Error(`malformed static array string: ${str}`);
      }
      // Parse static array using regex
      const arrayLengthStr = stringMatches[2];
      const arrayLength = parseInt(arrayLengthStr, 10);
      if (arrayLength > MAX_LEN) {
        throw new Error(`array length exceeds limit ${MAX_LEN}`);
      }
      // Parse the array element type
      const arrayType = Type.Of(stringMatches[1]);
      return new ArrayStaticType(arrayType, arrayLength);
    }
    if (str.startsWith('uint')) {
      // Checks if the parsed number contains only digits, no whitespaces
      const digitsOnly = (string) =>
        [...string].every((c) => '0123456789'.includes(c));
      const typeSizeStr = str.slice(4, str.length);
      if (!digitsOnly(typeSizeStr)) {
        throw new Error(`malformed uint string: ${typeSizeStr}`);
      }
      const typeSize = parseInt(typeSizeStr, 10);
      if (typeSize > MAX_LEN) {
        throw new Error(`malformed uint string: ${typeSize}`);
      }
      return new UintType(typeSize);
    }
    if (str === 'byte') {
      return new ByteType();
    }
    if (str.startsWith('ufixed')) {
      const stringMatches = str.match(ufixedRegexp);
      if (stringMatches.length !== 3) {
        throw new Error(`malformed ufixed type: ${str}`);
      }
      const ufixedSize = parseInt(stringMatches[1], 10);
      const ufixedPrecision = parseInt(stringMatches[2], 10);
      return new UfixedType(ufixedSize, ufixedPrecision);
    }
    if (str === 'bool') {
      return new BoolType();
    }
    if (str === 'address') {
      return new AddressType();
    }
    if (str === 'string') {
      return new StringType();
    }
    if (str.length >= 2 && str[0] === '(' && str[str.length - 1] === ')') {
      const tupleContent = TupleType.parseTupleContent(
        str.slice(1, str.length - 1)
      );
      if (tupleContent.length === 0) {
        return new TupleType([]);
      }
      const tupleTypes: Type[] = [];
      for (let i = 0; i < tupleContent.length; i++) {
        const ti = Type.Of(tupleContent[i]);
        tupleTypes.push(ti);
      }
      return new TupleType(tupleTypes);
    }
    throw new Error(`cannot convert a string ${str} to an ABI type`);
  }
}

export class UintType implements Type {
  bitSize: number;

  constructor(public size: number) {
    if (size % 8 !== 0 || size < 8 || size > 512) {
      throw new Error(`unsupported uint type bitSize: ${size}`);
    }
    this.bitSize = size;
  }

  toString() {
    return `uint${this.bitSize}`;
  }

  equal(other: UintType) {
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

  Encode(value: bigint | number) {
    if (
      (typeof value !== 'bigint' && typeof value !== 'number') ||
      value >= BigInt(2 ** this.bitSize) ||
      value < 0n
    ) {
      throw new Error(
        `${value} is not a non-negative int or too big to fit in size uint${this.bitSize}`
      );
    }
    if (typeof value === 'number' && value >= 2 ** 53) {
      throw new Error(
        `${value} should be converted into a BigInt before it is encoded`
      );
    }
    return bigIntToBytes(value, this.bitSize / 8);
  }

  Decode(byteString: Uint8Array) {
    if (byteString.length !== this.bitSize / 8) {
      throw new Error(`byte string must correspond to a uint${this.bitSize}`);
    }
    return bytesToBigInt(byteString);
  }
}

export class UfixedType implements Type {
  bitSize: number;
  precision: number;

  constructor(public size: number, public denominator: number) {
    if (size % 8 !== 0 || size < 8 || size > 512) {
      throw new Error(`unsupported ufixed type bitSize: ${size}`);
    }
    if (denominator > 160 || denominator < 1) {
      throw new Error(`unsupported ufixed type precision: ${denominator}`);
    }
    this.bitSize = size;
    this.precision = denominator;
  }

  toString() {
    return `ufixed${this.bitSize}x${this.precision}`;
  }

  equal(other: UfixedType) {
    return (
      this.constructor === other.constructor &&
      this.bitSize === other.bitSize &&
      this.precision === other.precision
    );
  }

  IsDynamic() {
    return false;
  }

  ByteLen() {
    return this.bitSize / 8;
  }

  Encode(value: bigint | number) {
    if (
      (typeof value !== 'bigint' && typeof value !== 'number') ||
      value >= BigInt(2 ** this.bitSize) ||
      value < 0n
    ) {
      throw new Error(
        `${value} is not a non-negative int or too big to fit in size ufixed${this.bitSize}`
      );
    }
    if (typeof value === 'number' && value >= 2 ** 53) {
      throw new Error(
        `${value} should be converted into a BigInt before it is encoded`
      );
    }
    return bigIntToBytes(value, this.bitSize / 8);
  }

  Decode(byteString: Uint8Array) {
    if (byteString.length !== this.bitSize / 8) {
      throw new Error(`byte string must correspond to a ufixed${this.bitSize}`);
    }
    return bytesToBigInt(byteString);
  }
}

export class AddressType implements Type {
  toString() {
    return 'address';
  }

  equal(other: AddressType) {
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

  Decode(byteString: Uint8Array) {
    if (byteString.length !== 32) {
      throw new Error(`byte string must be 32 bytes long for an address`);
    }
    return algosdk.encodeAddress(byteString);
  }
}

export class BoolType implements Type {
  toString() {
    return 'bool';
  }

  equal(other: BoolType) {
    return this.constructor === other.constructor;
  }

  IsDynamic() {
    return false;
  }

  ByteLen() {
    return SINGLE_BOOL_SIZE;
  }

  Encode(value: boolean) {
    if (value) {
      return new Uint8Array([128]);
    }
    return new Uint8Array([0]);
  }

  Decode(byteString: Uint8Array) {
    if (byteString.length !== 1) {
      throw new Error(`bool string must be 1 byte long`);
    }
    const buf = Buffer.from(byteString);
    const value = buf.readUIntBE(0, byteString.length);
    if (value === 128) {
      return true;
    }
    if (value === 0) {
      return false;
    }
    throw new Error(`boolean could not be decoded from the byte string`);
  }
}

export class ByteType implements Type {
  toString() {
    return 'byte';
  }

  equal(other: ByteType) {
    return this.constructor === other.constructor;
  }

  IsDynamic() {
    return false;
  }

  ByteLen() {
    return SINGLE_BYTE_SIZE;
  }

  Encode(value: number) {
    if (value < 0 || value > 255) {
      throw new Error(`${value} cannot be encoded into a byte`);
    }
    return new Uint8Array([value]);
  }

  Decode(byteString: Uint8Array) {
    if (byteString.length !== 1) {
      throw new Error(`byte string must be 1 byte long`);
    }
    const buf = Buffer.from(byteString);
    return buf.readUIntBE(0, byteString.length);
  }
}

export class StringType implements Type {
  toString() {
    return 'string';
  }

  equal(other: StringType) {
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
    const mergedBytes = new Uint8Array(value.length + LENGTH_ENCODE_BYTE_SIZE);
    mergedBytes.set(encodedLength);
    mergedBytes.set(encodedBytes, LENGTH_ENCODE_BYTE_SIZE);
    return mergedBytes;
  }

  Decode(byteString: Uint8Array) {
    if (byteString.length < LENGTH_ENCODE_BYTE_SIZE) {
      throw new Error(`byte string is too short to be decoded: ${byteString}`);
    }
    const buf = Buffer.from(byteString);
    const byteLength = buf.readUIntBE(0, LENGTH_ENCODE_BYTE_SIZE);
    const byteValue = byteString.slice(
      LENGTH_ENCODE_BYTE_SIZE,
      byteString.length
    );
    if (byteLength !== byteValue.length) {
      throw new Error(
        `string length bytes do not match the actual length of string: ${byteString}`
      );
    }
    const stringValue = new TextDecoder().decode(byteValue);
    return stringValue;
  }
}

export class ArrayStaticType implements Type {
  childType: Type;
  staticLength: number;

  constructor(public argType: Type, public arrayLength: number) {
    if (arrayLength < 1) {
      throw new Error(
        `static array must have a length greater than 0: ${arrayLength}`
      );
    }
    this.childType = argType;
    this.staticLength = arrayLength;
  }

  toString() {
    return `${this.childType.toString()}[${this.staticLength}]`;
  }

  equal(other: ArrayStaticType) {
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
    const elemByteLen = this.childType.ByteLen();
    return this.staticLength * elemByteLen;
  }

  Encode(values: ABIValue[]) {
    if (values.length !== this.staticLength) {
      throw new Error(`value array does not match static array length`);
    }
    const convertedTuple = this.toTupleType();
    return convertedTuple.Encode(values);
  }

  Decode(byteString: Uint8Array) {
    return byteString;
  }

  toTupleType() {
    return new TupleType(Array(this.staticLength).fill(this.childType));
  }
}

export class ArrayDynamicType implements Type {
  childType: Type;

  constructor(public argType: Type) {
    this.childType = argType;
  }

  toString() {
    return `${this.childType.toString()}[]`;
  }

  equal(other: ArrayDynamicType) {
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

  Encode(values: ABIValue[]) {
    const convertedTuple = this.toTupleType(values.length);
    const encodedTuple = convertedTuple.Encode(values);
    const encodedLength = bigIntToBytes(
      convertedTuple.childTypes.length,
      LENGTH_ENCODE_BYTE_SIZE
    );
    const mergedBytes = new Uint8Array(
      convertedTuple.ByteLen() + LENGTH_ENCODE_BYTE_SIZE
    );
    mergedBytes.set(encodedLength);
    mergedBytes.set(encodedTuple, LENGTH_ENCODE_BYTE_SIZE);
    return mergedBytes;
  }

  Decode(byteString: Uint8Array) {
    return byteString;
  }

  toTupleType(length: number) {
    return new TupleType(Array(length).fill(this.childType));
  }
}

export class TupleType implements Type {
  childTypes: Type[];

  constructor(public argTypes: Type[]) {
    if (argTypes.length >= MAX_LEN) {
      throw new Error(
        'tuple type child type number larger than maximum uint16 error'
      );
    }
    this.childTypes = argTypes;
  }

  toString() {
    const typeStrings: Array<String> = [];
    for (let i = 0; i < this.childTypes.length; i++) {
      typeStrings[i] = this.childTypes[i].toString();
    }
    return `(${typeStrings.join(',')})`;
  }

  equal(other: TupleType) {
    return (
      this.constructor === other.constructor &&
      this.childTypes === other.childTypes
    );
  }

  IsDynamic() {
    const isDynamic = (child: Type) => child.IsDynamic();
    return this.childTypes.some(isDynamic);
  }

  ByteLen() {
    let size = 0;
    for (let i = 0; i < this.childTypes.length; i++) {
      if (this.childTypes[i].constructor === BoolType) {
        const after = TupleType.findBoolLR(this.childTypes, i, 1);
        const boolNum = after + 1;
        i += after;
        size += Math.trunc((boolNum + 7) / 8);
      } else {
        const childByteSize = this.childTypes[i].ByteLen();
        size += childByteSize;
      }
    }
    return size;
  }

  Encode(values: ABIValue[]) {
    if (values.length > MAX_LEN) {
      throw new Error('length of tuple array should not exceed a uint16');
    }
    const tupleTypes = this.childTypes;
    const heads = [];
    const tails = [];
    const isDynamicIndex = new Map();
    let i = 0;

    while (i < tupleTypes.length) {
      const tupleType = tupleTypes[i];
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
          if (before % 8 !== 0) {
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
    for (const headElement of heads) {
      headLength += headElement.length;
    }

    // Encode any placeholders for dynamic types
    let tailLength = 0;
    for (let j = 0; j < heads.length; j++) {
      if (isDynamicIndex.get(j)) {
        const headValue = headLength + tailLength;
        if (headValue > MAX_LEN) {
          throw new Error(
            `byte length of ${headValue} should not exceed a uint16`
          );
        }
        heads[j] = bigIntToBytes(headValue, LENGTH_ENCODE_BYTE_SIZE);
      }
      if (tails[j]) {
        tailLength += tails[j].length;
      }
    }

    // Concatenate into fixed Uint8Array
    const mergedBytes = new Uint8Array(headLength + tailLength);
    i = 0;
    for (const h of heads) {
      mergedBytes.set(h, i);
      i += h.length;
    }
    for (const t of tails) {
      mergedBytes.set(t, i);
      i += t.length;
    }
    return mergedBytes;
  }

  Decode(byteString: Uint8Array) {
    const tupleTypes = this.childTypes;
    let dynamicSegments: Segment[];
    let valuePartition: Uint8Array[];
    let i = 0;
    let iterIndex = 0;
    const buf = Buffer.from(byteString);

    while (i < tupleTypes.length) {
      const tupleType = tupleTypes[i];
      if (tupleType.IsDynamic()) {
        if (
          byteString.slice(iterIndex, byteString.length).length <
          LENGTH_ENCODE_BYTE_SIZE
        ) {
          throw new Error('malformed tuple dynamic typed value encoding');
        }
        // let dynamicIndex = binary.BigEndian.Uint16(valueBytes[iterIndex : iterIndex + lengthEncodeByteSize])
        const dynamicIndex = buf.readUIntBE(iterIndex, LENGTH_ENCODE_BYTE_SIZE);
        if (dynamicSegments.length > 0) {
          dynamicSegments[dynamicSegments.length - 1].right = dynamicIndex;
          // Check that right side of segment is greater than the left side
          if (dynamicIndex > dynamicSegments[dynamicSegments.length - 1].left) {
            throw new Error(
              'dynamic index segment miscalculation: left is greater than right index'
            );
          }
        }
        // we know where encoded bytes for dynamic value start, but we do not know where it ends
        // unless we see the start of the next encoded bytes for dynamic value
        const seg: Segment = {
          left: dynamicIndex,
          right: -1,
        };
        dynamicSegments.push(seg);
        valuePartition.push(null);
        iterIndex += LENGTH_ENCODE_BYTE_SIZE;
      } else {
        // if bool ...
        // eslint-disable-next-line no-lonely-if
        if (tupleType.constructor === BoolType.constructor()) {
          // search previous bool
          const before = TupleType.findBoolLR(this.childTypes, i, -1);
          // search after bool
          let after = TupleType.findBoolLR(this.childTypes, i, 1);
          if (before % 8 === 0) {
            if (after > 7) {
              after = 7;
            }
            // parse bool in a byte to multiple byte strings
            for (let boolIndex = 0; boolIndex <= after; boolIndex++) {
              const boolMask = 0x80 >> boolIndex;
              if ((byteString[iterIndex] & boolMask) > 0) {
                const byte = new Uint8Array(1);
                byte[0] = 0x80;
                valuePartition.push(byte);
              } else {
                const byte = new Uint8Array(1);
                byte[0] = 0x00;
                valuePartition.push(byte);
              }
            }
            i += after;
            iterIndex += 1;
          } else {
            throw new Error('expected before bool number mod 8===0');
          }
        } else {
          // not bool ...
          const currLen = this.childTypes[i].ByteLen();

          // valuePartition = append(valuePartition, valueBytes[iterIndex: iterIndex + currLen])
          iterIndex += currLen;
        }
      }
      if (i !== this.childTypes.length - 1 && iterIndex >= byteString.length) {
        throw new Error('input byte not enough to decode');
      }
    }
    if (dynamicSegments.length > 0) {
      dynamicSegments[dynamicSegments.length - 1].right = byteString.length;
      iterIndex = byteString.length;
    }
    if (iterIndex < byteString.length) {
      throw new Error('input byte not fully consumed');
    }

    // check segment indices are valid
    // if the dynamic segment are not consecutive and well-ordered, we return error
    // eslint-disable-next-line no-shadow
    for (let i = 0; i < dynamicSegments.length; i++) {
      const seg = dynamicSegments[i];
      if (seg.left > seg.right) {
        throw new Error(
          'dynamic segment should display a [l, r] space with l <= r'
        );
      }
      if (
        i !== dynamicSegments.length - 1 &&
        seg.right !== dynamicSegments[i + 1].left
      ) {
        throw new Error('dynamic segment should be consecutive');
      }
    }

    let segIndex = 0;
    // eslint-disable-next-line no-shadow
    for (let i = 0; i < this.childTypes.length; i++) {
      if (this.childTypes[i].IsDynamic()) {
        valuePartition[i] = byteString.slice(
          dynamicSegments[segIndex].left,
          dynamicSegments[segIndex].right
        );
        segIndex += 1;
      }
    }

    // decode each tuple element bytes
    let values: any[];
    // eslint-disable-next-line no-shadow
    for (let i = 0; i < this.childTypes.length; i++) {
      const valueTi = this.childTypes[i].Decode(valuePartition[i]);
      values.push(valueTi);
    }
    return values;
  }

  // Assume that the current index on the list of type is an ABI bool type.
  // It returns the difference between the current index and the index of the furthest consecutive Bool type.
  static findBoolLR(typeList: Type[], index: number, delta: number): number {
    let until = 0;
    while (true) {
      const curr = index + delta * until;
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

    const tupleStrings: string[] = [];
    let depth = 0;
    let word = '';

    for (const char of str) {
      word += char;
      if (char === '(') {
        depth += 1;
      } else if (char === ')') {
        depth -= 1;
      } else if (char === ',') {
        // If the comma is at depth 0, then append the word as token.
        if (depth === 0) {
          tupleStrings.push(word.slice(0, word.length - 1));
          word = '';
        }
      }
    }
    if (word.length !== 0) {
      tupleStrings.push(word);
    }
    if (depth !== 0) {
      throw new Error('tuple string has mismatched parentheses');
    }
    return tupleStrings;
  }

  // compressMultipleBool compresses consecutive bool values into a byte in ABI tuple / array value.
  static compressMultipleBool(valueList: ABIValue[]): number {
    let res = 0;
    if (valueList.length > 8) {
      throw new Error(
        'value list passed in should be no greater than length 8'
      );
    }
    for (let i = 0; i < valueList.length; i++) {
      const boolVal = valueList[i];
      if (boolVal) {
        res |= 1 << (7 - i);
      }
    }
    return res;
  }
}

// Convert a BigInt to a big-endian Uint8Array for encoding.
function bigIntToBytes(bi: BigInt | number, size: number) {
  let hex = bi.toString(16);
  // Pad the hex with zeros so it matches the size in bytes
  if (hex.length !== size * 2) {
    hex = hex.padStart(size * 2, '0');
  }
  const byteArray = new Uint8Array(hex.length / 2);
  for (let i = 0, j = 0; i < hex.length / 2; i++, j += 2) {
    byteArray[i] = parseInt(hex.slice(j, j + 2), 16);
  }
  return byteArray;
}

function bytesToBigInt(bytes: Uint8Array) {
  let res = 0n;
  const buf = Buffer.from(bytes);
  for (let i = 0; i < bytes.length; i++) {
    res = BigInt(Number(buf.readUIntBE(i, 1))) + res * 256n;
  }
  return res;
}
