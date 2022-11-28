import assert from 'assert';
import {
  ABIAddressType,
  ABIArrayDynamicType,
  ABIArrayStaticType,
  ABIBoolType,
  ABIByteType,
  ABIStringType,
  ABITupleType,
  ABIUfixedType,
  ABIUintType,
  ABIType,
} from '../src/abi/abi_type';
import { decodeAddress } from '../src/encoding/address';

describe('ABI type checking', () => {
  it('should create the correct type from the string', () => {
    for (let i = 8; i < 513; i += 8) {
      let expected = new ABIUintType(i);
      let actual = ABIType.from(`uint${i}`);
      assert.deepStrictEqual(actual, expected);
      for (let j = 1; j < 161; j++) {
        expected = new ABIUfixedType(i, j);
        actual = ABIType.from(`ufixed${i}x${j}`);
        assert.deepStrictEqual(actual, expected);
      }
    }

    const testCases = [
      ['address', new ABIAddressType()],
      ['bool', new ABIBoolType()],
      ['byte', new ABIByteType()],
      ['string', new ABIStringType()],
      ['uint32[]', new ABIArrayDynamicType(new ABIUintType(32))],
      [
        'byte[][]',
        new ABIArrayDynamicType(new ABIArrayDynamicType(new ABIByteType())),
      ],
      ['ufixed256x64[]', new ABIArrayDynamicType(new ABIUfixedType(256, 64))],
      [
        'ufixed128x10[100]',
        new ABIArrayStaticType(new ABIUfixedType(128, 10), 100),
      ],
      [
        'bool[256][100]',
        new ABIArrayStaticType(
          new ABIArrayStaticType(new ABIBoolType(), 256),
          100
        ),
      ],
      ['()', new ABITupleType([])],
      [
        '(uint16,(byte,address[10]))',
        new ABITupleType([
          new ABIUintType(16),
          new ABITupleType([
            new ABIByteType(),
            new ABIArrayStaticType(new ABIAddressType(), 10),
          ]),
        ]),
      ],
      [
        '(uint256,(byte,address[10]),(),bool)',
        new ABITupleType([
          new ABIUintType(256),
          new ABITupleType([
            new ABIByteType(),
            new ABIArrayStaticType(new ABIAddressType(), 10),
          ]),
          new ABITupleType([]),
          new ABIBoolType(),
        ]),
      ],
      [
        '(ufixed256x16,((string),bool,(address,uint8)))',
        new ABITupleType([
          new ABIUfixedType(256, 16),
          new ABITupleType([
            new ABITupleType([new ABIStringType()]),
            new ABIBoolType(),
            new ABITupleType([new ABIAddressType(), new ABIUintType(8)]),
          ]),
        ]),
      ],
    ];

    for (const testCase of testCases) {
      const actual = ABIType.from(testCase[0] as string);
      assert.deepStrictEqual(actual, testCase[1]);
    }
  });
  it('should fail for an invalid bit size or precision', () => {
    const invalidSizes = [-1, 0, 9, 513, 1024];
    const invalidPrecisions = [-1, 0, 161];

    for (const size of invalidSizes) {
      assert.throws(() => new ABIUintType(size));
      assert.throws(() => new ABIUfixedType(size, 10));
    }
    for (const precision of invalidPrecisions) {
      assert.throws(() => new ABIUfixedType(8, precision));
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

    for (const testCase of testCases) {
      assert.throws(() => ABIType.from(testCase));
    }
  });
  it('should properly return whether the type is dynamic', () => {
    const testCases = [
      [new ABIUintType(8).isDynamic(), false],
      [new ABIUfixedType(16, 10).isDynamic(), false],
      [new ABIByteType().isDynamic(), false],
      [new ABIBoolType().isDynamic(), false],
      [new ABIAddressType().isDynamic(), false],
      [new ABIStringType().isDynamic(), true],
      [new ABIArrayDynamicType(new ABIBoolType()).isDynamic(), true],
      [
        new ABIArrayDynamicType(
          new ABIArrayDynamicType(new ABIByteType())
        ).isDynamic(),
        true,
      ],
      [ABIType.from('(string[100])').isDynamic(), true],
      [ABIType.from('(address,bool,uint256)').isDynamic(), false],
      [ABIType.from('(uint8,(byte[10]))').isDynamic(), false],
      [ABIType.from('(string,uint256)').isDynamic(), true],
      [ABIType.from('(bool,(ufixed16x10[],(byte,address)))').isDynamic(), true],
      [
        ABIType.from('(bool,(uint256,(byte,address,string)))').isDynamic(),
        true,
      ],
    ];

    for (const testCase of testCases) {
      const actual = testCase[0];
      const expected = testCase[1];
      assert.deepStrictEqual(actual, expected);
    }
  });
  it('should properly return the byte length of the type', () => {
    const testCases = [
      [new ABIAddressType().byteLen(), 32],
      [new ABIByteType().byteLen(), 1],
      [new ABIBoolType().byteLen(), 1],
      [new ABIUintType(64).byteLen(), 8],
      [new ABIUfixedType(256, 50).byteLen(), 32],
      [ABIType.from('bool[81]').byteLen(), 11],
      [ABIType.from('bool[80]').byteLen(), 10],
      [ABIType.from('bool[88]').byteLen(), 11],
      [ABIType.from('address[5]').byteLen(), 160],
      [ABIType.from('uint16[20]').byteLen(), 40],
      [ABIType.from('ufixed64x20[10]').byteLen(), 80],
      //   [ABIType.from('(address,byte,ufixed16x20)').byteLen(), 35],
      [
        ABIType.from(
          '((bool,address[10]),(bool,bool,bool),uint8[20])'
        ).byteLen(),
        342,
      ],
      [ABIType.from('(bool,bool)').byteLen(), 1],
      [ABIType.from(`(${'bool,'.repeat(6)}uint8)`).byteLen(), 2],
      [
        ABIType.from(
          `(${'bool,'.repeat(10)}uint8,${'bool,'.repeat(10)}byte)`
        ).byteLen(),
        6,
      ],
    ];

    for (const testCase of testCases) {
      const actual = testCase[0];
      const expected = testCase[1];
      assert.deepStrictEqual(actual, expected);
    }

    // Dynamic types should not have a byte length
    assert.throws(() => new ABIStringType().byteLen());
    assert.throws(() => new ABIArrayDynamicType(new ABIBoolType()).byteLen());
  });
});

describe('ABI encoding', () => {
  it('should encode the value correctly into bytes', () => {
    const testCases = [
      [new ABIUintType(8).encode(BigInt(0)), new Uint8Array([0])],
      [new ABIUintType(16).encode(BigInt(3)), new Uint8Array([0, 3])],
      [
        new ABIUintType(64).encode(256),
        new Uint8Array([0, 0, 0, 0, 0, 0, 1, 0]),
      ],
      [new ABIUfixedType(8, 30).encode(BigInt(255)), new Uint8Array([255])],
      [new ABIUfixedType(32, 10).encode(33), new Uint8Array([0, 0, 0, 33])],
      [
        new ABIAddressType().encode(
          'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
        ),
        decodeAddress(
          'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
        ).publicKey,
      ],
      [new ABIByteType().encode(10), new Uint8Array([10])],
      [new ABIByteType().encode(255), new Uint8Array([255])],
      [new ABIBoolType().encode(true), new Uint8Array([128])],
      [new ABIBoolType().encode(false), new Uint8Array([0])],
      [
        new ABIStringType().encode('asdf'),
        new Uint8Array([0, 4, 97, 115, 100, 102]),
      ],
      [
        new ABIArrayStaticType(new ABIBoolType(), 3).encode([
          true,
          true,
          false,
        ]),
        new Uint8Array([192]),
      ],
      [
        new ABIArrayStaticType(new ABIBoolType(), 8).encode([
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
        new ABIArrayStaticType(new ABIBoolType(), 8).encode([
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
        new ABIArrayStaticType(new ABIBoolType(), 9).encode([
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
        new ABIArrayStaticType(new ABIUintType(64), 3).encode([
          BigInt(1),
          BigInt(2),
          BigInt(3),
        ]),
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
      [
        new ABIArrayDynamicType(new ABIBoolType()).encode([]),
        new Uint8Array([0, 0]),
      ],
      [
        new ABIArrayDynamicType(new ABIBoolType()).encode([true, true, false]),
        new Uint8Array([0, 3, 192]),
      ],
      [
        new ABIArrayDynamicType(new ABIBoolType()).encode([
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
        new ABIArrayDynamicType(new ABIBoolType()).encode([
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
      [ABIType.from('()').encode([]), new Uint8Array([])],
      // 2^6 + 2^5 = 64 + 32 = 96
      [
        ABIType.from('(bool,bool,bool)').encode([false, true, true]),
        new Uint8Array([96]),
      ],
      [
        ABIType.from('(bool[3])').encode([[false, true, true]]),
        new Uint8Array([96]),
      ],
      [
        ABIType.from('(bool[])').encode([[false, true, true]]),
        new Uint8Array([0, 2, 0, 3, 96]),
      ],
      [
        ABIType.from('(bool[2],bool[])').encode([
          [true, true],
          [true, true],
        ]),
        new Uint8Array([192, 0, 3, 0, 2, 192]),
      ],
      [
        ABIType.from('(bool[],bool[])').encode([[], []]),
        new Uint8Array([0, 4, 0, 6, 0, 0, 0, 0]),
      ],
      [
        ABIType.from('(string,bool,bool,bool,bool,string)').encode([
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

    for (const testCase of testCases) {
      const actual = testCase[0];
      const expected = testCase[1];
      assert.deepStrictEqual(actual, expected);
    }
  });

  it('should fail for bad values during encoding', () => {
    assert.throws(() => new ABIUintType(8).encode(BigInt(-1)));
    assert.throws(() => new ABIUintType(512).encode(BigInt(2 ** 512)));
    assert.throws(() => new ABIUfixedType(512, 10).encode(BigInt(-1)));
    assert.throws(() => new ABIByteType().encode(-1));
    assert.throws(() => new ABIByteType().encode(256));
    assert.throws(() => new ABIAddressType().encode('BADADDRESS'));
    assert.throws(() =>
      new ABIArrayStaticType(new ABIBoolType(), 3).encode([true])
    );
    assert.throws(() =>
      new ABIArrayStaticType(new ABIStringType(), 1).encode([true])
    );
    assert.throws(() =>
      new ABIArrayStaticType(new ABIUintType(256), 1).encode(['hello'])
    );
    assert.throws(() =>
      new ABIArrayDynamicType(new ABIAddressType()).encode([false])
    );
    assert.throws(() =>
      new ABITupleType([new ABIBoolType(), new ABIUfixedType(128, 20)]).encode([
        BigInt(3),
        true,
      ])
    );
  });

  it('should decode the value correctly into bytes', () => {
    const testCases = [
      [new ABIUintType(8).decode(new Uint8Array([0])), BigInt(0)],
      [new ABIUintType(16).decode(new Uint8Array([0, 3])), BigInt(3)],
      [
        new ABIUintType(64).decode(new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0])),
        BigInt(2 ** 56),
      ],
      [new ABIUfixedType(8, 30).decode(new Uint8Array([255])), BigInt(255)],
      [
        new ABIUfixedType(32, 10).decode(new Uint8Array([0, 0, 0, 33])),
        BigInt(33),
      ],
      [
        new ABIAddressType().decode(
          decodeAddress(
            'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
          ).publicKey
        ),
        'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI',
      ],
      [new ABIByteType().decode(new Uint8Array([10])), 10],
      [new ABIByteType().decode(new Uint8Array([255])), 255],
      [new ABIBoolType().decode(new Uint8Array([128])), true],
      [new ABIBoolType().decode(new Uint8Array([0])), false],
      [
        new ABIStringType().decode(new Uint8Array([0, 4, 97, 115, 100, 102])),
        'asdf',
      ],
      [
        new ABIArrayStaticType(new ABIBoolType(), 3).decode(
          new Uint8Array([192])
        ),
        [true, true, false],
      ],
      [
        new ABIArrayStaticType(new ABIBoolType(), 8).decode(
          new Uint8Array([64])
        ),
        [false, true, false, false, false, false, false, false],
      ],
      [
        new ABIArrayStaticType(new ABIBoolType(), 8).decode(
          new Uint8Array([255])
        ),
        [true, true, true, true, true, true, true, true],
      ],
      [
        new ABIArrayStaticType(new ABIBoolType(), 9).decode(
          new Uint8Array([146, 128])
        ),
        [true, false, false, true, false, false, true, false, true],
      ],
      [
        new ABIArrayStaticType(new ABIUintType(64), 3).decode(
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
          ])
        ),
        [BigInt(1), BigInt(2), BigInt(3)],
      ],
      [
        new ABIArrayDynamicType(new ABIBoolType()).decode(
          new Uint8Array([0, 0])
        ),
        [],
      ],
      [
        new ABIArrayDynamicType(new ABIBoolType()).decode(
          new Uint8Array([0, 3, 192])
        ),
        [true, true, false],
      ],
      [
        new ABIArrayDynamicType(new ABIBoolType()).decode(
          new Uint8Array([0, 8, 64])
        ),
        [false, true, false, false, false, false, false, false],
      ],
      [
        new ABIArrayDynamicType(new ABIBoolType()).decode(
          new Uint8Array([0, 9, 146, 128])
        ),
        [true, false, false, true, false, false, true, false, true],
      ],
      [ABIType.from('()').decode(new Uint8Array([])), []],
      //   // 2^6 + 2^5 = 64 + 32 = 96
      [
        ABIType.from('(bool,bool,bool)').decode(new Uint8Array([96])),
        [false, true, true],
      ],
      [
        ABIType.from('(bool[3])').decode(new Uint8Array([96])),
        [[false, true, true]],
      ],
      [
        ABIType.from('(bool[])').decode(new Uint8Array([0, 2, 0, 3, 96])),
        [[false, true, true]],
      ],
      [
        ABIType.from('(bool[2],bool[])').decode(
          new Uint8Array([192, 0, 3, 0, 2, 192])
        ),
        [
          [true, true],
          [true, true],
        ],
      ],
      [
        ABIType.from('(bool[],bool[])').decode(
          new Uint8Array([0, 4, 0, 6, 0, 0, 0, 0])
        ),
        [[], []],
      ],
      [
        ABIType.from('(string,bool,bool,bool,bool,string)').decode(
          new Uint8Array([0, 5, 160, 0, 9, 0, 2, 65, 66, 0, 2, 68, 69])
        ),
        ['AB', true, false, true, false, 'DE'],
      ],
    ];

    for (const testCase of testCases) {
      const actual = testCase[0];
      const expected = testCase[1];
      assert.deepStrictEqual(actual, expected);
    }
  });
});
