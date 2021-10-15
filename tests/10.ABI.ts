/* eslint-disable*/

import {
  AddressType,
  ArrayDynamicType,
  ArrayStaticType,
  BoolType,
  ByteType,
  StringType,
  TupleType,
  TypeFromString,
  UfixedType,
  UintType,
} from '../src/abi/abi_type';
import algosdk from '..';

const assert = require('assert');

describe('ABI type checking', () => {
  it('should create the correct type from the string', () => {
    for (let i = 8; i < 513; i += 8) {
      let expected = new UintType(i);
      let actual = TypeFromString(`uint${i}`);
      assert.deepEqual(actual, expected);
      for (let j = 1; j < 161; j++) {
        expected = new UfixedType(i, j);
        actual = TypeFromString(`ufixed${i}x${j}`);
        assert.deepEqual(actual, expected);
      }
    }

    const testCases = [
      ['address', new AddressType()],
      ['bool', new BoolType()],
      ['byte', new ByteType()],
      ['string', new StringType()],
      ['uint32[]', new ArrayDynamicType(new UintType(32))],
      ['byte[][]', new ArrayDynamicType(new ArrayDynamicType(new ByteType()))],
      ['ufixed256x64[]', new ArrayDynamicType(new UfixedType(256, 64))],
      ['ufixed128x10[100]', new ArrayStaticType(new UfixedType(128, 10), 100)],
      [
        'bool[256][100]',
        new ArrayStaticType(new ArrayStaticType(new BoolType(), 256), 100),
      ],
      ['()', new TupleType([])],
      [
        '(uint16,(byte,address[10]))',
        new TupleType([
          new UintType(16),
          new TupleType([
            new ByteType(),
            new ArrayStaticType(new AddressType(), 10),
          ]),
        ]),
      ],
      [
        '(uint256,(byte,address[10]),(),bool)',
        new TupleType([
          new UintType(256),
          new TupleType([
            new ByteType(),
            new ArrayStaticType(new AddressType(), 10),
          ]),
          new TupleType([]),
          new BoolType(),
        ]),
      ],
      [
        '(ufixed256x16,((string),bool,(address,uint8)))',
        new TupleType([
          new UfixedType(256, 16),
          new TupleType([
            new TupleType([new StringType()]),
            new BoolType(),
            new TupleType([new AddressType(), new UintType(8)]),
          ]),
        ]),
      ],
    ];

    for (const testCase of testCases) {
      const actual = TypeFromString(testCase[0] as string);
      assert.deepEqual(actual, testCase[1]);
    }
  });
  it('should fail for an invalid bit size or precision', () => {
    const invalidSizes = [-1, 0, 9, 513, 1024];
    const invalidPrecisions = [-1, 0, 161];

    for (let size of invalidSizes) {
      assert.throws(() => new UintType(size));
      assert.throws(() => new UfixedType(size, 10));
    }
    for (let precision of invalidPrecisions) {
      assert.throws(() => new UfixedType(8, precision));
    }
  });
  it('should fail for an invalid type string', () => {
    const testCases = [
      // uint
      'uint 8',
      'uint8 ',
      'uint123x345',
      'uint!8',
      'uint[32]',
      'uint-893',
      'uint#120\\',
      // ufixed
      'ufixed000000000016x0000010',
      'ufixed123x345',
      'ufixed 128 x 100',
      'ufixed64x10 ',
      'ufixed!8x2 ',
      'ufixed[32]x16',
      'ufixed-64x+100',
      'ufixed16x+12',
      // dynamic array
      'byte[] ',
      '[][][]',
      'stuff[]',
      // static array
      'ufixed32x10[0]',
      'byte[10 ]',
      'uint64[0x21]',
      // tuple
      '(ufixed128x10))',
      '(,uint128,byte[])',
      '(address,ufixed64x5,)',
      '(byte[16],somethingwrong)',
      '(                )',
      '((uint32)',
      '(byte,,byte)',
      '((byte),,(byte))',
    ];

    for (let testCase of testCases) {
      assert.throws(() => TypeFromString(testCase));
    }
  });
  it('should properly return whether the type is dynamic', () => {
    const testCases = [
      [new UintType(8).IsDynamic(), false],
      [new UfixedType(16, 10).IsDynamic(), false],
      [new ByteType().IsDynamic(), false],
      [new BoolType().IsDynamic(), false],
      [new AddressType().IsDynamic(), false],
      [new StringType().IsDynamic(), true],
      [new ArrayDynamicType(new BoolType()).IsDynamic(), true],
      [
        new ArrayDynamicType(new ArrayDynamicType(new ByteType())).IsDynamic(),
        true,
      ],
      [TypeFromString('(string[100])').IsDynamic(), true],
      [TypeFromString('(address,bool,uint256)').IsDynamic(), false],
      [TypeFromString('(uint8,(byte[10]))').IsDynamic(), false],
      [TypeFromString('(string,uint256)').IsDynamic(), true],
      [
        TypeFromString('(bool,(ufixed16x10[],(byte,address)))').IsDynamic(),
        true,
      ],
      [
        TypeFromString('(bool,(uint256,(byte,address,string)))').IsDynamic(),
        true,
      ],
    ];

    for (let testCase of testCases) {
      const actual = testCase[0];
      const expected = testCase[1];
      assert.deepEqual(actual, expected);
    }
  });
  it('should properly return the byte length of the type', () => {
    const testCases = [
      [new AddressType().ByteLen(), 32],
      [new ByteType().ByteLen(), 1],
      [new BoolType().ByteLen(), 1],
      [new UintType(64).ByteLen(), 8],
      [new UfixedType(256, 50).ByteLen(), 32],
      [TypeFromString('bool[81]').ByteLen(), 11],
      [TypeFromString('bool[80]').ByteLen(), 10],
      [TypeFromString('bool[88]').ByteLen(), 11],
      [TypeFromString('address[5]').ByteLen(), 160],
      [TypeFromString('uint16[20]').ByteLen(), 40],
      [TypeFromString('ufixed64x20[10]').ByteLen(), 80],
      //   [TypeFromString('(address,byte,ufixed16x20)').ByteLen(), 35],
      [
        TypeFromString(
          '((bool,address[10]),(bool,bool,bool),uint8[20])'
        ).ByteLen(),
        342,
      ],
      [TypeFromString('(bool,bool)').ByteLen(), 1],
      [TypeFromString(`(${'bool,'.repeat(6)}uint8)`).ByteLen(), 2],
      [
        TypeFromString(
          `(${'bool,'.repeat(10)}uint8,${'bool,'.repeat(10)}byte)`
        ).ByteLen(),
        6,
      ],
    ];

    for (let testCase of testCases) {
      const actual = testCase[0];
      const expected = testCase[1];
      assert.deepEqual(actual, expected);
    }

    // Dynamic types should not have a byte length
    assert.throws(() => new StringType().ByteLen());
    assert.throws(() => new ArrayDynamicType(new BoolType()).ByteLen());
  });
});

