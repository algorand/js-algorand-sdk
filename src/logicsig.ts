import * as nacl from './nacl/naclWrappers.js';
import {
  Address,
  addressFromPQSig,
  isValidAddress,
} from './encoding/address.js';
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
  EncodedPQSig,
  ENCODED_PQSIG_SCHEMA,
  encodedPQSigToEncodingData,
  encodedPQSigFromEncodingData,
} from './types/transactions/encoded.js';
import type { DelegatedLsigSigner, ProgramDataSigner } from './signer.js';

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

export const PROGRAM_TAG = new TextEncoder().encode('Program');
export const PQ_PROGRAM_TAG = new TextEncoder().encode('PQProgram');
export const MSIG_PROGRAM_TAG = new TextEncoder().encode('MsigProgram');

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
      {
        key: 'pqsig',
        valueSchema: new OptionalSchema(ENCODED_PQSIG_SCHEMA),
      },
    ])
  );

  logic: Uint8Array;
  args: Uint8Array[];
  sig?: Uint8Array;
  msig?: EncodedMultisig;
  lmsig?: EncodedMultisig;
  pqsig?: EncodedPQSig;

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
    this.pqsig = undefined;
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
    if (this.pqsig) {
      data.set('pqsig', encodedPQSigToEncodingData(this.pqsig));
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
    if (data.get('pqsig')) {
      lsig.pqsig = encodedPQSigFromEncodingData(data.get('pqsig'));
    }
    return lsig;
  }

  /**
   * @deprecated This function does not perform full verification and should not be fully trusted on its own.
   * For example, it does not evaluate programs and does not have the ability to validate PQ signatures.
   *
   * Performs signature verification
   * @param publicKey - Verification key (derived from sender address or escrow address)
   */
  verify(publicKey: Uint8Array) {
    const sigCount = [this.sig, this.msig, this.lmsig, this.pqsig].filter(
      Boolean
    ).length;
    if (sigCount > 1) {
      return false;
    }

    try {
      sanityCheckProgram(this.logic);
    } catch (e) {
      return false;
    }

    const toBeSigned = utils.concatArrays(PROGRAM_TAG, this.logic);

    if (!this.sig && !this.msig && !this.lmsig && !this.pqsig) {
      const hash = nacl.genericHash(toBeSigned);
      return utils.arrayEqual(hash, publicKey);
    }

    if (this.pqsig) {
      // This function has no way to validate a post-quantum signature, so it
      // cannot report success here. Callers that need to sign a transaction
      // with a PQ delegated LogicSig should go through
      // signLogicSigTransactionObject, which skips this check.
      return false;
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
        MSIG_PROGRAM_TAG,
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
    const toBeSigned = utils.concatArrays(PROGRAM_TAG, this.logic);
    const hash = nacl.genericHash(toBeSigned);
    return new Address(Uint8Array.from(hash));
  }

  /**
   * @deprecated Use `signWithSigner` instead
   *
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
   * Signs this LogicSig for delegation using the given signer.
   *
   * @param signer - The signer to delegate to
   * @param msig - Optional multisig account the signer is a subsigner of
   * @returns The address the signer signed as. When `msig` is omitted this is
   *   the delegating account. When `msig` is given it is the individual
   *   subsigner, not the multisig, so the delegating account is
   *   `multisigAddress(msig)`. Either way it is an authorizing address, which
   *   is not necessarily the address a signer sends transactions from.
   *
   * Re-signing an already-signed LogicSig is allowed, and replaces the previous
   * delegation signature. At most one of `sig`, `msig`, `lmsig` and `pqsig` may
   * be set, so any signature left over from an earlier call is cleared.
   */
  async signWithSigner(
    signer: DelegatedLsigSigner,
    msig?: MultisigMetadata
  ): Promise<Address> {
    const sigResult = await signer(this, msig);
    if (msig == null) {
      if ('pqsig' in sigResult && sigResult.pqsig) {
        this.clearSignatures();
        this.pqsig = sigResult.pqsig;
        return sigResult.address;
      }

      if (!('sig' in sigResult) || !sigResult.sig) {
        throw Error(
          'Expected DelegatedLsigSigner to return sig or pqsig, but both are undefined. If signing for an msig, be sure to pass the msig argument'
        );
      }
      this.clearSignatures();
      this.sig = sigResult.sig;
    } else {
      if (!('lmsig' in sigResult) || !sigResult.lmsig) {
        throw Error(
          'Expected DelegatedLsigSigner to return lmsig, but lmsig is undefined. If signing for a single account, do not pass msig argument'
        );
      }
      const { lmsig } = sigResult;
      const expectedPks = pksFromAddresses(msig.addrs);
      if (
        lmsig.v !== msig.version ||
        lmsig.thr !== msig.threshold ||
        lmsig.subsig.length !== expectedPks.length ||
        !lmsig.subsig.every((subsig, i) =>
          utils.arrayEqual(subsig.pk, expectedPks[i])
        )
      ) {
        throw Error(
          'DelegatedLsigSigner returned an lmsig whose version, threshold or public keys do not match the requested multisig'
        );
      }

      this.clearSignatures();
      this.lmsig = sigResult.lmsig;
    }

    return sigResult.address;
  }

  /**
   * Removes every delegation signature from this LogicSig, so that exactly one
   * of them can be set afterwards.
   */
  private clearSignatures() {
    this.sig = undefined;
    this.msig = undefined;
    this.lmsig = undefined;
    this.pqsig = undefined;
  }

  /**
   * @deprecated Use `appendToMultisigWithSigner` instead
   *
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

  async appendToMultisigWithSigner(signer: DelegatedLsigSigner) {
    if (this.lmsig === undefined) {
      throw new Error('no multisig present');
    }

    const sigResult = await signer(this, {
      version: this.lmsig.v,
      threshold: this.lmsig.thr,
      addrs: this.lmsig.subsig.map((s) => new Address(s.pk)),
    });

    if (!('lmsig' in sigResult) || !sigResult.lmsig) {
      throw Error(
        'Expected DelegatedLsigSigner to return lmsig, but lmsig is undefined'
      );
    }
    if (
      sigResult.lmsig.v !== this.lmsig.v ||
      sigResult.lmsig.thr !== this.lmsig.thr
    ) {
      throw Error(
        'DelegatedLsigSigner returned an lmsig whose version or threshold does not match the current msig'
      );
    }

    let signaturesReturned = false;
    for (const subsig of sigResult.lmsig.subsig) {
      if (subsig.s) {
        signaturesReturned = true;
        const thisSubsig = this.lmsig.subsig.find((s) =>
          utils.arrayEqual(s.pk, subsig.pk)
        );
        if (thisSubsig === undefined) {
          throw Error(
            `DelegatedLsigSigner returned a signature for ${new Address(subsig.pk)} but this pk is not in the current msig`
          );
        }
        // Never let the signer silently replace a signature already collected
        // from another member.
        if (thisSubsig.s && !utils.arrayEqual(thisSubsig.s, subsig.s)) {
          throw Error(
            `DelegatedLsigSigner returned a signature for ${new Address(subsig.pk)} that conflicts with the signature already collected for it`
          );
        }
        thisSubsig.s = subsig.s;
      }
    }

    if (!signaturesReturned) {
      throw Error('DelegatedLsigSigner returned an lmsig with no signatures');
    }
  }

  /**
   * @deprecated Use `signWithSigner` followed by `.sig` instead
   */
  signProgram(secretKey: Uint8Array) {
    const toBeSigned = utils.concatArrays(PROGRAM_TAG, this.logic);
    const sig = nacl.sign(toBeSigned, secretKey);
    return sig;
  }

  /**
   * @deprecated Use `signWithSigner` followed by `.sig` instead
   */
  signProgramMultisig(secretKey: Uint8Array, msig: EncodedMultisig) {
    const multisigAddr = addressFromMultisigPreImg({
      version: msig.v,
      threshold: msig.thr,
      pks: msig.subsig.map((subsig) => subsig.pk),
    });
    const toBeSigned = utils.concatArrays(
      MSIG_PROGRAM_TAG,
      multisigAddr.publicKey,
      this.logic
    );
    const sig = nacl.sign(toBeSigned, secretKey);
    return sig;
  }

  /**
   * @deprecated Use `signWithSigner` followed by `.sig` instead
   */
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

  /**
   * Signs arbitrary data for use with the `ed25519verify` opcode from within
   * this LogicSig's program.
   *
   * @param signer - The signer to sign the data with
   * @param data - The data to sign
   */
  async signDataWithSigner(signer: ProgramDataSigner, data: Uint8Array) {
    return signer(data, this);
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
    return !!(
      this.lsig.sig ||
      this.lsig.msig ||
      this.lsig.lmsig ||
      this.lsig.pqsig
    );
  }

  /**
   * @deprecated This function does not perform full verification and should not be fully trusted on its own.
   * For example, it does not evaluate programs and does not have the ability to validate PQ signatures.
   *
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
    const sigCount = [
      this.lsig.sig,
      this.lsig.msig,
      this.lsig.lmsig,
      this.lsig.pqsig,
    ].filter(Boolean).length;
    if (sigCount > 1) {
      throw new Error(
        'LogicSig has too many signatures. At most one of sig, msig, lmsig, or pqsig may be present'
      );
    }

    if (this.lsig.pqsig) {
      // A PQ signature carries the scheme, salt and public key of the
      // delegating account, so derive the address rather than trusting
      // `sigkey`. Also throws if the signature is not self-consistent.
      const derived = addressFromPQSig(this.lsig.pqsig);
      if (this.sigkey && !utils.arrayEqual(this.sigkey, derived.publicKey)) {
        throw new Error(
          `Signing key for delegated account does not match the PQ signature. The signature authorizes ${derived}, but sigkey is ${new Address(this.sigkey)}`
        );
      }
      return derived;
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
   * @deprecated Use `signMultisigWithSigner` instead
   *
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

  async signMultisigWithSigner(
    msig: MultisigMetadata,
    signer: DelegatedLsigSigner
  ) {
    await this.lsig.signWithSigner(signer, msig);
  }

  /**
   * @deprecated Use appendToMultisigWithSigner
   *
   * Adds an additional signature from a member of the delegating multisig
   * account.
   *
   * @param secretKey - The secret key of one of the members of the delegating
   *   multisig account.
   */
  appendToMultisig(secretKey: Uint8Array) {
    this.lsig.appendToMultisig(secretKey);
  }

  async appendToMultisigWithSigner(signer: DelegatedLsigSigner) {
    await this.lsig.appendToMultisigWithSigner(signer);
  }

  /**
   * @deprecated Use `signWithSigner` instead
   *
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

  /**
   * Turns this LogicSigAccount into a delegated LogicSig, signed by the given
   * signer. If the delegating account is a multisig account, use
   * `signMultisigWithSigner` instead.
   *
   * @param signer - The signer of the delegating account.
   */
  async signWithSigner(signer: DelegatedLsigSigner) {
    // Record the address the signer reports rather than any sending address it
    // may advertise: the latter is the address the signer sends transactions
    // from, which for a rekeyed account is not the account that authorizes
    // this delegation.
    const delegatingAddress = await this.lsig.signWithSigner(signer);
    this.sigkey = delegatingAddress.publicKey;
  }
}

/**
 * logicSigFromByte accepts encoded logic sig bytes and attempts to call logicsig.fromByte on it,
 * returning the result
 */
export function logicSigFromByte(encoded: Uint8Array): LogicSig {
  return encoding.decodeMsgpack(encoded, LogicSig);
}

export const SIGN_PROGRAM_DATA_PREFIX = new TextEncoder().encode('ProgData');

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
