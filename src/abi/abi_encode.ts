/* eslint-disable no-bitwise */
/* eslint-disable no-case-declarations */
/* eslint-disable no-lonely-if */
/* eslint-disable*/ //TODO: remove before PR

import {
  ABIType,
  findBoolLR,
  Type,
  MakeTupleType,
  ADDR_BYTE_SIZE,
  LENGTH_ENCODE_BYTE_SIZE,
  Segment,
  MAX_LEN,
  MakeUintType,
  MakeUfixedType,
  MakeBoolType,
  MakeAddressType,
  MakeByteType,
  MakeStaticArrayType,
  MakeStringType,
} from './abi_type';

// compressMultipleBool compress consecutive bool values into a byte in ABI tuple / array value.
function compressMultipleBool(valueList: any[], schema: Type): number {
  let res = 0;
  if (valueList.length > 8) {
    throw new Error('value list passed in should be no greater than length 8');
  }
  for (let i = 0; i < valueList.length; i++) {
    let valueType = schema.valueType.childTypes[i].valueType.abiTypeID;
    if (valueType !== ABIType.Bool) {
      throw new Error('bool type not matching in compressMultipleBool');
    }
    let boolVal = valueList[i].GetBool();

    if (boolVal) {
      res |= 1 << (7 - i);
    }
  }
  return res;
}

// TupleEncoding encodes an ABI value of tuple type into an ABI encoded byte string.
export default function TupleEncoding(
  values: [...any[]],
  schema: Type
): Uint8Array {
  if (schema.valueType.abiTypeID !== ABIType.Tuple) {
    throw new Error('type not supported in tupleEncoding');
  }
  if (schema.valueType.childTypes.length >= MAX_LEN + 1) {
    throw new Error('value abi type exceed 2^16');
  }

  if (values.length !== schema.valueType.childTypes.length) {
    throw new Error(
      'tuple abi child type number unmatch with tuple argument number'
    );
  }
  let heads: Buffer[];
  let tails: Uint8Array[];
  let isDynamicIndex = new Map();

  for (let i = 0; i < schema.valueType.childTypes.length; i++) {
    let tupleElemSchema = schema.valueType.childTypes[i];
    if (tupleElemSchema.IsDynamic()) {
      // if it is a dynamic value, the head component is not pre-determined
      // we store an empty placeholder first, since we will need it in byte length calculation
      let headsPlaceHolder: Buffer;
      headsPlaceHolder[0] = 0x00;
      headsPlaceHolder[1] = 0x00;
      heads[i] = headsPlaceHolder;
      // we keep track that the index points to a dynamic value
      isDynamicIndex[i] = true;
      let tailEncoding = Encode(values[i], tupleElemSchema);
      tails[i] = tailEncoding;
    } else {
      if (tupleElemSchema.valueType.abiTypeID === ABIType.Bool) {
        // search previous bool
        let before = findBoolLR(schema.valueType.childTypes, i, -1);
        // search after bool
        let after = findBoolLR(schema.valueType.childTypes, i, 1);
        // append to heads and tails
        if (before % 8 !== 0) {
          throw new Error('expected before has number of bool mod 8 = 0');
        }
        if (after > 7) {
          after = 7;
        }
        let compressed = compressMultipleBool(
          values.slice(i, i + after + 1),
          schema
        );
        heads[i] = Buffer.from([compressed]);
        i += after;
      } else {
        let encodeTi = Encode(values[i], tupleElemSchema);
        heads[i] = Buffer.from(encodeTi);
      }
      isDynamicIndex[i] = false;
    }
  }
  // adjust heads for dynamic type
  // since head size can be pre-determined (for we are storing static value and dynamic value index in head)
  // we accumulate the head size first
  // (also note that though head size is pre-determined, head value is not necessarily pre-determined)
  let headLength = 0;
  for (let headTi of heads) {
    headLength += headTi.length;
  }
  // when we iterate through the heads (byte slice), we need to find heads for dynamic values
  // the head should correspond to the start index: len( head(x[1]) ... head(x[N]) tail(x[1]) ... tail(x[i-1]) ).
  let tailCurrLength = 0;
  for (let i = 0; i < heads.length; i++) {
    if (isDynamicIndex[i]) {
      let headValue = headLength + tailCurrLength;
      if (headValue >= 1 << 16) {
        throw new Error('encoding error: byte length exceed 2^16');
      }
      heads[i] = Buffer.allocUnsafe(schema.valueType.childTypes.length);
      heads[i].writeInt16BE(headValue);
    }
    tailCurrLength += tails[i].length;
  }

  // concat everything as the abi encoded bytes
  let encoded = new Uint8Array(headLength + tailCurrLength);
  for (let i = 0; i < heads.length; i++) {
    for (let j = 0; j < heads[i].length; j++) {
      encoded[i] = heads[i][j];
    }
  }
  for (let i = heads.length; i < tails.length; i++) {
    for (let j = 0; j < tails.length; j++) {
      encoded[i] = tails[i][j];
    }
  }
  return encoded;
}

