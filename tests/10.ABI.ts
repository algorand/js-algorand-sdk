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

const assert = require('assert');

describe('ABIType', () => {
  describe('TypeFromString', () => {
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
        [
          'byte[][]',
          new ArrayDynamicType(new ArrayDynamicType(new ByteType())),
        ],
        ['ufixed256x64[]', new ArrayDynamicType(new UfixedType(256, 64))],
        [
          'ufixed128x10[100]',
          new ArrayStaticType(new UfixedType(128, 10), 100),
        ],
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
  });
});
