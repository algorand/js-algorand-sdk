import * as nacl from './nacl/naclWrappers.js';
import { Address, isValidAddress } from './encoding/address.js';
import * as encoding from './encoding/encoding.js';
import {
  NamedMapSchema,
  ArraySchema,
  ByteArraySchema,
  FixedLengthByteArraySchema,
  OptionalSchema,
  allOmitEmpty,
} from './encoding/schema/index.js';
import {
  MultisigMetadata,
  verifyMultisig,
  addressFromMultisigPreImg,
  pksFromAddresses,
} from './multisig.js';
import * as utils from './utils/utils.js';
import {
  EncodedMultisig,
  encodedMultiSigToEncodingData,
  encodedMultiSigFromEncodingData,
  ENCODED_MULTISIG_SCHEMA,
} from './types/transactions/encoded.js';

// base64regex is the regex to test for base64 strings
const base64regex =
  /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

/** sanityCheckProgram performs heuristic program validation:
 * check if passed in bytes are Algorand address or is B64 encoded, rather than Teal bytes
 *
 * @param program - Program bytes to check
 */
export function sanityCheckProgram(program: Uint8Array) {
  if (!program || program.length === 0) throw new Error('empty program');

  const lineBreakOrd = '\n'.charCodeAt(0);
  const blankSpaceOrd = ' '.charCodeAt(0);
  const tildeOrd = '~'.charCodeAt(0);

  const isPrintable = (x: number) => blankSpaceOrd <= x && x <= tildeOrd;
  const isAsciiPrintable = program.every(
    (x: number) => x === lineBreakOrd || isPrintable(x)
  );

  if (isAsciiPrintable) {
    const programStr = new TextDecoder().decode(program);

    if (isValidAddress(programStr))
      throw new Error('requesting program bytes, get Algorand address');

    if (base64regex.test(programStr))
      throw new Error('program should not be b64 encoded');

    throw new Error(
      'program bytes are all ASCII printable characters, not looking like Teal byte code'
    );
  }
}

const programTag = new TextEncoder().encode('Program');
const multisigProgramTag = new TextEncoder().encode('MsigProgram');

/**
 LogicSig implementation

 LogicSig cannot sign transactions in all cases.  Instead, use LogicSigAccount as a safe, general purpose signing mechanism.  Since LogicSig does not track the provided signature's public key, LogicSig cannot sign transactions when delegated to a non-multisig account _and_ the sender is not the delegating account.
 */
