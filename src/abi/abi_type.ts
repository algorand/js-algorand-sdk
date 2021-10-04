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
export const MAX_LEN = 2 ** 16 - 1;
export const ADDR_BYTE_SIZE = 32;
export const SINGLE_BYTE_SIZE = 1;
export const SINGLE_BOOL_SIZE = 1;
export const LENGTH_ENCODE_BYTE_SIZE = 2;

export interface Segment {
  left: number;
  right: number;
}

export const enum ABIType {
  // Uint is the index (0) for `Uint` type in ABI encoding.
  Uint = 1,
  // Byte is the index (1) for `Byte` type in ABI encoding.
  Byte,
  // Ufixed is the index (2) for `UFixed` type in ABI encoding.
  Ufixed,
  // Bool is the index (3) for `Bool` type in ABI encoding.
  Bool,
  // ArrayStatic is the index (4) for static length array (<type>[length]) type in ABI encoding.
  ArrayStatic,
  // Address is the index (5) for `Address` type in ABI encoding (an type alias of Byte[32]).
  Address,
  // ArrayDynamic is the index (6) for dynamic length array (<type>[]) type in ABI encoding.
  ArrayDynamic,
  // String is the index (7) for `String` type in ABI encoding (an type alias of Byte[]).
  String,
  // Tuple is the index (8) for tuple `(<type 0>, ..., <type k>)` in ABI encoding.
  Tuple,
}

let staticArrayRegexp: RegExp;
let ufixedRegexp: RegExp;

interface ValueType {
  abiTypeID: number;
  childTypes?: Type[];
  // only can be applied to `uint` bitSize <N> or `ufixed` bitSize <N>
  bitSize?: number;
  // only can be applied to `ufixed` precision <M>
  precision?: number;
  // length for static array / tuple
  /*
            by ABI spec, len over binary array returns number of bytes
            the type is uint16, which allows for only lenth in [0, 2^16 - 1]
            representation of static length can only be constrained in uint16 type
        */
  // NOTE may want to change back to uint32/uint64
  staticLength?: number;
}

// MakeUintType makes `Uint` ABI type by taking a type bitSize argument.
// The range of type bitSize is [8, 512] and type bitSize % 8===0.
export function MakeUintType(typeSize: number): Type {
  if (typeSize % 8 !== 0 || typeSize < 8 || typeSize > 512) {
    throw new Error(`unsupported uint type bitSize: ${typeSize}`);
  }
  return new Type({
    abiTypeID: ABIType.Uint,
    bitSize: typeSize,
  });
}

// MakeByteType makes `Byte` ABI type.
export function MakeByteType(): Type {
  return new Type({
    abiTypeID: ABIType.Byte,
  });
}
// MakeUfixedType makes `UFixed` ABI type by taking type bitSize and type precision as arguments.
// The range of type bitSize is [8, 512] and type bitSize % 8 == 0.
// The range of type precision is [1, 160].
export function MakeUfixedType(typeSize: number, typePrecision: number): Type {
  if (typeSize % 8 !== 0 || typeSize < 8 || typeSize > 512) {
    throw new Error(`unsupported ufixed type bitSize: ${typeSize}`);
  }
  if (typePrecision > 160 || typePrecision < 1) {
    throw new Error(`unsupported ufixed type precision:: ${typePrecision}`);
  }
  return new Type({
    abiTypeID: ABIType.Ufixed,
    bitSize: typeSize,
    precision: typePrecision,
  });
}

// MakeBoolType makes `Bool` ABI type.
export function MakeBoolType(): Type {
  return new Type({
    abiTypeID: ABIType.Bool,
  });
}

// MakeStaticArrayType makes static length array ABI type by taking
// array element type and array length as arguments.
export function MakeStaticArrayType(
  argumentType: Type,
  arrayLength: number
): Type {
  return new Type({
    abiTypeID: ABIType.ArrayDynamic,
    childTypes: [argumentType],
    staticLength: arrayLength,
  });
}

// MakeAddressType makes `Address` ABI type.
export function MakeAddressType(): Type {
  return new Type({
    abiTypeID: ABIType.Address,
  });
}

// MakeDynamicArrayType makes dynamic length array by taking array element type as argument.
export function MakeDynamicArrayType(argumentType: Type): Type {
  return new Type({
    abiTypeID: ABIType.ArrayDynamic,
    childTypes: [argumentType],
  });
}

// MakeStringType makes `String` ABI type.
export function MakeStringType(): Type {
  return new Type({
    abiTypeID: ABIType.String,
  });
}