describe('ABI encoding', () => {
  it('should encode the value correctly into bytes', () => {
    const testCases = [
      [new UintType(8).Encode(0n), new Uint8Array([0])],
      [new UintType(16).Encode(3n), new Uint8Array([0, 3])],
      [new UintType(64).Encode(256n), new Uint8Array([0, 0, 0, 0, 0, 0, 1, 0])],
      [new UfixedType(8, 30).Encode(255n), new Uint8Array([255])],
      [new UfixedType(32, 10).Encode(33n), new Uint8Array([0, 0, 0, 33])],
      [
        new AddressType().Encode(
          'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
        ),
        algosdk.decodeAddress(
          'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
        ).publicKey,
      ],
      [new ByteType().Encode(10), new Uint8Array([10])],
      [new ByteType().Encode(255), new Uint8Array([255])],
      [new BoolType().Encode(true), new Uint8Array([128])],
      [new BoolType().Encode(false), new Uint8Array([0])],
      [
        new StringType().Encode('asdf'),
        new Uint8Array([0, 4, 97, 115, 100, 102]),
      ],
      [
        new ArrayStaticType(new BoolType(), 3).Encode([true, true, false]),
        new Uint8Array([192]),
      ],
      [
        new ArrayStaticType(new BoolType(), 8).Encode([
          false,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
        ]),
        new Uint8Array([64]),
      ],
      [
        new ArrayStaticType(new BoolType(), 8).Encode([
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
        ]),
        new Uint8Array([255]),
      ],
      [
        new ArrayStaticType(new BoolType(), 9).Encode([
          true,
          false,
          false,
          true,
          false,
          false,
          true,
          false,
          true,
        ]),
        new Uint8Array([146, 128]),
      ],
      [
        new ArrayStaticType(new UintType(64), 3).Encode([1, 2, 3]),
        new Uint8Array([
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          2,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          3,
        ]),
      ],
      [new ArrayDynamicType(new BoolType()).Encode([]), new Uint8Array([0, 0])],
      [
        new ArrayDynamicType(new BoolType()).Encode([true, true, false]),
        new Uint8Array([0, 3, 192]),
      ],
      [
        new ArrayDynamicType(new BoolType()).Encode([
          false,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
        ]),
        new Uint8Array([0, 8, 64]),
      ],
      [
        new ArrayDynamicType(new BoolType()).Encode([
          true,
          false,
          false,
          true,
          false,
          false,
          true,
          false,
          true,
        ]),
        new Uint8Array([0, 9, 146, 128]),
      ],
      // TODO: We cannot have a fixed length array of length 0 in JS, what should this return?
      // [(TypeFromString('()').Encode([]), new Uint8Array([]))],
      // 2^6 + 2^5 = 64 + 32 = 96
      [
        TypeFromString('(bool,bool,bool)').Encode([false, true, true]),
        new Uint8Array([96]),
      ],
      [
        TypeFromString('(bool[3])').Encode([[false, true, true]]),
        new Uint8Array([96]),
      ],
      [
        TypeFromString('(bool[])').Encode([[false, true, true]]),
        new Uint8Array([0, 2, 0, 3, 96]),
      ],
      [
        TypeFromString('(bool[2],bool[])').Encode([
          [true, true],
          [true, true],
        ]),
        new Uint8Array([192, 0, 3, 0, 2, 192]),
      ],
      [
        TypeFromString('(bool[],bool[])').Encode([[], []]),
        new Uint8Array([0, 4, 0, 6, 0, 0, 0, 0]),
      ],
      [
        TypeFromString('(string,bool,bool,bool,bool,string)').Encode([
          'AB',
          true,
          false,
          true,
          false,
          'DE',
        ]),
        new Uint8Array([0, 5, 160, 0, 9, 0, 2, 65, 66, 0, 2, 68, 69]),
      ],
    ];

    for (let testCase of testCases) {
      const actual = testCase[0];
      const expected = testCase[1];
      assert.deepEqual(actual, expected);
    }
  });
});
