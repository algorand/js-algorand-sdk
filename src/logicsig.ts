import * as nacl from './nacl/naclWrappers';
import * as address from './encoding/address';
import * as encoding from './encoding/encoding';
import * as logic from './logic/logic';
import * as multisig from './multisig';
import * as utils from './utils/utils';
import * as txnBuilder from './transaction';
import {
  EncodedLogicSig,
  EncodedMultisig,
  EncodedTransaction,
} from './types/transactions/encoded';
import { MultisigMetadata } from './types/multisig';

interface LogicSigStorageStructure {
  logic: Uint8Array;
  args: Uint8Array[];
  sig?: Uint8Array;
  msig?: EncodedMultisig;
}

/**
 LogicSig implementation
 */
export class LogicSig implements LogicSigStorageStructure {
  tag = Buffer.from('Program');

  logic: Uint8Array;
  args: Uint8Array[];
  sig?: Uint8Array;
  msig?: EncodedMultisig;

  constructor(
    program: Uint8Array,
    bufferOrUint8ArrArgs: Array<Uint8Array | Buffer> | undefined
  ) {
    let args: Uint8Array[] | undefined;
    if (typeof bufferOrUint8ArrArgs !== 'undefined')
      args = bufferOrUint8ArrArgs.map((arg) => new Uint8Array(arg));

    if (!logic.checkProgram(program, args)) {
      throw new Error('Invalid program');
    }

    function checkType(arg: any) {
      return arg.constructor === Uint8Array || Buffer.isBuffer(arg);
    }

    if (args && (!Array.isArray(args) || !args.every(checkType))) {
      throw new TypeError('Invalid arguments');
    }

    Object.assign(this, {
      logic: program,
      args,
      sig: undefined,
      msig: undefined,
    });
  }

  // eslint-disable-next-line camelcase
  get_obj_for_encoding() {
    const obj: EncodedLogicSig = {
      l: this.logic,
    };
    if (this.args) {
      obj.arg = this.args;
    }
    if (this.sig) {
      obj.sig = this.sig;
    } else if (this.msig) {
      obj.msig = this.msig;
    }
    return obj;
  }

  // eslint-disable-next-line camelcase
  static from_obj_for_encoding(encoded: EncodedLogicSig) {
    const lsig = new LogicSig(encoded.l, encoded.arg);
    lsig.sig = encoded.sig;
    lsig.msig = encoded.msig;
    return lsig;
  }

  /**
   * Performs signature verification
   * @param publicKey - Verification key (derived from sender address or escrow address)
   */
  verify(publicKey: Uint8Array) {
    if (this.sig && this.msig) {
      return false;
    }

    try {
      logic.checkProgram(this.logic, this.args);
    } catch (e) {
      return false;
    }

    const toBeSigned = utils.concatArrays(this.tag, this.logic);

    if (!this.sig && !this.msig) {
      const hash = nacl.genericHash(toBeSigned);
      return utils.arrayEqual(hash, publicKey);
    }

    if (this.sig) {
      return nacl.verify(toBeSigned, this.sig, publicKey);
    }

    return multisig.verifyMultisig(toBeSigned, this.msig, publicKey);
  }

  /**
   * Compute hash of the logic sig program (that is the same as escrow account address) as string address
   * @returns String representation of the address
   */
  address() {
    const toBeSigned = utils.concatArrays(this.tag, this.logic);
    const hash = nacl.genericHash(toBeSigned);
    return address.encodeAddress(new Uint8Array(hash));
  }

  /**
   * Creates signature (if no msig provided) or multi signature otherwise
   * @param secretKey - Secret key to sign with
   * @param msig - Multisig account as \{version, threshold, addrs\}
   */
  sign(secretKey: Uint8Array, msig: MultisigMetadata) {
    if (msig === undefined) {
      this.sig = this.signProgram(secretKey);
    } else {
      const subsigs = msig.addrs.map((addr) => ({
        pk: address.decodeAddress(addr).publicKey,
      }));

      this.msig = {
        v: msig.version,
        thr: msig.threshold,
        subsig: subsigs,
      };

      const [sig, index] = this.singleSignMultisig(secretKey, this.msig);
      this.msig.subsig[index].s = sig;
    }
  }

  /**
   * Appends a signature to multi signature
   * @param secretKey - Secret key to sign with
   */
  appendToMultisig(secretKey: Uint8Array) {
    if (this.msig === undefined) {
      throw new Error('no multisig present');
    }
    const [sig, index] = this.singleSignMultisig(secretKey, this.msig);
    this.msig.subsig[index].s = sig;
  }

  signProgram(secretKey: Uint8Array) {
    const toBeSigned = utils.concatArrays(this.tag, this.logic);
    const sig = nacl.sign(toBeSigned, secretKey);
    return sig;
  }

