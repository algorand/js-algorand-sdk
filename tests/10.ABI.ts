/* eslint-env mocha */
import assert from 'assert';
import {
  ABIMethod,
  AtomicTransactionComposer,
  AtomicTransactionComposerStatus,
  MultisigMetadata,
  generateAccount,
  makeBasicAccountTransactionSigner,
  makeMultiSigAccountTransactionSigner,
  makePaymentTxnWithSuggestedParamsFromObject,
  base64ToBytes,
} from '../src';
import {
  ABIAddressType,
  ABIArrayDynamicType,
  ABIArrayStaticType,
  ABIBoolType,
  ABIByteType,
  ABIStringType,
  ABITupleType,
  ABIType,
  ABIUfixedType,
  ABIUintType,
  ABIValue,
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
      'bool[01]',
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
  // Note we are not using the newTestCase array below because we are not testing round-trip
  // encoding. We added support for encoding Address as `address`, but decode should still return
  // a string for backwards compatibility
  it('ABIAddressType should encode Address properly', () => {
    const abiType = new ABIAddressType();
    const addr = decodeAddress(
      'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
    );

    assert.deepStrictEqual(abiType.encode(addr), addr.publicKey);
    assert.deepStrictEqual(
      abiType.decode(abiType.encode(addr)),
      addr.toString()
    );
  });

  type TestCase<T> = {
    abiType: ABIType;
    input: T;
    expectedEncoding: Uint8Array;
  };

  function newTestCase<T>(a: ABIType, b: T, c: Uint8Array): TestCase<T> {
    return {
      abiType: a,
      input: b,
      expectedEncoding: c,
    };
  }

  [
    newTestCase(new ABIUintType(8), BigInt(0), new Uint8Array([0])),
    newTestCase(new ABIUintType(16), BigInt(3), new Uint8Array([0, 3])),
    newTestCase(
      new ABIUintType(64),
      256,
      new Uint8Array([0, 0, 0, 0, 0, 0, 1, 0])
    ),
    newTestCase(new ABIUfixedType(8, 30), BigInt(255), new Uint8Array([255])),
    newTestCase(new ABIUfixedType(32, 10), 33, new Uint8Array([0, 0, 0, 33])),
    newTestCase(
      new ABIAddressType(),
      'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI',
      decodeAddress(
        'MO2H6ZU47Q36GJ6GVHUKGEBEQINN7ZWVACMWZQGIYUOE3RBSRVYHV4ACJI'
      ).publicKey
    ),
    newTestCase(
      new ABIStringType(),
      'What’s new',
      new Uint8Array([
        0, 12, 87, 104, 97, 116, 226, 128, 153, 115, 32, 110, 101, 119,
      ])
    ),
    newTestCase(
      new ABIStringType(),
      '😅🔨',
      new Uint8Array([0, 8, 240, 159, 152, 133, 240, 159, 148, 168])
    ),
    newTestCase(new ABIByteType(), 10, new Uint8Array([10])),
    newTestCase(new ABIByteType(), 255, new Uint8Array([255])),
    newTestCase(new ABIBoolType(), true, new Uint8Array([128])),
    newTestCase(new ABIBoolType(), false, new Uint8Array([0])),
    newTestCase(
      new ABIStringType(),
      'asdf',
      new Uint8Array([0, 4, 97, 115, 100, 102])
    ),
    newTestCase(
      new ABIArrayStaticType(new ABIBoolType(), 3),
      [true, true, false],
      new Uint8Array([192])
    ),
    newTestCase(
      new ABIArrayStaticType(new ABIBoolType(), 8),
      [false, true, false, false, false, false, false, false],
      new Uint8Array([64])
    ),
    newTestCase(
      new ABIArrayStaticType(new ABIBoolType(), 8),
      [true, true, true, true, true, true, true, true],
      new Uint8Array([255])
    ),
    newTestCase(
      new ABIArrayStaticType(new ABIBoolType(), 9),
      [true, false, false, true, false, false, true, false, true],
      new Uint8Array([146, 128])
    ),
    newTestCase(
      new ABIArrayStaticType(new ABIUintType(64), 3),
      [BigInt(1), BigInt(2), 3], // Deliberately mix BigInt and int
      new Uint8Array([
        0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 3,
      ])
    ),
    newTestCase(
      new ABIArrayDynamicType(new ABIBoolType()),
      [],
      new Uint8Array([0, 0])
    ),
    newTestCase(
      new ABIArrayDynamicType(new ABIBoolType()),
      [true, true, false],
      new Uint8Array([0, 3, 192])
    ),
    newTestCase(
      new ABIArrayDynamicType(new ABIBoolType()),
      [false, true, false, false, false, false, false, false],
      new Uint8Array([0, 8, 64])
    ),
    newTestCase(
      new ABIArrayDynamicType(new ABIBoolType()),
      [true, false, false, true, false, false, true, false, true],
      new Uint8Array([0, 9, 146, 128])
    ),
    newTestCase(ABIType.from('()'), [], new Uint8Array([])),
    // 2^6 + 2^5 = 64 + 32 = 96
    newTestCase(
      ABIType.from('(bool,bool,bool)'),
      [false, true, true],
      new Uint8Array([96])
    ),
    newTestCase(
      ABIType.from('(bool[3])'),
      [[false, true, true]],
      new Uint8Array([96])
    ),
    newTestCase(
      ABIType.from('(bool[])'),
      [[false, true, true]],
      new Uint8Array([0, 2, 0, 3, 96])
    ),
    newTestCase(
      ABIType.from('(bool[2],bool[])'),
      [
        [true, true],
        [true, true],
      ],
      new Uint8Array([192, 0, 3, 0, 2, 192])
    ),
    newTestCase(
      ABIType.from('(bool[],bool[])'),
      [[], []],
      new Uint8Array([0, 4, 0, 6, 0, 0, 0, 0])
    ),
    newTestCase(
      ABIType.from('(string,bool,bool,bool,bool,string)'),
      ['AB', true, false, true, false, 'DE'],
      new Uint8Array([0, 5, 160, 0, 9, 0, 2, 65, 66, 0, 2, 68, 69])
    ),
    newTestCase(
      new ABITupleType([new ABIUintType(8), new ABIUintType(16)]),
      [1, 2],
      new Uint8Array([1, 0, 2])
    ),
  ].forEach((testCase) => {
    it(`should round-trip ${testCase.abiType}, ${testCase.input}`, () => {
      const encoded = testCase.abiType.encode(testCase.input);
      assert.deepStrictEqual(encoded, testCase.expectedEncoding);
      const decoded = testCase.abiType.decode(encoded);

      // Converts any numeric type to BigInt for strict equality comparisons.
      // The conversion is required because there's no type information
      // available to convert a decoded BigInt back to its original number
      // form.  Converting from number to BigInt is always _safe_.
      function numericAsBigInt(d: ABIValue): ABIValue {
        if (typeof d === 'number') {
          return BigInt(d);
        }
        if (d instanceof Array) {
          return (d as ABIValue[]).map(numericAsBigInt);
        }
        return d;
      }

      // Returns true when the provided ABIType decodes to BigInt.
      function decodeReturnsBigInt(t: ABIType): boolean {
        if (t instanceof ABIUintType || t instanceof ABIUfixedType) {
          return true;
        }
        if (t instanceof ABITupleType) {
          return t.childTypes.map(decodeReturnsBigInt).includes(true);
        }
        if (t instanceof ABIArrayStaticType) {
          return decodeReturnsBigInt(t.childType);
        }
        if (t instanceof ABIArrayDynamicType) {
          return decodeReturnsBigInt(t.childType);
        }
        return false;
      }

      if (decodeReturnsBigInt(testCase.abiType)) {
        // If casting to BigInt changes the test case input, then it implies
        // the _unchanged_ test case input != `decoded`.
        //
        // The sanity check confirms that transforming the expected value is
        // necessary.
        if (testCase.input !== numericAsBigInt(testCase.input)) {
          assert.notDeepStrictEqual(decoded, testCase.input);
        }

        assert.deepStrictEqual(decoded, numericAsBigInt(testCase.input));
      } else {
        assert.deepStrictEqual(decoded, testCase.input);
      }
    });
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

  it('should properly accept foreign array objects in the ATC addMethodCall', () => {
    const composer = new AtomicTransactionComposer();
    const method = ABIMethod.fromSignature('add(application)uint8');
    const account = generateAccount();
    const sender = 'DN7MBMCL5JQ3PFUQS7TMX5AH4EEKOBJVDUF4TCV6WERATKFLQF4MQUPZTA';
    const genesisHash = new Uint8Array(32);
    genesisHash[0] = 1;
    genesisHash[1] = 2;
    const sp = {
      minFee: 1000,
      fee: 1000,
      firstValid: 1,
      lastValid: 1001,
      genesisID: 'gi',
      genesisHash,
    };
    const foreignAcct =
      'E4VCHISDQPLIZWMALIGNPK2B2TERPDMR64MZJXE3UL75MUDXZMADX5OWXM';

    // Create method call using ATC.
    // The foreign apps array argument should be packed before the method argument.
    composer.addMethodCall({
      appID: 7,
      method,
      sender,
      suggestedParams: sp,
      methodArgs: [2],
      appAccounts: [foreignAcct],
      appForeignApps: [1],
      appForeignAssets: [124],
      signer: makeBasicAccountTransactionSigner(account),
    });

    assert.deepStrictEqual(
      composer.getStatus(),
      AtomicTransactionComposerStatus.BUILDING
    );
    assert.deepStrictEqual(composer.count(), 1);

    // The built group should have one txn.
    const txns = composer.buildGroup();
    // eslint-disable-next-line prefer-destructuring
    const txn = txns[0].txn;

    // Assert that foreign objects were passed in and ordering was correct.
    assert.deepStrictEqual(txn.applicationCall?.foreignApps?.length, 2);
    assert.deepStrictEqual(txn.applicationCall?.foreignApps[0], 1n);
    assert.deepStrictEqual(txn.applicationCall?.foreignApps[1], 2n);

    assert.deepStrictEqual(txn.applicationCall?.foreignAssets?.length, 1);
    assert.deepStrictEqual(txn.applicationCall?.foreignAssets[0], 124n);

    assert.deepStrictEqual(txn.applicationCall?.accounts?.length, 1);
    assert.deepStrictEqual(
      txn.applicationCall?.accounts[0],
      decodeAddress(foreignAcct)
    );
  });

  it('should accept at least one signature in the multisig', () => {
    const account1 = generateAccount();
    const account2 = generateAccount();

    // Create a multisig signer
    const msig: MultisigMetadata = {
      version: 1,
      threshold: 1,
      addrs: [account1.addr, account2.addr],
    };
    const sks: Uint8Array[] = [account1.sk];
    const signer = makeMultiSigAccountTransactionSigner(msig, sks);

    // Create a transaction
    const suggestedParams = {
      genesisHash: base64ToBytes(
        'SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI='
      ),
      genesisID: '',
      firstValid: 0,
      lastValid: 1000,
      fee: 1000,
      flatFee: true,
      minFee: 1000,
    };
    const actualTxn = makePaymentTxnWithSuggestedParamsFromObject({
      sender: account1.addr,
      receiver: account2.addr,
      amount: 1000,
      suggestedParams,
    });

    // A multisig with 1 signature should be accepted
    signer([actualTxn], [0]).then((signedTxns) => {
      assert.deepStrictEqual(signedTxns.length, 1);
    });
  });
});