export class LogicSig implements encoding.Encodable {
  static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'l',
        valueSchema: new ByteArraySchema(),
      },
      {
        key: 'arg',
        valueSchema: new ArraySchema(new ByteArraySchema()),
      },
      {
        key: 'sig',
        valueSchema: new OptionalSchema(new FixedLengthByteArraySchema(64)),
      },
      {
        key: 'msig',
        valueSchema: new OptionalSchema(ENCODED_MULTISIG_SCHEMA),
      },
      {
        key: 'lmsig',
        valueSchema: new OptionalSchema(ENCODED_MULTISIG_SCHEMA),
      },
    ])
  );

  logic: Uint8Array;
  args: Uint8Array[];
  sig?: Uint8Array;
  msig?: EncodedMultisig;
  lmsig?: EncodedMultisig;

  constructor(program: Uint8Array, programArgs?: Array<Uint8Array> | null) {
    if (
      programArgs &&
      (!Array.isArray(programArgs) ||
        !programArgs.every((arg) => arg.constructor === Uint8Array))
    ) {
      throw new TypeError('Invalid arguments');
    }

    let args: Uint8Array[] = [];
    if (programArgs != null)
      args = programArgs.map((arg) => new Uint8Array(arg));

    sanityCheckProgram(program);

    this.logic = program;
    this.args = args;
    this.sig = undefined;
    this.msig = undefined;
    this.lmsig = undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): encoding.Schema {
    return LogicSig.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['l', this.logic],
      ['arg', this.args],
      ['sig', this.sig],
    ]);
    if (this.msig) {
      data.set('msig', encodedMultiSigToEncodingData(this.msig));
    }
    if (this.lmsig) {
      data.set('lmsig', encodedMultiSigToEncodingData(this.lmsig));
    }
    return data;
  }

  static fromEncodingData(data: unknown): LogicSig {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig: ${data}`);
    }
    const lsig = new LogicSig(data.get('l'), data.get('arg'));
    lsig.sig = data.get('sig');
    if (data.get('msig')) {
      lsig.msig = encodedMultiSigFromEncodingData(data.get('msig'));
    }
    if (data.get('lmsig')) {
      lsig.lmsig = encodedMultiSigFromEncodingData(data.get('lmsig'));
    }
    return lsig;
  }

  /**
   * Performs signature verification
   * @param publicKey - Verification key (derived from sender address or escrow address)
   */
  verify(publicKey: Uint8Array) {
    const sigCount = [this.sig, this.msig, this.lmsig].filter(Boolean).length;
    if (sigCount > 1) {
      return false;
    }

    try {
      sanityCheckProgram(this.logic);
    } catch (e) {
      return false;
    }

    const toBeSigned = utils.concatArrays(programTag, this.logic);

    if (!this.sig && !this.msig && !this.lmsig) {
      const hash = nacl.genericHash(toBeSigned);
      return utils.arrayEqual(hash, publicKey);
    }

    if (this.sig) {
      return nacl.verify(toBeSigned, this.sig, publicKey);
    }

    if (this.lmsig) {
      const multisigAddr = addressFromMultisigPreImg({
        version: this.lmsig.v,
        threshold: this.lmsig.thr,
        pks: this.lmsig.subsig.map((subsig) => subsig.pk),
      });
      const lmsigProgram = utils.concatArrays(
        multisigProgramTag,
        multisigAddr.publicKey,
        this.logic
      );
      return verifyMultisig(lmsigProgram, this.lmsig!, publicKey);
    }

    if (this.msig) {
      return verifyMultisig(toBeSigned, this.msig!, publicKey);
    }

    return false;
  }

  /**
   * Compute hash of the logic sig program (that is the same as escrow account address) as string address
   * @returns String representation of the address
   */
  address(): Address {
    const toBeSigned = utils.concatArrays(programTag, this.logic);
    const hash = nacl.genericHash(toBeSigned);
    return new Address(Uint8Array.from(hash));
  }

  /**
   * Creates signature (if no msig provided) or multi signature otherwise
   * @param secretKey - Secret key to sign with
   * @param msig - Multisig account as \{version, threshold, addrs\}
   */
  sign(secretKey: Uint8Array, msig?: MultisigMetadata) {
    if (msig == null) {
      this.sig = this.signProgram(secretKey);
    } else {
      const subsigs = pksFromAddresses(msig.addrs).map((pk) => ({ pk }));

      this.lmsig = {
        v: msig.version,
        thr: msig.threshold,
        subsig: subsigs,
      };

      const [sig, index] = this.singleSignMultisig(secretKey, this.lmsig);
      this.lmsig.subsig[index].s = sig;
    }
  }

  /**
   * Appends a signature to multi signature
   * @param secretKey - Secret key to sign with
   */
  appendToMultisig(secretKey: Uint8Array) {
    if (this.lmsig === undefined) {
      throw new Error('no multisig present');
    }
    const [sig, index] = this.singleSignMultisig(secretKey, this.lmsig);
    this.lmsig.subsig[index].s = sig;
  }

  signProgram(secretKey: Uint8Array) {
    const toBeSigned = utils.concatArrays(programTag, this.logic);
    const sig = nacl.sign(toBeSigned, secretKey);
    return sig;
  }

  signProgramMultisig(secretKey: Uint8Array, msig: EncodedMultisig) {
    const multisigAddr = addressFromMultisigPreImg({
      version: msig.v,
      threshold: msig.thr,
      pks: msig.subsig.map((subsig) => subsig.pk),
    });
    const toBeSigned = utils.concatArrays(
      multisigProgramTag,
      multisigAddr.publicKey,
      this.logic
    );
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
    const sig = this.signProgramMultisig(secretKey, msig);
    return [sig, index];
  }

  toByte(): Uint8Array {
    return encoding.encodeMsgpack(this);
  }

  static fromByte(encoded: ArrayLike<any>): LogicSig {
    return encoding.decodeMsgpack(encoded, LogicSig);
  }
}

/**
 * Represents an account that can sign with a LogicSig program.
 */
export class LogicSigAccount implements encoding.Encodable {
  static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      {
        key: 'lsig',
        valueSchema: LogicSig.encodingSchema,
      },
      {
        key: 'sigkey',
        valueSchema: new OptionalSchema(new FixedLengthByteArraySchema(32)),
      },
    ])
  );

  lsig: LogicSig;
  sigkey?: Uint8Array;

  /**
   * Create a new LogicSigAccount. By default this will create an escrow
   * LogicSig account. Call `sign` or `signMultisig` on the newly created
   * LogicSigAccount to make it a delegated account.
   *
   * @param program - The compiled TEAL program which contains the logic for
   *   this LogicSig.
   * @param args - An optional array of arguments for the program.
   */
  constructor(program: Uint8Array, args?: Array<Uint8Array> | null) {
    this.lsig = new LogicSig(program, args);
    this.sigkey = undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): encoding.Schema {
    return LogicSigAccount.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    return new Map<string, unknown>([
      ['lsig', this.lsig.toEncodingData()],
      ['sigkey', this.sigkey],
    ]);
  }

  static fromEncodingData(data: unknown): LogicSigAccount {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    const value = data as Map<string, unknown>;
    const lsig = LogicSig.fromEncodingData(value.get('lsig'));
    const lsigAccount = new LogicSigAccount(lsig.logic, lsig.args);
    lsigAccount.lsig = lsig; // Restore other properties of the lsig
    lsigAccount.sigkey = value.get('sigkey') as Uint8Array;
    return lsigAccount;
  }

  /**
   * Encode this object into msgpack.
   */
  toByte(): Uint8Array {
    return encoding.encodeMsgpack(this);
  }

  /**
   * Decode a msgpack object into a LogicSigAccount.
   * @param encoded - The encoded LogicSigAccount.
   */
  static fromByte(encoded: ArrayLike<any>): LogicSigAccount {
    return encoding.decodeMsgpack(encoded, LogicSigAccount);
  }

  /**
   * Check if this LogicSigAccount has been delegated to another account with a
   * signature.
   *
   * Note this function only checks for the presence of a delegation signature.
   * To verify the delegation signature, use `verify`.
   */
  isDelegated() {
    return !!(this.lsig.sig || this.lsig.msig || this.lsig.lmsig);
  }

  /**
   * Verifies this LogicSig's program and signatures.
   * @returns true if and only if the LogicSig program and signatures are valid.
   */
  verify() {
    const addr = this.address();
    return this.lsig.verify(addr.publicKey);
  }

  /**
   * Get the address of this LogicSigAccount.
   *
   * If the LogicSig is delegated to another account, this will return the
   * address of that account.
   *
   * If the LogicSig is not delegated to another account, this will return an
   *  escrow address that is the hash of the LogicSig's program code.
   */
  address(): Address {
    const sigCount = [this.lsig.sig, this.lsig.msig, this.lsig.lmsig].filter(
      Boolean
    ).length;
    if (sigCount > 1) {
      throw new Error(
        'LogicSig has too many signatures. At most one of sig, msig, or lmsig may be present'
      );
    }

    if (this.lsig.sig) {
      if (!this.sigkey) {
        throw new Error('Signing key for delegated account is missing');
      }
      return new Address(this.sigkey);
    }

    const msig = this.lsig.lmsig || this.lsig.msig;
    if (msig) {
      const msigMetadata = {
        version: msig.v,
        threshold: msig.thr,
        pks: msig.subsig.map((subsig) => subsig.pk),
      };
      return addressFromMultisigPreImg(msigMetadata);
    }

    return this.lsig.address();
  }

  /**
   * Turns this LogicSigAccount into a delegated LogicSig. This type of LogicSig
   * has the authority to sign transactions on behalf of another account, called
   * the delegating account. Use this function if the delegating account is a
   * multisig account.
   *
   * @param msig - The multisig delegating account
   * @param secretKey - The secret key of one of the members of the delegating
   *   multisig account. Use `appendToMultisig` to add additional signatures
   *   from other members.
   */
  signMultisig(msig: MultisigMetadata, secretKey: Uint8Array) {
    this.lsig.sign(secretKey, msig);
  }

  /**
   * Adds an additional signature from a member of the delegating multisig
   * account.
   *
   * @param secretKey - The secret key of one of the members of the delegating
   *   multisig account.
   */
  appendToMultisig(secretKey: Uint8Array) {
    this.lsig.appendToMultisig(secretKey);
  }

  /**
   * Turns this LogicSigAccount into a delegated LogicSig. This type of LogicSig
   * has the authority to sign transactions on behalf of another account, called
   * the delegating account. If the delegating account is a multisig account,
   * use `signMultisig` instead.
   *
   * @param secretKey - The secret key of the delegating account.
   */
  sign(secretKey: Uint8Array) {
    this.lsig.sign(secretKey);
    this.sigkey = nacl.keyPairFromSecretKey(secretKey).publicKey;
  }
}

/**
 * logicSigFromByte accepts encoded logic sig bytes and attempts to call logicsig.fromByte on it,
 * returning the result
 */
export function logicSigFromByte(encoded: Uint8Array): LogicSig {
  return encoding.decodeMsgpack(encoded, LogicSig);
}

const SIGN_PROGRAM_DATA_PREFIX = new TextEncoder().encode('ProgData');

/**
 * tealSign creates a signature compatible with ed25519verify opcode from program hash
 * @param sk - Uint8Array with secret key
 * @param data - Uint8Array with data to sign
 * @param programHash - string representation of teal program hash (= contract address for LogicSigs)
 */
export function tealSign(
  sk: Uint8Array,
  data: Uint8Array,
  programHash: string | Address
) {
  const programAddr =
    typeof programHash === 'string'
      ? Address.fromString(programHash)
      : programHash;
  const parts = utils.concatArrays(programAddr.publicKey, data);
  const toBeSigned = utils.concatArrays(SIGN_PROGRAM_DATA_PREFIX, parts);
  return nacl.sign(toBeSigned, sk);
}

/**
 * verifyTealSign verifies a signature as would the ed25519verify opcode
 * @param data - Uint8Array with original signed data
 * @param programHash - string representation of teal program hash (= contract address for LogicSigs)
 * @param sig - uint8array with the signature to verify (produced by tealSign/tealSignFromProgram)
 * @param pk - uint8array with public key to verify against
 */
export function verifyTealSign(
  data: Uint8Array,
  programHash: string | Address,
  sig: Uint8Array,
  pk: Uint8Array
) {
  const programAddr =
    typeof programHash === 'string'
      ? Address.fromString(programHash)
      : programHash;
  const parts = utils.concatArrays(programAddr.publicKey, data);
  const toBeSigned = utils.concatArrays(SIGN_PROGRAM_DATA_PREFIX, parts);
  return nacl.verify(toBeSigned, sig, pk);
}

/**
 * tealSignFromProgram creates a signature compatible with ed25519verify opcode from raw program bytes
 * @param sk - uint8array with secret key
 * @param data - Uint8Array with data to sign
 * @param program - Uint8Array with teal program
 */
export function tealSignFromProgram(
  sk: Uint8Array,
  data: Uint8Array,
  program: Uint8Array
) {
  const lsig = new LogicSig(program);
  const contractAddress = lsig.address();
  return tealSign(sk, data, contractAddress);
}