// Encode method serialize the ABI value into a byte string of ABI encoding rule.
function Encode(value, schema: Type): Uint8Array {
  switch (schema.valueType.abiTypeID) {
    case ABIType.Uint:
      let bigIntBytes = new Uint8Array([Number(value)]);
      return bigIntBytes;
    case ABIType.Ufixed:
      let encodedBuffer = new Uint8Array([Number(value)]);
      return encodedBuffer;
    case ABIType.Bool:
      if (value) {
        return new Uint8Array([0x80]);
      }
      return new Uint8Array([0x00]);
    case ABIType.Byte:
      return new Uint8Array(value);
    case ABIType.ArrayStatic:
    case ABIType.Address:
      return TupleEncoding(value, schema);
    case ABIType.ArrayDynamic:
    case ABIType.String:
      let length = value.valueType.childTypes.length;
      let lengthEncode = Buffer.allocUnsafe(2);
      let encoded = TupleEncoding(value, schema);
      lengthEncode.writeUInt16BE(length);
      for (let byte of encoded) {
        lengthEncode.write(byte.toString());
      }
      return lengthEncode;
    case ABIType.Tuple:
      return TupleEncoding(value, schema);
    default:
      throw new Error('Encoding: unknown type error');
  }
}

// tupleDecoding takes a byte string and an ABI tuple type,
// and decodes the bytes into an ABI tuple value.
function tupleDecoding(valueBytes: Uint8Array, type: Type): [Type, ...any[]] {
  let dynamicSegments: Segment[];
  let valuePartition: Uint8Array[];
  let iterIndex = 0;

  for (let i = 0; i < type.valueType.childTypes.length; i++) {
    if (type.valueType.childTypes[i].IsDynamic()) {
      if (
        valueBytes.slice(iterIndex, valueBytes.length).length <
        LENGTH_ENCODE_BYTE_SIZE
      ) {
        throw new Error('ill formed tuple dynamic typed value encoding');
      }
      // let dynamicIndex = binary.BigEndian.Uint16(valueBytes[iterIndex : iterIndex + lengthEncodeByteSize])
      let dynamicIndex = 0;
      if (dynamicSegments.length > 0) {
        dynamicSegments[dynamicSegments.length - 1].right = dynamicIndex;
      }
      // we know where encoded bytes for dynamic value start, but we do not know where it ends
      // unless we see the start of the next encoded bytes for dynamic value
      let seg: Segment = {
        left: dynamicIndex,
        right: -1,
      };
      dynamicSegments.push(seg);
      valuePartition.push(null);
      iterIndex += LENGTH_ENCODE_BYTE_SIZE;
    } else {
      // if bool ...
      if (type.valueType.childTypes[i].valueType.abiTypeID === ABIType.Bool) {
        // search previous bool
        let before = findBoolLR(type.valueType.childTypes, i, -1);
        // search after bool
        let after = findBoolLR(type.valueType.childTypes, i, 1);
        if (before % 8 === 0) {
          if (after > 7) {
            after = 7;
          }
          // parse bool in a byte to multiple byte strings
          for (let boolIndex = 0; boolIndex <= after; boolIndex++) {
            let boolMask = 0x80 >> boolIndex;
            if ((valueBytes[iterIndex] & boolMask) > 0) {
              let byte = new Uint8Array(1);
              byte[0] = 0x80;
              valuePartition.push(byte);
            } else {
              let byte = new Uint8Array(1);
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
        let currLen = type.valueType.childTypes[i].ByteLen();

        // valuePartition = append(valuePartition, valueBytes[iterIndex: iterIndex + currLen])
        iterIndex += currLen;
      }
    }
    if (
      i !== type.valueType.childTypes.length - 1 &&
      iterIndex >= valueBytes.length
    ) {
      throw new Error('input byte not enough to decode');
    }
  }
  if (dynamicSegments.length > 0) {
    dynamicSegments[dynamicSegments.length - 1].right = valueBytes.length;
    iterIndex = valueBytes.length;
  }
  if (iterIndex < valueBytes.length) {
    throw new Error('input byte not fully consumed');
  }

  // check segment indices are valid
  // if the dynamic segment are not consecutive and well-ordered, we return error
  for (let i = 0; i < dynamicSegments.length; i++) {
    let seg = dynamicSegments[i];
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
  for (let i = 0; i < type.valueType.childTypes.length; i++) {
    if (type.valueType.childTypes[i].IsDynamic()) {
      valuePartition[i] = valueBytes.slice(
        dynamicSegments[segIndex].left,
        dynamicSegments[segIndex].right
      );
      segIndex += 1;
    }
  }

  // decode each tuple element bytes
  let values: any[];
  for (let i = 0; i < type.valueType.childTypes.length; i++) {
    let valueTi = Decode(valuePartition[i], type.valueType.childTypes[i]);
    values.push(valueTi);
  }
  return [type, values];
}

// Decode takes an ABI encoded byte string and a target ABI type,
// and decodes the bytes into (value, schema).
function Decode(valueByte: Uint8Array, type: Type): [any, Type] {
  switch (type.valueType.abiTypeID) {
    case ABIType.Uint:
      if (valueByte.length !== type.valueType.bitSize / 8) {
        throw new Error(
          `uint${type.valueType.bitSize} decode: expected byte length ${
            type.valueType.bitSize / 8
          } but got byte length ${valueByte.length}`
        );
      }
      return [valueByte, MakeUintType(8)];
    case ABIType.Ufixed:
      if (valueByte.length !== type.valueType.bitSize / 8) {
        throw new Error(
          `ufixed${type.valueType.bitSize}x${type.valueType.precision}  decode: expected length {valueType.bitSize / 8}, got byte length ${valueByte.length}`
        );
      }
      return [
        valueByte,
        MakeUfixedType(type.valueType.bitSize, type.valueType.precision),
      ];
    case ABIType.Bool:
      if (valueByte.length !== 1) {
        throw new Error('boolean byte should be length 1 byte');
      }
      let boolValue: Boolean;
      if (valueByte[0] === 0x00) {
        boolValue = false;
      } else if (valueByte[0] === 0x80) {
        boolValue = true;
      } else {
        throw new Error(
          'sinble boolean encoded byte should be of form 0x80 or 0x00'
        );
      }
      return [boolValue, MakeBoolType()];
    case ABIType.Byte:
      if (valueByte.length !== 1) {
        throw new Error('byte should be length 1');
      }
      return [valueByte[0], MakeByteType()];
    case ABIType.ArrayStatic:
      let childT: Type[];
      for (let i = 0; i < type.valueType.staticLength; i++) {
        childT[i] = type.valueType.childTypes[0];
      }
      let converted = MakeTupleType(childT);
      let tupleDecoded = tupleDecoding(valueByte, converted);
      return [
        tupleDecoded,
        MakeStaticArrayType(
          type.valueType.childTypes[0],
          type.valueType.staticLength
        ),
      ];
    case ABIType.Address:
      if (valueByte.length !== ADDR_BYTE_SIZE) {
        throw new Error('address should be length 32');
      }
      return [valueByte, MakeAddressType()];
    case ABIType.ArrayDynamic:
      if (valueByte.length < LENGTH_ENCODE_BYTE_SIZE) {
        throw new Error('dynamic array format corrupted');
      }
      let buf = Buffer.alloc(2);
      buf.writeInt16BE(Number(valueByte.slice(0, LENGTH_ENCODE_BYTE_SIZE)));
      let dynamicLen = buf.readInt16BE();
      for (let i = 0; i < dynamicLen; i++) {
        childT[i] = type.valueType.childTypes[0];
      }
      converted = MakeTupleType(childT);
      tupleDecoded = tupleDecoding(
        valueByte.slice(LENGTH_ENCODE_BYTE_SIZE, valueByte.length),
        converted
      );
      return [tupleDecoded, MakeTupleType(childT)];
    case ABIType.String:
      if (valueByte.length < LENGTH_ENCODE_BYTE_SIZE) {
        throw new Error('string format corrupted');
      }
      let stringLenBytes = valueByte.slice(0, LENGTH_ENCODE_BYTE_SIZE);
      buf = Buffer.allocUnsafe(2);
      buf.writeInt16BE(Number(stringLenBytes));
      let byteLen = buf.readInt16BE();
      if (
        valueByte.slice(LENGTH_ENCODE_BYTE_SIZE, valueByte.length).length !==
        byteLen
      ) {
        throw new Error('string representation in byte: length not matching');
      }
      return [
        valueByte.slice(LENGTH_ENCODE_BYTE_SIZE, valueByte.length).toString(),
        MakeStringType(),
      ];
    case ABIType.Tuple:
      return [tupleDecoding(valueByte, type), MakeTupleType([type])];
    default:
      throw new Error('decode: unknown type error');
  }
}
