import assert from 'assert';
import {
  AddressType,
  ArrayDynamicType,
  ArrayStaticType,
  BoolType,
  ByteType,
  StringType,
  TupleType,
  UfixedType,
  UintType,
  Type,
} from '../src/abi/abi_type';
import { decodeAddress } from '../src/encoding/address';

describe('ABI type checking', () => {
  it('should create the correct type from the string', () => {
    for (let i = 8; i < 513; i += 8) {
      let expected = new UintType(i);
      let actual = Type.from(`uint${i}`);
      assert.deepStrictEqual(actual, expected);
      for (let j = 1; j < 161; j++) {
        expected = new UfixedType(i, j);
        actual = Type.from(`ufixed${i}x${j}`);
        assert.deepStrictEqual(actual, expected);
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
      const actual = Type.from(testCase[0] as string);
      assert.deepStrictEqual(actual, testCase[1]);
    }
  });
  it('should fail for an invalid bit size or precision', () => {
    const invalidSizes = [-1, 0, 9, 513, 1024];
    const invalidPrecisions = [-1, 0, 161];

    for (const size of invalidSizes) {
      assert.throws(() => new UintType(size));
      assert.throws(() => new UfixedType(size, 10));
    }
    for (const precision of invalidPrecisions) {
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

    for (const testCase of testCases) {
      assert.throws(() => Type.from(testCase));
    }
  });
  it('should properly return whether the type is dynamic', () => {
    const testCases = [
      [new UintType(8).isDynamic(), false],
      [new UfixedType(16, 10).isDynamic(), false],
      [new ByteType().isDynamic(), false],
      [new BoolType().isDynamic(), false],
      [new AddressType().isDynamic(), false],
      [new StringType().isDynamic(), true],
      [new ArrayDynamicType(new BoolType()).isDynamic(), true],
      [
        new ArrayDynamicType(new ArrayDynamicType(new ByteType())).isDynamic(),
        true,
      ],
      [Type.from('(string[100])').isDynamic(), true],
      [Type.from('(address,bool,uint256)').isDynamic(), false],
      [Type.from('(uint8,(byte[10]))').isDynamic(), false],
      [Type.from('(string,uint256)').isDynamic(), true],
      [Type.from('(bool,(ufixed16x10[],(byte,address)))').isDynamic(), true],
      [Type.from('(bool,(uint256,(byte,address,string)))').isDynamic(), true],
    ];

    for (const testCase of testCases) {
      const actual = testCase[0];
      const expected = testCase[1];
      assert.deepStrictEqual(actual, expected);
    }
  });
  it('should properly return the byte length of the type', () => {
    const testCases = [
      [new AddressType().byteLen(), 32],
      [new ByteType().byteLen(), 1],
      [new BoolType().byteLen(), 1],
      [new UintType(64).byteLen(), 8],
      [new UfixedType(256, 50).byteLen(), 32],
      [Type.from('bool[81]').byteLen(), 11],
      [Type.from('bool[80]').byteLen(), 10],
      [Type.from('bool[88]').byteLen(), 11],
      [Type.from('address[5]').byteLen(), 160],
      [Type.from('uint16[20]').byteLen(), 40],
      [Type.from('ufixed64x20[10]').byteLen(), 80],
      //   [Type.from('(address,byte,ufixed16x20)').byteLen(), 35],
      [
        Type.from('((bool,address[10]),(bool,bool,bool),uint8[20])').byteLen(),
        342,
      ],
      [Type.from('(bool,bool)').byteLen(), 1],
      [Type.from(`(${'bool,'.repeat(6)}uint8)`).byteLen(), 2],
      [
        Type.from(
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
    assert.throws(() => new StringType().byteLen());
    assert.throws(() => new ArrayDynamicType(new BoolType()).byteLen());
  });
});

describe('ABI encoding', () => {
  it('should encode the value correctly into bytes', () => {
    const testCases = [
      [new UintType(8).encode(0n), new Uint8Array([0])],
      [new UintType(16).encode(3n), new Uint8Array([0, 3])],
      [new UintType(64).encode(256), new Uint8Array([0, 0, 0, 0, 0, 0, 1, 0])],
      [new UfixedType(8, 30).encode(255n), new Uint8Array([255])],
      [new UfixedType(32, 10).encode(33), new Uint8Array([0, 0, 0, 33])],
      [
        new AddressType().encode(
          'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
        ),
        decodeAddress(
          'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
        ).publicKey,
      ],
      [new ByteType().encode(10), new Uint8Array([10])],
      [new ByteType().encode(255), new Uint8Array([255])],
      [new BoolType().encode(true), new Uint8Array([128])],
      [new BoolType().encode(false), new Uint8Array([0])],
      [
        new StringType().encode('asdf'),
        new Uint8Array([0, 4, 97, 115, 100, 102]),
      ],
      [
        new ArrayStaticType(new BoolType(), 3).encode([true, true, false]),
        new Uint8Array([192]),
      ],
      [
        new ArrayStaticType(new BoolType(), 8).encode([
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
        new ArrayStaticType(new BoolType(), 8).encode([
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
        new ArrayStaticType(new BoolType(), 9).encode([
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
        new ArrayStaticType(new UintType(64), 3).encode([
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
      [new ArrayDynamicType(new BoolType()).encode([]), new Uint8Array([0, 0])],
      [
        new ArrayDynamicType(new BoolType()).encode([true, true, false]),
        new Uint8Array([0, 3, 192]),
      ],
      [
        new ArrayDynamicType(new BoolType()).encode([
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
        new ArrayDynamicType(new BoolType()).encode([
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
      // [(Type.from('()').encode([]), new Uint8Array([]))],
      // 2^6 + 2^5 = 64 + 32 = 96
      [
        Type.from('(bool,bool,bool)').encode([false, true, true]),
        new Uint8Array([96]),
      ],
      [
        Type.from('(bool[3])').encode([[false, true, true]]),
        new Uint8Array([96]),
      ],
      [
        Type.from('(bool[])').encode([[false, true, true]]),
        new Uint8Array([0, 2, 0, 3, 96]),
      ],
      [
        Type.from('(bool[2],bool[])').encode([
          [true, true],
          [true, true],
        ]),
        new Uint8Array([192, 0, 3, 0, 2, 192]),
      ],
      [
        Type.from('(bool[],bool[])').encode([[], []]),
        new Uint8Array([0, 4, 0, 6, 0, 0, 0, 0]),
      ],
      [
        Type.from('(string,bool,bool,bool,bool,string)').encode([
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
    assert.throws(() => new UintType(8).encode(BigInt(-1)));
    assert.throws(() => new UintType(512).encode(BigInt(2 ** 512)));
    assert.throws(() => new UfixedType(512, 10).encode(BigInt(-1)));
    assert.throws(() => new ByteType().encode(-1));
    assert.throws(() => new ByteType().encode(256));
    assert.throws(() => new AddressType().encode('BADADDRESS'));
    assert.throws(() => new ArrayStaticType(new BoolType(), 3).encode([true]));
    assert.throws(() =>
      new ArrayStaticType(new StringType(), 1).encode([true])
    );
    assert.throws(() =>
      new ArrayStaticType(new UintType(256), 1).encode(['hello'])
    );
    assert.throws(() =>
      new ArrayDynamicType(new AddressType()).encode([false])
    );
    assert.throws(() =>
      new TupleType([new BoolType(), new UfixedType(128, 20)]).encode([
        BigInt(3),
        true,
      ])
    );
  });

  it('should decode the value correctly into bytes', () => {
    const testCases = [
      [new UintType(8).decode(new Uint8Array([0])), 0n],
      [new UintType(16).decode(new Uint8Array([0, 3])), 3n],
      [
        new UintType(64).decode(new Uint8Array([1, 0, 0, 0, 0, 0, 0, 0])),
        BigInt(2 ** 56),
      ],
      [new UfixedType(8, 30).decode(new Uint8Array([255])), 255n],
      [new UfixedType(32, 10).decode(new Uint8Array([0, 0, 0, 33])), 33n],
      [
        new AddressType().decode(
          decodeAddress(
            'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
          ).publicKey
        ),
        'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI',
      ],
      [new ByteType().decode(new Uint8Array([10])), 10],
      [new ByteType().decode(new Uint8Array([255])), 255],
      [new BoolType().decode(new Uint8Array([128])), true],
      [new BoolType().decode(new Uint8Array([0])), false],
      [
        new StringType().decode(new Uint8Array([0, 4, 97, 115, 100, 102])),
        'asdf',
      ],
      [
        new ArrayStaticType(new BoolType(), 3).decode(new Uint8Array([192])),
        [true, true, false],
      ],
      [
        new ArrayStaticType(new BoolType(), 8).decode(new Uint8Array([64])),
        [false, true, false, false, false, false, false, false],
      ],
      [
        new ArrayStaticType(new BoolType(), 8).decode(new Uint8Array([255])),
        [true, true, true, true, true, true, true, true],
      ],
      [
        new ArrayStaticType(new BoolType(), 9).decode(
          new Uint8Array([146, 128])
        ),
        [true, false, false, true, false, false, true, false, true],
      ],
      [
        new ArrayStaticType(new UintType(64), 3).decode(
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
      [new ArrayDynamicType(new BoolType()).decode(new Uint8Array([0, 0])), []],
      [
        new ArrayDynamicType(new BoolType()).decode(
          new Uint8Array([0, 3, 192])
        ),
        [true, true, false],
      ],
      [
        new ArrayDynamicType(new BoolType()).decode(new Uint8Array([0, 8, 64])),
        [false, true, false, false, false, false, false, false],
      ],
      [
        new ArrayDynamicType(new BoolType()).decode(
          new Uint8Array([0, 9, 146, 128])
        ),
        [true, false, false, true, false, false, true, false, true],
      ],
      [Type.from('()').decode(new Uint8Array([])), []],
      //   // 2^6 + 2^5 = 64 + 32 = 96
      [
        Type.from('(bool,bool,bool)').decode(new Uint8Array([96])),
        [false, true, true],
      ],
      [
        Type.from('(bool[3])').decode(new Uint8Array([96])),
        [[false, true, true]],
      ],
      [
        Type.from('(bool[])').decode(new Uint8Array([0, 2, 0, 3, 96])),
        [[false, true, true]],
      ],
      [
        Type.from('(bool[2],bool[])').decode(
          new Uint8Array([192, 0, 3, 0, 2, 192])
        ),
        [
          [true, true],
          [true, true],
        ],
      ],
      [
        Type.from('(bool[],bool[])').decode(
          new Uint8Array([0, 4, 0, 6, 0, 0, 0, 0])
        ),
        [[], []],
      ],
      [
        Type.from('(string,bool,bool,bool,bool,string)').decode(
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
