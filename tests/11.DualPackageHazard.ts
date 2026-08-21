/* eslint-env mocha */
import assert from 'assert';
import algosdk from '../src/index.js';
import { ABIContract } from '../src/abi/index.js';

describe('Dual Package Hazard Solution', () => {
  describe('Address Symbol.hasInstance', () => {
    it('should work with regular instanceof', () => {
      const address = new algosdk.Address(new Uint8Array(32));
      assert.strictEqual(address instanceof algosdk.Address, true);
    });

    it('should work with custom Symbol.hasInstance', () => {
      const address = new algosdk.Address(new Uint8Array(32));
      assert.strictEqual(algosdk.Address[Symbol.hasInstance](address), true);
    });

    it('should work with cross-module simulation', () => {
      // Simulate an Address object from a different module instance
      const mockAddress = {
        _isAlgosdkAddress: true,
        publicKey: new Uint8Array(32),
      };
      assert.strictEqual(
        algosdk.Address[Symbol.hasInstance](mockAddress),
        true
      );
    });

    it('should reject objects without marker', () => {
      const fakeAddress = { publicKey: new Uint8Array(32) };
      assert.strictEqual(
        algosdk.Address[Symbol.hasInstance](fakeAddress),
        false
      );
    });

    it('should handle null and undefined', () => {
      assert.strictEqual(algosdk.Address[Symbol.hasInstance](null), false);
      assert.strictEqual(algosdk.Address[Symbol.hasInstance](undefined), false);
    });
  });

  describe('Transaction Symbol.hasInstance', () => {
    let transaction: algosdk.Transaction;

    beforeEach(() => {
      const sender = algosdk.encodeAddress(new Uint8Array(32));
      const receiver = algosdk.encodeAddress(new Uint8Array(32));
      transaction = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender,
        receiver,
        amount: 1000,
        suggestedParams: {
          fee: 1000,
          firstValid: 1,
          lastValid: 100,
          genesisHash: new Uint8Array(32),
          genesisID: 'test',
          minFee: 1000,
        },
      });
    });

    it('should work with regular instanceof', () => {
      assert.strictEqual(transaction instanceof algosdk.Transaction, true);
    });

    it('should work with custom Symbol.hasInstance', () => {
      assert.strictEqual(
        algosdk.Transaction[Symbol.hasInstance](transaction),
        true
      );
    });

    it('should work with cross-module simulation', () => {
      const mockTransaction = {
        _isAlgosdkTransaction: true,
        type: 'pay' as any, // Mock object doesn't need strict typing
      };
      assert.strictEqual(
        algosdk.Transaction[Symbol.hasInstance](mockTransaction),
        true
      );
    });

    it('should reject objects without marker', () => {
      const fakeTransaction = { type: 'pay' as any };
      assert.strictEqual(
        algosdk.Transaction[Symbol.hasInstance](fakeTransaction),
        false
      );
    });
  });

  describe('SignedTransaction Symbol.hasInstance', () => {
    let signedTransaction: algosdk.SignedTransaction;

    beforeEach(() => {
      const sender = algosdk.encodeAddress(new Uint8Array(32));
      const receiver = algosdk.encodeAddress(new Uint8Array(32));
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender,
        receiver,
        amount: 1000,
        suggestedParams: {
          fee: 1000,
          firstValid: 1,
          lastValid: 100,
          genesisHash: new Uint8Array(32),
          genesisID: 'test',
          minFee: 1000,
        },
      });
      signedTransaction = new algosdk.SignedTransaction({ txn });
    });

    it('should work with regular instanceof', () => {
      assert.strictEqual(
        signedTransaction instanceof algosdk.SignedTransaction,
        true
      );
    });

    it('should work with custom Symbol.hasInstance', () => {
      assert.strictEqual(
        algosdk.SignedTransaction[Symbol.hasInstance](signedTransaction),
        true
      );
    });

    it('should work with cross-module simulation', () => {
      const mockSignedTransaction = {
        _isAlgosdkSignedTransaction: true,
        txn: {},
      };
      assert.strictEqual(
        algosdk.SignedTransaction[Symbol.hasInstance](mockSignedTransaction),
        true
      );
    });
  });

  describe('LogicSig Symbol.hasInstance', () => {
    let logicSig: algosdk.LogicSig;

    beforeEach(() => {
      const program = new Uint8Array([1, 32, 1, 1, 34]); // Simple program
      logicSig = new algosdk.LogicSig(program);
    });

    it('should work with regular instanceof', () => {
      assert.strictEqual(logicSig instanceof algosdk.LogicSig, true);
    });

    it('should work with custom Symbol.hasInstance', () => {
      assert.strictEqual(algosdk.LogicSig[Symbol.hasInstance](logicSig), true);
    });

    it('should work with cross-module simulation', () => {
      const mockLogicSig = {
        _isAlgosdkLogicSig: true,
        logic: new Uint8Array([1, 32, 1, 1, 34]),
        args: [],
      };
      assert.strictEqual(
        algosdk.LogicSig[Symbol.hasInstance](mockLogicSig),
        true
      );
    });
  });

  describe('LogicSigAccount Symbol.hasInstance', () => {
    let logicSigAccount: algosdk.LogicSigAccount;

    beforeEach(() => {
      const program = new Uint8Array([1, 32, 1, 1, 34]); // Simple program
      logicSigAccount = new algosdk.LogicSigAccount(program);
    });

    it('should work with regular instanceof', () => {
      assert.strictEqual(
        logicSigAccount instanceof algosdk.LogicSigAccount,
        true
      );
    });

    it('should work with custom Symbol.hasInstance', () => {
      assert.strictEqual(
        algosdk.LogicSigAccount[Symbol.hasInstance](logicSigAccount),
        true
      );
    });

    it('should work with cross-module simulation', () => {
      const mockLogicSigAccount = {
        _isAlgosdkLogicSigAccount: true,
        lsig: {},
      };
      assert.strictEqual(
        algosdk.LogicSigAccount[Symbol.hasInstance](mockLogicSigAccount),
        true
      );
    });
  });

  describe('AtomicTransactionComposer Symbol.hasInstance', () => {
    let composer: algosdk.AtomicTransactionComposer;

    beforeEach(() => {
      composer = new algosdk.AtomicTransactionComposer();
    });

    it('should work with regular instanceof', () => {
      assert.strictEqual(
        composer instanceof algosdk.AtomicTransactionComposer,
        true
      );
    });

    it('should work with custom Symbol.hasInstance', () => {
      assert.strictEqual(
        algosdk.AtomicTransactionComposer[Symbol.hasInstance](composer),
        true
      );
    });

    it('should work with cross-module simulation', () => {
      const mockComposer = {
        _isAlgosdkAtomicTransactionComposer: true,
        status: 'BUILDING',
      };
      assert.strictEqual(
        algosdk.AtomicTransactionComposer[Symbol.hasInstance](mockComposer),
        true
      );
    });
  });

  describe('ABIContract Symbol.hasInstance', () => {
    let contract: ABIContract;

    beforeEach(() => {
      contract = new ABIContract({
        name: 'TestContract',
        methods: [{ name: 'test', args: [], returns: { type: 'void' } }],
      });
    });

    it('should work with regular instanceof', () => {
      assert.strictEqual(contract instanceof ABIContract, true);
    });

    it('should work with custom Symbol.hasInstance', () => {
      assert.strictEqual(ABIContract[Symbol.hasInstance](contract), true);
    });

    it('should work with cross-module simulation', () => {
      const mockContract = {
        _isAlgosdkABIContract: true,
        name: 'MockContract',
        methods: [],
      };
      assert.strictEqual(ABIContract[Symbol.hasInstance](mockContract), true);
    });
  });

  describe('ABI Type Symbol.hasInstance', () => {
    it('should work for ABIUintType', () => {
      const uintType = new algosdk.ABIUintType(64);
      assert.strictEqual(uintType instanceof algosdk.ABIUintType, true);
      assert.strictEqual(
        algosdk.ABIUintType[Symbol.hasInstance](uintType),
        true
      );

      const mockUintType = { _isAlgosdkABIUintType: true, bitSize: 64 };
      assert.strictEqual(
        algosdk.ABIUintType[Symbol.hasInstance](mockUintType),
        true
      );
    });

    it('should work for ABIAddressType', () => {
      const addressType = new algosdk.ABIAddressType();
      assert.strictEqual(addressType instanceof algosdk.ABIAddressType, true);
      assert.strictEqual(
        algosdk.ABIAddressType[Symbol.hasInstance](addressType),
        true
      );

      const mockAddressType = { _isAlgosdkABIAddressType: true };
      assert.strictEqual(
        algosdk.ABIAddressType[Symbol.hasInstance](mockAddressType),
        true
      );
    });

    it('should work for ABIBoolType', () => {
      const boolType = new algosdk.ABIBoolType();
      assert.strictEqual(boolType instanceof algosdk.ABIBoolType, true);
      assert.strictEqual(
        algosdk.ABIBoolType[Symbol.hasInstance](boolType),
        true
      );

      const mockBoolType = { _isAlgosdkABIBoolType: true };
      assert.strictEqual(
        algosdk.ABIBoolType[Symbol.hasInstance](mockBoolType),
        true
      );
    });

    it('should work for ABIStringType', () => {
      const stringType = new algosdk.ABIStringType();
      assert.strictEqual(stringType instanceof algosdk.ABIStringType, true);
      assert.strictEqual(
        algosdk.ABIStringType[Symbol.hasInstance](stringType),
        true
      );

      const mockStringType = { _isAlgosdkABIStringType: true };
      assert.strictEqual(
        algosdk.ABIStringType[Symbol.hasInstance](mockStringType),
        true
      );
    });

    it('should work for ABIArrayStaticType', () => {
      const elementType = new algosdk.ABIUintType(64);
      const arrayType = new algosdk.ABIArrayStaticType(elementType, 5);
      assert.strictEqual(arrayType instanceof algosdk.ABIArrayStaticType, true);
      assert.strictEqual(
        algosdk.ABIArrayStaticType[Symbol.hasInstance](arrayType),
        true
      );

      const mockArrayType = {
        _isAlgosdkABIArrayStaticType: true,
        childType: {},
        staticLength: 5,
      };
      assert.strictEqual(
        algosdk.ABIArrayStaticType[Symbol.hasInstance](mockArrayType),
        true
      );
    });

    it('should work for ABIArrayDynamicType', () => {
      const elementType = new algosdk.ABIUintType(64);
      const arrayType = new algosdk.ABIArrayDynamicType(elementType);
      assert.strictEqual(
        arrayType instanceof algosdk.ABIArrayDynamicType,
        true
      );
      assert.strictEqual(
        algosdk.ABIArrayDynamicType[Symbol.hasInstance](arrayType),
        true
      );

      const mockArrayType = {
        _isAlgosdkABIArrayDynamicType: true,
        childType: {},
      };
      assert.strictEqual(
        algosdk.ABIArrayDynamicType[Symbol.hasInstance](mockArrayType),
        true
      );
    });

    it('should work for ABITupleType', () => {
      const childTypes = [
        new algosdk.ABIUintType(64),
        new algosdk.ABIBoolType(),
      ];
      const tupleType = new algosdk.ABITupleType(childTypes);
      assert.strictEqual(tupleType instanceof algosdk.ABITupleType, true);
      assert.strictEqual(
        algosdk.ABITupleType[Symbol.hasInstance](tupleType),
        true
      );

      const mockTupleType = { _isAlgosdkABITupleType: true, childTypes: [] };
      assert.strictEqual(
        algosdk.ABITupleType[Symbol.hasInstance](mockTupleType),
        true
      );
    });
  });

  describe('Edge cases', () => {
    it('should handle primitive values', () => {
      assert.strictEqual(algosdk.Address[Symbol.hasInstance]('string'), false);
      assert.strictEqual(algosdk.Address[Symbol.hasInstance](123), false);
      assert.strictEqual(algosdk.Address[Symbol.hasInstance](true), false);
    });

    it('should handle empty objects', () => {
      assert.strictEqual(algosdk.Address[Symbol.hasInstance]({}), false);
      assert.strictEqual(algosdk.Transaction[Symbol.hasInstance]({}), false);
    });

    it('should handle objects with wrong marker values', () => {
      const wrongMarker = { _isAlgosdkAddress: 'true' }; // string instead of boolean
      assert.strictEqual(
        algosdk.Address[Symbol.hasInstance](wrongMarker),
        false
      );
    });
  });
});