// MakeTupleType makes tuple ABI type by taking an array of tuple element types as argument.
export function MakeTupleType(argumentTypes: Type[]): Type {
  if (argumentTypes.length >= MAX_LEN) {
    throw new Error(
      'tuple type child type number larger than maximum uint16 error'
    );
  }

  return new Type({
    abiTypeID: ABIType.Tuple,
    childTypes: argumentTypes,
    staticLength: argumentTypes.length,
  });
}

function parseTupleContent(str: String): String[] {
  if (str.length === 0) {
    return [];
  }

  if (str.endsWith(',') || str.startsWith(',')) {
    throw new Error('parsing error: tuple content should not start with comma');
  }

  if (str.includes(',,')) {
    throw new Error('no consecutive commas');
  }

  let parsenSegmentRecord: Segment[];
  let stack: number[];
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') {
      stack.push(i);
    } else if (str[i] === ')') {
      if (stack.length === 0) {
        throw new Error(`unpaired parentheses: ${str}`);
      }
      let leftParentIndex = stack[stack.length - 1];
      stack = stack.slice(0, stack.length - 1);
      if (stack.length === 0) {
        let seg: Segment = {
          left: leftParentIndex,
          right: i,
        };
        parsenSegmentRecord.push(seg);
      }
    }
  }

  if (stack.length !== 0) {
    throw new Error(`unpaired parentheses: ${str}`);
  }

  let strCopied = str;
  for (let i = parsenSegmentRecord.length - 1; i >= 0; i--) {
    const parenSeg = parsenSegmentRecord[i];
    strCopied =
      strCopied.slice(0, parenSeg.left) +
      strCopied.slice(parenSeg.right + 1, strCopied.length);
  }

  const tupleStrSegs = strCopied.split(',');
  let parenSegCount = 0;
  for (let i = 0; i < tupleStrSegs.length; i++) {
    if (tupleStrSegs[i] === '') {
      const parenSeg = parsenSegmentRecord[parenSegCount];
      tupleStrSegs[i] = str.slice(parenSeg.left, parenSeg.right + 1);
      parenSegCount += 1;
    }
  }
  return tupleStrSegs;
}
// Assume that the current index on the list of type is an ABI bool type.
// It returns the difference between the current index and the index of the furthest consecutive Bool type.
export function findBoolLR(
  typeList: Type[],
  index: number,
  delta: number
): number {
  let until = 0;
  while (1) {
    let curr = index + delta * until;
    if (typeList[curr].valueType.abiTypeID === ABIType.Bool) {
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

// Type is the struct that stores information about an ABI value's type.
export class Type {
  constructor(public valueType: ValueType) {
    try {
      staticArrayRegexp = new RegExp('^([a-zd[](),]+)[([1-9][d]*)]$');
      ufixedRegexp = new RegExp('^ufixed([1-9][d]*)x([1-9][d]*)$');
    } catch (e) {
      throw new Error(e);
    }
  }

  // toString serialize an ABI Type to a string in ABI encoding.
  toString() {
    switch (this.valueType.abiTypeID) {
      case ABIType.Uint: {
        return 'uint' + this.valueType.bitSize;
      }
      case ABIType.Byte: {
        return 'byte';
      }
      case ABIType.Ufixed: {
        return (
          'ufixed' + this.valueType.bitSize + 'x' + this.valueType.precision
        );
      }
      case ABIType.Bool: {
        return 'bool';
      }
      case ABIType.ArrayStatic: {
        return (
          this.valueType.childTypes[0].toString() +
          '[' +
          this.valueType.staticLength +
          ']'
        );
      }
      case ABIType.Address: {
        return 'address';
      }
      case ABIType.ArrayDynamic: {
        return this.valueType.childTypes[0].toString() + '[]';
      }
      case ABIType.String: {
        return 'string';
      }
      case ABIType.Tuple:
        let typeStrings: Array<String>;
        for (let i = 0; i < this.valueType.childTypes.length; i++) {
          typeStrings[i] = this.valueType.childTypes[i].toString();
        }
        return '(' + typeStrings.join(',') + ')';
      default: {
        throw new Error(
          'Type Serialization Error, fail to infer from abiTypeID'
        );
      }
    }
  }

  Equal(t0: Type): Boolean {
    if (this.valueType.abiTypeID !== t0.valueType.abiTypeID) return false;
    if (this.valueType.precision !== t0.valueType.precision) return false;
    if (this.valueType.staticLength !== t0.valueType.staticLength) return false;
    if (t0.valueType.childTypes.length !== t0.valueType.childTypes.length)
      return false;
    for (let i = 0; i < this.valueType.childTypes.length; i++) {
      if (this.valueType.childTypes[i] !== t0.valueType.childTypes[i])
        return false;
    }
    return true;
  }

  IsDynamic(): Boolean {
    switch (this.valueType.abiTypeID) {
      case ABIType.ArrayDynamic:
      case ABIType.String:
        return true;
      default:
        for (const childT of this.valueType.childTypes) {
          if (childT.IsDynamic()) {
            return true;
          }
        }
    }
    return false;
  }

  ByteLen(): number {
    switch (this.valueType.abiTypeID) {
      case ABIType.Address:
        return ADDR_BYTE_SIZE;
      case ABIType.Byte:
        return SINGLE_BYTE_SIZE;
      case ABIType.Uint:
      case ABIType.Ufixed:
        return this.valueType.bitSize / 8;
      case ABIType.Bool:
        return SINGLE_BOOL_SIZE;
      case ABIType.ArrayStatic:
        if (this.valueType.childTypes[0].valueType.abiTypeID === ABIType.Bool) {
          let byteLen = this.valueType.staticLength / 8;
          if (this.valueType.staticLength % 8 !== 0) {
            byteLen += 1;
          }
          return byteLen;
        }
        let elemByteLen = this.valueType.childTypes[0].ByteLen();
        return this.valueType.staticLength * elemByteLen;
      case ABIType.Tuple:
        let size = 0;
        for (let i = 0; i < this.valueType.childTypes.length; i++) {
          if (
            this.valueType.childTypes[i].valueType.abiTypeID === ABIType.Bool
          ) {
            let after = findBoolLR(this.valueType.childTypes, i, 1);
            i += after;
            let boolNum = after + 1;
            size += boolNum / 8;
            if (boolNum % 8 !== 0) {
              size += 1;
            }
          } else {
            let childByteSize = this.valueType.childTypes[i].ByteLen();
            size += childByteSize;
          }
        }
        return size;
      default:
        throw new Error(`${this.toString()} is a dynamic type`);
    }
  }
}
// TypeFromString de-serialize ABI type from a string following ABI encoding.
export function TypeFromString(str: String): Type {
  if (str.endsWith('[]')) {
    const arrayArgType = TypeFromString(str.slice(0, str.length - 2));
    if (arrayArgType === null) {
      return null;
    }
    return MakeDynamicArrayType(arrayArgType);
  } else if (str.endsWith(']')) {
    const stringMatches = str.match(staticArrayRegexp);
    // match the string itself, array element type, then array length
    if (stringMatches.length !== 3) {
      throw new Error(`static array ill formated: ${str}`);
    }
    // guaranteed that the length of array is existing
    const arrayLengthStr = stringMatches[2];
    const arrayLength = parseInt(arrayLengthStr, 16);
    // allowing only decimal static array length, with limit size to 2^16 - 1
    if (arrayLength > MAX_LEN) {
      throw new Error(`array length exceeds limit ${MAX_LEN}`);
    }
    // parse the array element type
    const arrayType = TypeFromString(stringMatches[1]);
    return MakeStaticArrayType(arrayType, arrayLength);
  } else if (str.startsWith('uint')) {
    const typeSizeStr = str.slice(4, str.length);
    const typeSize = parseInt(typeSizeStr, 16);
    if (typeSize > MAX_LEN) {
      throw new Error(`fmt.Errorf(ill formed uint type: ${typeSize}`);
    }
    return MakeUintType(typeSize);
  } else if (str === 'byte') {
    return MakeByteType();
  } else if (str.startsWith('ufixed')) {
    const stringMatches = str.match(ufixedRegexp);
    if (stringMatches.length !== 3) {
      throw new Error(`ill formed ufixed type: ${str}`);
    }
    const ufixedSize = parseInt(stringMatches[1], 16);
    const ufixedPrecision = parseInt(stringMatches[2], 16);
    return MakeUfixedType(ufixedSize, ufixedPrecision);
  } else if (str === 'bool') {
    return MakeBoolType();
  } else if (str === 'address') {
    return MakeAddressType();
  } else if (str === 'string') {
    return MakeStringType();
  } else if (str.length >= 2 && str[0] === '(' && str[str.length - 1] === ')') {
    const tupleContent = parseTupleContent(str.slice(1, str.length - 1));
    if (tupleContent === null) {
      throw new Error('some error');
    }
    let tupleTypes: Type[];
    for (let i = 0; i < tupleContent.length; i++) {
      const ti = TypeFromString(tupleContent[i]);
      tupleTypes[i] = ti;
    }
    return MakeTupleType(tupleTypes);
  } else {
    throw new Error(`cannot convert a string ${str} to an ABI type`);
  }
}