  singleSignMultisig(
    secretKey: Uint8Array,
    msig: EncodedMultisig
  ): [sig: Uint8Array, index: number] {
    let index = -1;
    const myPk = nacl.keyPairFromSecretKey(secretKey).publicKey;
    for (let i = 0; i < msig.subsig.length; i++) {
      const { pk } = msig.subsig[i];
      if (utils.arrayEqual(pk, myPk)) {
        index = i;
        break;
      }
    }
    if (index === -1) {
      throw new Error('invalid secret key');
    }
    const sig = this.signProgram(secretKey);
    return [sig, index];
  }

  toByte() {
    return encoding.encode(this.get_obj_for_encoding());
  }

  static fromByte(encoded: ArrayLike<any>) {
    const decodedObj = encoding.decode(encoded) as EncodedLogicSig;
    return LogicSig.from_obj_for_encoding(decodedObj);
  }
}

/**
 * makeLogicSig creates LogicSig object from program and arguments
 *
 * @param program - Program to make LogicSig from
 * @param args - Arguments as array of Uint8Array
 * @returns LogicSig object
 */
export function makeLogicSig(program: Uint8Array, args?: Uint8Array[]) {
  return new LogicSig(program, args);
}

/**
 * signLogicSigTransactionObject takes transaction.Transaction and a LogicSig object and returns a logicsig
 * transaction which is a blob representing a transaction and logicsig object.
 * @param txn - transaction.Transaction
 * @param lsig - logicsig object
 * @returns Object containing txID and blob representing signed transaction.
 */
export function signLogicSigTransactionObject(
  txn: txnBuilder.Transaction,
  lsig: LogicSig
) {
  const lstx: {
    lsig: EncodedLogicSig;
    txn: EncodedTransaction;
    sgnr?: Buffer;
  } = {
    lsig: lsig.get_obj_for_encoding(),
    txn: txn.get_obj_for_encoding(),
  };

  const isDelegated = lsig.sig || lsig.msig;
  if (isDelegated) {
    if (!lsig.verify(txn.from.publicKey)) {
      throw new Error(
        "Logic signature verification failed. Ensure the program is valid and the transaction sender is the program's delegated address."
      );
    }
  } else {
    // add AuthAddr if signing with a different program than From indicates for non-delegated LogicSig
    const programAddr = lsig.address();
    if (programAddr !== address.encodeAddress(txn.from.publicKey)) {
      lstx.sgnr = Buffer.from(address.decodeAddress(programAddr).publicKey);
    }
  }

  return {
    txID: txn.txID().toString(),
    blob: encoding.encode(lstx),
  };
}

/**
 * signLogicSigTransaction takes a raw transaction and a LogicSig object and returns a logicsig
 * transaction which is a blob representing a transaction and logicsig object.
 * @param txn - containing constructor arguments for a transaction
 * @param lsig -  logicsig object
 * @returns Object containing txID and blob representing signed transaction.
 * @throws error on failure
 */
export function signLogicSigTransaction(
  txn: txnBuilder.TransactionLike,
  lsig: LogicSig
) {
  const algoTxn = txnBuilder.instantiateTxnIfNeeded(txn);
  return signLogicSigTransactionObject(algoTxn, lsig);
}

/**
 * logicSigFromByte accepts encoded logic sig bytes and attempts to call logicsig.fromByte on it,
 * returning the result
 */
export function logicSigFromByte(encoded: Uint8Array) {
  return LogicSig.fromByte(encoded);
}

const SIGN_PROGRAM_DATA_PREFIX = Buffer.from('ProgData');

/**
 * tealSign creates a signature compatible with ed25519verify opcode from contract address
 * @param sk - uint8array with secret key
 * @param data - buffer with data to sign
 * @param contractAddress - string representation of teal contract address (program hash)
 */
export function tealSign(
  sk: Uint8Array,
  data: Uint8Array | Buffer,
  contractAddress: string
) {
  const parts = utils.concatArrays(
    address.decodeAddress(contractAddress).publicKey,
    data
  );
  const toBeSigned = Buffer.from(
    utils.concatArrays(SIGN_PROGRAM_DATA_PREFIX, parts)
  );
  return nacl.sign(toBeSigned, sk);
}

/**
 * tealSignFromProgram creates a signature compatible with ed25519verify opcode from raw program bytes
 * @param sk - uint8array with secret key
 * @param data - buffer with data to sign
 * @param program - buffer with teal program
 */
export function tealSignFromProgram(
  sk: Uint8Array,
  data: Uint8Array | Buffer,
  program: Uint8Array
) {
  const lsig = makeLogicSig(program);
  const contractAddress = lsig.address();
  return tealSign(sk, data, contractAddress);
}

export default LogicSig;
