// @ts-nocheck // Temporary type fix, will be unnecessary in following PR
import base32 from 'hi-base32';
import { translateBoxReferences } from './boxStorage.js';
import { Address } from './encoding/address.js';
import { base64ToBytes, bytesToBase64 } from './encoding/binarydata.js';
import * as encoding from './encoding/encoding.js';
import * as nacl from './nacl/naclWrappers.js';
import {
  EncodedLogicSig,
  EncodedMultisig,
  EncodedSignedTransaction,
  EncodedTransaction,
  EncodedAssetParams,
  EncodedLocalStateSchema,
  EncodedGlobalStateSchema,
} from './types/transactions/index.js';
import {
  SuggestedParams,
  BoxReference,
  OnApplicationComplete,
  isOnApplicationComplete,
  TransactionParams,
  TransactionType,
  isTransactionType,
  PaymentTransactionParams,
  AssetConfigurationTransactionParams,
  AssetTransferTransactionParams,
  AssetFreezeTransactionParams,
  KeyRegistrationTransactionParams,
  ApplicationCallTransactionParams,
  StateProofTransactionParams,
} from './types/transactions/base.js';
import * as utils from './utils/utils.js';

const ALGORAND_TRANSACTION_LENGTH = 52;
const ALGORAND_TRANSACTION_LEASE_LENGTH = 32;
const NUM_ADDL_BYTES_AFTER_SIGNING = 75; // NUM_ADDL_BYTES_AFTER_SIGNING is the number of bytes added to a txn after signing it
const ASSET_METADATA_HASH_LENGTH = 32;
const KEYREG_VOTE_KEY_LENGTH = 32;
const KEYREG_SELECTION_KEY_LENGTH = 32;
const KEYREG_STATE_PROOF_KEY_LENGTH = 64;
const ALGORAND_TRANSACTION_GROUP_LENGTH = 32;

function uint8ArrayIsEmpty(input: Uint8Array): boolean {
  return input.every((value) => value === 0);
}

function getKeyregKey(
  input: undefined | string | Uint8Array,
  inputName: string,
  length: number
): Uint8Array | undefined {
  if (input == null) {
    return undefined;
  }

  let inputBytes: Uint8Array | undefined;

  if (typeof input === 'string') {
    inputBytes = base64ToBytes(input);
  } else if (input instanceof Uint8Array) {
    inputBytes = input;
  }

  if (inputBytes == null || inputBytes.byteLength !== length) {
    throw Error(
      `${inputName} must be a ${length} byte Uint8Array or base64 string.`
    );
  }

  return inputBytes;
}

function ensureAddress(input: unknown): Address {
  if (input == null) {
    throw new Error('Address must not be null or undefined');
  }
  if (typeof input === 'string') {
    return Address.fromString(input);
  }
  if (input instanceof Address) {
    return input;
  }
  throw new Error(`Not an address: ${input}`);
}

function optionalAddress(input: unknown): Address | undefined {
  if (input == null) {
    return undefined;
  }
  let addr: Address;
  if (input instanceof Address) {
    addr = input;
  } else if (typeof input === 'string') {
    addr = Address.fromString(input);
  } else {
    throw new Error(`Not an address: ${input}`);
  }
  if (uint8ArrayIsEmpty(addr.publicKey)) {
    // If it's the zero address, throw an error so that the user won't be surprised that this gets dropped
    throw new Error(
      'Invalid use of the zero address. To omit this value, pass in undefined'
    );
  }
  return addr;
}

function optionalUint8Array(input: unknown): Uint8Array | undefined {
  if (typeof input === 'undefined') {
    return undefined;
  }
  if (input instanceof Uint8Array) {
    return input;
  }
  throw new Error(`Not a Uint8Array: ${input}`);
}

function ensureUint8Array(input: unknown): Uint8Array {
  if (input instanceof Uint8Array) {
    return input;
  }
  throw new Error(`Not a Uint8Array: ${input}`);
}

function optionalUint64(input: unknown): bigint | undefined {
  if (typeof input === 'undefined') {
    return undefined;
  }
  return utils.ensureUint64(input);
}

function ensureBoolean(input: unknown): boolean {
  if (input === true || input === false) {
    return input;
  }
  throw new Error(`Not a boolean: ${input}`);
}

function ensureArray(input: unknown): unknown[] {
  if (Array.isArray(input)) {
    return input.slice();
  }
  throw new Error(`Not an array: ${input}`);
}

function optionalFixedLengthByteArray(
  input: unknown,
  length: number,
  name: string
): Uint8Array | undefined {
  const bytes = optionalUint8Array(input);
  if (typeof bytes === 'undefined') {
    return undefined;
  }
  if (bytes.byteLength !== length) {
    throw new Error(
      `${name} must be ${length} bytes long, was ${bytes.byteLength}`
    );
  }
  if (uint8ArrayIsEmpty(bytes)) {
    // if contains all 0s, omit it
    return undefined;
  }
  return bytes;
}

export interface TransactionBoxReference {
  readonly appIndex: bigint;
  readonly name: Uint8Array;
}

function ensureBoxReference(input: unknown): TransactionBoxReference {
  if (input != null && typeof input === 'object') {
    const { appIndex, name } = input as BoxReference;
    return {
      appIndex: utils.ensureUint64(appIndex),
      name: ensureUint8Array(name),
    };
  }
  throw new Error(`Not a box reference: ${input}`);
}

const TX_TAG = new TextEncoder().encode('TX');

export interface PaymentTransactionFields {
  readonly receiver: Address;
  readonly amount: bigint;
  readonly closeRemainderTo?: Address;
}

export interface KeyRegistrationTransactionFields {
  readonly voteKey?: Uint8Array;
  readonly selectionKey?: Uint8Array;
  readonly stateProofKey?: Uint8Array;
  readonly voteFirst?: bigint;
  readonly voteLast?: bigint;
  readonly voteKeyDilution?: bigint;
  readonly nonParticipation: boolean;
}

export interface AssetConfigTransactionFields {
  readonly assetIndex: bigint;
  readonly total: bigint;
  readonly decimals: number;
  readonly defaultFrozen: boolean;
  readonly manager?: Address;
  readonly reserve?: Address;
  readonly freeze?: Address;
  readonly clawback?: Address;
  readonly unitName?: string;
  readonly assetName?: string;
  readonly assetURL?: string;
  readonly assetMetadataHash?: Uint8Array;
}

export interface AssetTransferTransactionFields {
  readonly assetIndex: bigint;
  readonly amount: bigint;
  readonly assetSender?: Address;
  readonly receiver: Address;
  readonly closeRemainderTo?: Address;
}

export interface AssetFreezeTransactionFields {
  readonly assetIndex: bigint;
  readonly freezeAccount: Address;
  readonly frozen: boolean;
}

export interface ApplicationTransactionFields {
  readonly appIndex: bigint;
  readonly onComplete: OnApplicationComplete;
  readonly numLocalInts: number;
  readonly numLocalByteSlices: number;
  readonly numGlobalInts: number;
  readonly numGlobalByteSlices: number;
  readonly extraPages: number;
  readonly approvalProgram: Uint8Array;
  readonly clearProgram: Uint8Array;
  readonly appArgs: ReadonlyArray<Uint8Array>;
  readonly accounts: ReadonlyArray<Address>;
  readonly foreignApps: ReadonlyArray<bigint>;
  readonly foreignAssets: ReadonlyArray<bigint>;
  readonly boxes: ReadonlyArray<TransactionBoxReference>;
}

export interface StateProofTransactionFields {
  readonly stateProofType: number;
  readonly stateProof: Uint8Array;
  readonly stateProofMessage: Uint8Array;
}

/**
 * Transaction enables construction of Algorand transactions
 * */
export class Transaction {
  /** common */
  public readonly type: TransactionType;
  public readonly sender: Address;
  public readonly note: Uint8Array;
  public readonly lease?: Uint8Array;
  public readonly rekeyTo?: Address;

  /** group */
  public group: Uint8Array;

  /** suggested params */
  public fee: bigint;
  public readonly firstValid: bigint;
  public readonly lastValid: bigint;
  public readonly genesisID?: string;
  public readonly genesisHash: Uint8Array;

  /** type-specific fields */
  public readonly payment?: PaymentTransactionFields;
  public readonly keyreg?: KeyRegistrationTransactionFields;
  public readonly assetConfig?: AssetConfigTransactionFields;
  public readonly assetTransfer?: AssetTransferTransactionFields;
  public readonly assetFreeze?: AssetFreezeTransactionFields;
  public readonly applicationCall?: ApplicationTransactionFields;
  public readonly stateProof?: StateProofTransactionFields;

  constructor(params: TransactionParams) {
    if (!isTransactionType(params.type)) {
      throw new Error(`Invalid transaction type: ${params.type}`);
    }

    // Common fields
    this.type = params.type; // verified above
    this.sender = ensureAddress(params.sender);
    this.note = ensureUint8Array(params.note ?? new Uint8Array());
    this.lease = optionalFixedLengthByteArray(
      params.lease,
      ALGORAND_TRANSACTION_LEASE_LENGTH,
      'lease'
    );
    this.rekeyTo = optionalAddress(params.rekeyTo);

    // Group
    this.group = new Uint8Array();

    // Suggested params fields
    this.firstValid = utils.ensureUint64(params.suggestedParams.firstValid);
    this.lastValid = utils.ensureUint64(params.suggestedParams.lastValid);
    if (params.suggestedParams.genesisID) {
      if (typeof params.suggestedParams.genesisID !== 'string') {
        throw new Error('Genesis ID must be a string if present');
      }
      this.genesisID = params.suggestedParams.genesisID;
    }
    if (!params.suggestedParams.genesisHash) {
      throw new Error('Genesis hash must be specified');
    }
    this.genesisHash = base64ToBytes(params.suggestedParams.genesisHash);
    // Fee is handled at the end

    const fieldsPresent: TransactionType[] = [];
    if (params.paymentParams) fieldsPresent.push(TransactionType.pay);
    if (params.keyregParams) fieldsPresent.push(TransactionType.keyreg);
    if (params.assetConfigParams) fieldsPresent.push(TransactionType.acfg);
    if (params.assetTransferParams) fieldsPresent.push(TransactionType.axfer);
    if (params.assetFreezeParams) fieldsPresent.push(TransactionType.afrz);
    if (params.appCallParams) fieldsPresent.push(TransactionType.appl);
    if (params.stateProofParams) fieldsPresent.push(TransactionType.stpf);

    if (fieldsPresent.length !== 1) {
      throw new Error(
        `Transaction has wrong number of type fields present (${fieldsPresent.length}): ${fieldsPresent}`
      );
    }

    if (this.type !== fieldsPresent[0]) {
      throw new Error(
        `Transaction has type ${this.type} but fields present for ${fieldsPresent[0]}`
      );
    }

    if (params.paymentParams) {
      this.payment = {
        receiver: ensureAddress(params.paymentParams.receiver),
        amount: utils.ensureUint64(params.paymentParams.amount),
        closeRemainderTo: optionalAddress(
          params.paymentParams.closeRemainderTo
        ),
      };
    }

    if (params.keyregParams) {
      this.keyreg = {
        voteKey: getKeyregKey(
          params.keyregParams.voteKey,
          'voteKey',
          KEYREG_VOTE_KEY_LENGTH
        )!,
        selectionKey: getKeyregKey(
          params.keyregParams.selectionKey,
          'selectionKey',
          KEYREG_SELECTION_KEY_LENGTH
        )!,
        stateProofKey: getKeyregKey(
          params.keyregParams.stateProofKey,
          'stateProofKey',
          KEYREG_STATE_PROOF_KEY_LENGTH
        )!,
        voteFirst: optionalUint64(params.keyregParams.voteFirst),
        voteLast: optionalUint64(params.keyregParams.voteLast),
        voteKeyDilution: optionalUint64(params.keyregParams.voteKeyDilution),
        nonParticipation: ensureBoolean(
          params.keyregParams.nonParticipation ?? false
        ),
      };
      // Checking non-participation key registration
      if (
        this.keyreg.nonParticipation &&
        (this.keyreg.voteKey ||
          this.keyreg.selectionKey ||
          this.keyreg.stateProofKey ||
          typeof this.keyreg.voteFirst !== 'undefined' ||
          typeof this.keyreg.voteLast !== 'undefined' ||
          typeof this.keyreg.voteKeyDilution !== 'undefined')
      ) {
        throw new Error(
          'nonParticipation is true but participation params are present.'
        );
      }
      // Checking online key registration
      if (
        // If we are participating
        !this.keyreg.nonParticipation &&
        // And *ANY* participating fields are present
        (this.keyreg.voteKey ||
          this.keyreg.selectionKey ||
          this.keyreg.stateProofKey ||
          typeof this.keyreg.voteFirst !== 'undefined' ||
          typeof this.keyreg.voteLast !== 'undefined' ||
          typeof this.keyreg.voteKeyDilution !== 'undefined') &&
        // Then *ALL* participating fields must be present (with an exception for stateProofKey,
        // which was introduced later so for backwards compatibility we don't require it)
        !(
          this.keyreg.voteKey &&
          this.keyreg.selectionKey &&
          typeof this.keyreg.voteFirst !== 'undefined' &&
          typeof this.keyreg.voteLast !== 'undefined' &&
          typeof this.keyreg.voteKeyDilution !== 'undefined'
        )
      ) {
        throw new Error(
          `Online key registration missing at least one of the following fields: voteKey, selectionKey, voteFirst, voteLast, voteKeyDilution`
        );
      }
      // The last option is an offline key registration where all the fields
      // nonParticipation, voteKey, selectionKey, stateProofKey, voteFirst, voteLast, voteKeyDilution
      // are all undefined
    }

    if (params.assetConfigParams) {
      this.assetConfig = {
        assetIndex: utils.ensureUint64(
          params.assetConfigParams.assetIndex ?? 0
        ),
        total: utils.ensureUint64(params.assetConfigParams.total ?? 0),
        decimals: utils.ensureSafeUnsignedInteger(
          params.assetConfigParams.decimals ?? 0
        ),
        defaultFrozen: ensureBoolean(
          params.assetConfigParams.defaultFrozen ?? false
        ),
        manager: optionalAddress(params.assetConfigParams.manager),
        reserve: optionalAddress(params.assetConfigParams.reserve),
        freeze: optionalAddress(params.assetConfigParams.freeze),
        clawback: optionalAddress(params.assetConfigParams.clawback),
        unitName: params.assetConfigParams.unitName ?? '',
        assetName: params.assetConfigParams.assetName ?? '',
        assetURL: params.assetConfigParams.assetURL ?? '',
        assetMetadataHash: optionalFixedLengthByteArray(
          params.assetConfigParams.assetMetadataHash,
          ASSET_METADATA_HASH_LENGTH,
          'assetMetadataHash'
        ),
      };
    }

    if (params.assetTransferParams) {
      this.assetTransfer = {
        assetIndex: utils.ensureUint64(params.assetTransferParams.assetIndex),
        amount: utils.ensureUint64(params.assetTransferParams.amount),
        assetSender: optionalAddress(params.assetTransferParams.assetSender),
        receiver: ensureAddress(params.assetTransferParams.receiver),
        closeRemainderTo: optionalAddress(
          params.assetTransferParams.closeRemainderTo
        ),
      };
    }

    if (params.assetFreezeParams) {
      this.assetFreeze = {
        assetIndex: utils.ensureUint64(params.assetFreezeParams.assetIndex),
        freezeAccount: ensureAddress(params.assetFreezeParams.freezeTarget),
        frozen: ensureBoolean(params.assetFreezeParams.frozen),
      };
    }

    if (params.appCallParams) {
      const { onComplete } = params.appCallParams;
      if (!isOnApplicationComplete(onComplete)) {
        throw new Error(`Invalid onCompletion value: ${onComplete}`);
      }
      this.applicationCall = {
        appIndex: utils.ensureUint64(params.appCallParams.appIndex),
        onComplete,
        numLocalInts: utils.ensureSafeUnsignedInteger(
          params.appCallParams.numLocalInts ?? 0
        ),
        numLocalByteSlices: utils.ensureSafeUnsignedInteger(
          params.appCallParams.numLocalByteSlices ?? 0
        ),
        numGlobalInts: utils.ensureSafeUnsignedInteger(
          params.appCallParams.numGlobalInts ?? 0
        ),
        numGlobalByteSlices: utils.ensureSafeUnsignedInteger(
          params.appCallParams.numGlobalByteSlices ?? 0
        ),
        extraPages: utils.ensureSafeUnsignedInteger(
          params.appCallParams.extraPages ?? 0
        ),
        approvalProgram: ensureUint8Array(
          params.appCallParams.approvalProgram ?? new Uint8Array()
        ),
        clearProgram: ensureUint8Array(
          params.appCallParams.clearProgram ?? new Uint8Array()
        ),
        appArgs: ensureArray(params.appCallParams.appArgs ?? []).map(
          ensureUint8Array
        ),
        accounts: ensureArray(params.appCallParams.accounts ?? []).map(
          ensureAddress
        ),
        foreignApps: ensureArray(params.appCallParams.foreignApps ?? []).map(
          utils.ensureUint64
        ),
        foreignAssets: ensureArray(
          params.appCallParams.foreignAssets ?? []
        ).map(utils.ensureUint64),
        boxes: ensureArray(params.appCallParams.boxes ?? []).map(
          ensureBoxReference
        ),
      };
    }

    if (params.stateProofParams) {
      this.stateProof = {
        stateProofType: utils.ensureSafeUnsignedInteger(
          params.stateProofParams.stateProofType ?? 0
        ),
        stateProof: ensureUint8Array(
          params.stateProofParams.stateProof ?? new Uint8Array()
        ),
        stateProofMessage: ensureUint8Array(
          params.stateProofParams.stateProofMessage ?? new Uint8Array()
        ),
      };
    }

    // Determine fee
    this.fee = utils.ensureUint64(params.suggestedParams.fee);

    const feeDependsOnSize = !ensureBoolean(
      params.suggestedParams.flatFee ?? false
    );
    if (feeDependsOnSize) {
      const minFee = utils.ensureUint64(params.suggestedParams.minFee);
      this.fee *= BigInt(this.estimateSize());
      // If suggested fee too small and will be rejected, set to min tx fee
      if (this.fee < minFee) {
        this.fee = minFee;
      }
    }
  }

  // eslint-disable-next-line camelcase
  get_obj_for_encoding(): EncodedTransaction {
    const forEncoding: EncodedTransaction = {
      type: this.type,
      gh: this.genesisHash,
      lv: this.lastValid,
    };
    if (!uint8ArrayIsEmpty(this.sender.publicKey)) {
      forEncoding.snd = this.sender.publicKey;
    }
    if (this.genesisID) {
      forEncoding.gen = this.genesisID;
    }
    if (this.fee) {
      forEncoding.fee = this.fee;
    }
    if (this.firstValid) {
      forEncoding.fv = this.firstValid;
    }
    if (this.note.length) {
      forEncoding.note = this.note;
    }
    if (this.lease) {
      forEncoding.lx = this.lease;
    }
    if (this.rekeyTo) {
      forEncoding.rekey = this.rekeyTo.publicKey;
    }
    if (this.group.length) {
      forEncoding.grp = this.group;
    }

    if (this.payment) {
      if (this.payment.amount) {
        forEncoding.amt = this.payment.amount;
      }
      if (!uint8ArrayIsEmpty(this.payment.receiver.publicKey)) {
        forEncoding.rcv = this.payment.receiver.publicKey;
      }
      if (this.payment.closeRemainderTo) {
        forEncoding.close = this.payment.closeRemainderTo.publicKey;
      }
      return forEncoding;
    }

    if (this.keyreg) {
      if (this.keyreg.voteKey) {
        forEncoding.votekey = this.keyreg.voteKey;
      }
      if (this.keyreg.selectionKey) {
        forEncoding.selkey = this.keyreg.selectionKey;
      }
      if (this.keyreg.stateProofKey) {
        forEncoding.sprfkey = this.keyreg.stateProofKey;
      }
      if (this.keyreg.voteFirst) {
        forEncoding.votefst = this.keyreg.voteFirst;
      }
      if (this.keyreg.voteLast) {
        forEncoding.votelst = this.keyreg.voteLast;
      }
      if (this.keyreg.voteKeyDilution) {
        forEncoding.votekd = this.keyreg.voteKeyDilution;
      }
      if (this.keyreg.nonParticipation) {
        forEncoding.nonpart = this.keyreg.nonParticipation;
      }
      return forEncoding;
    }

    if (this.assetConfig) {
      if (this.assetConfig.assetIndex) {
        forEncoding.caid = this.assetConfig.assetIndex;
      }
      const assetParams: EncodedAssetParams = {};
      if (this.assetConfig.total) {
        assetParams.t = this.assetConfig.total;
      }
      if (this.assetConfig.decimals) {
        assetParams.dc = this.assetConfig.decimals;
      }
      if (this.assetConfig.defaultFrozen) {
        assetParams.df = this.assetConfig.defaultFrozen;
      }
      if (this.assetConfig.manager) {
        assetParams.m = this.assetConfig.manager.publicKey;
      }
      if (this.assetConfig.reserve) {
        assetParams.r = this.assetConfig.reserve.publicKey;
      }
      if (this.assetConfig.freeze) {
        assetParams.f = this.assetConfig.freeze.publicKey;
      }
      if (this.assetConfig.clawback) {
        assetParams.c = this.assetConfig.clawback.publicKey;
      }
      if (this.assetConfig.unitName) {
        assetParams.un = this.assetConfig.unitName;
      }
      if (this.assetConfig.assetName) {
        assetParams.an = this.assetConfig.assetName;
      }
      if (this.assetConfig.assetURL) {
        assetParams.au = this.assetConfig.assetURL;
      }
      if (this.assetConfig.assetMetadataHash) {
        assetParams.am = this.assetConfig.assetMetadataHash;
      }
      if (Object.keys(assetParams).length) {
        forEncoding.apar = assetParams;
      }
      return forEncoding;
    }

    if (this.assetTransfer) {
      if (this.assetTransfer.assetIndex) {
        forEncoding.xaid = this.assetTransfer.assetIndex;
      }
      if (this.assetTransfer.amount) {
        forEncoding.aamt = this.assetTransfer.amount;
      }
      if (!uint8ArrayIsEmpty(this.assetTransfer.receiver.publicKey)) {
        forEncoding.arcv = this.assetTransfer.receiver.publicKey;
      }
      if (this.assetTransfer.closeRemainderTo) {
        forEncoding.aclose = this.assetTransfer.closeRemainderTo.publicKey;
      }
      if (this.assetTransfer.assetSender) {
        forEncoding.asnd = this.assetTransfer.assetSender.publicKey;
      }
      return forEncoding;
    }

    if (this.assetFreeze) {
      if (this.assetFreeze.assetIndex) {
        forEncoding.faid = this.assetFreeze.assetIndex;
      }
      if (this.assetFreeze.frozen) {
        forEncoding.afrz = this.assetFreeze.frozen;
      }
      if (!uint8ArrayIsEmpty(this.assetFreeze.freezeAccount.publicKey)) {
        forEncoding.fadd = this.assetFreeze.freezeAccount.publicKey;
      }
      return forEncoding;
    }

    if (this.applicationCall) {
      if (this.applicationCall.appIndex) {
        forEncoding.apid = this.applicationCall.appIndex;
      }
      if (this.applicationCall.onComplete) {
        forEncoding.apan = this.applicationCall.onComplete;
      }
      if (this.applicationCall.appArgs.length) {
        forEncoding.apaa = this.applicationCall.appArgs.slice();
      }
      if (this.applicationCall.accounts.length) {
        forEncoding.apat = this.applicationCall.accounts.map(
          (decodedAddress) => decodedAddress.publicKey
        );
      }
      if (this.applicationCall.foreignAssets.length) {
        forEncoding.apas = this.applicationCall.foreignAssets.slice();
      }
      if (this.applicationCall.foreignApps.length) {
        forEncoding.apfa = this.applicationCall.foreignApps.slice();
      }
      if (this.applicationCall.boxes.length) {
        forEncoding.apbx = translateBoxReferences(
          this.applicationCall.boxes,
          this.applicationCall.foreignApps,
          this.applicationCall.appIndex
        );
      }
      if (this.applicationCall.approvalProgram.length) {
        forEncoding.apap = this.applicationCall.approvalProgram;
      }
      if (this.applicationCall.clearProgram.length) {
        forEncoding.apsu = this.applicationCall.clearProgram;
      }
      if (
        this.applicationCall.numLocalInts ||
        this.applicationCall.numLocalByteSlices
      ) {
        const localSchema: EncodedLocalStateSchema = {};
        if (this.applicationCall.numLocalInts) {
          localSchema.nui = this.applicationCall.numLocalInts;
        }
        if (this.applicationCall.numLocalByteSlices) {
          localSchema.nbs = this.applicationCall.numLocalByteSlices;
        }
        forEncoding.apls = localSchema;
      }
      if (
        this.applicationCall.numGlobalInts ||
        this.applicationCall.numGlobalByteSlices
      ) {
        const globalSchema: EncodedGlobalStateSchema = {};
        if (this.applicationCall.numGlobalInts) {
          globalSchema.nui = this.applicationCall.numGlobalInts;
        }
        if (this.applicationCall.numGlobalByteSlices) {
          globalSchema.nbs = this.applicationCall.numGlobalByteSlices;
        }
        forEncoding.apgs = globalSchema;
      }
      if (this.applicationCall.extraPages) {
        forEncoding.apep = this.applicationCall.extraPages;
      }
      return forEncoding;
    }

    if (this.stateProof) {
      if (this.stateProof.stateProofType) {
        forEncoding.sptype = this.stateProof.stateProofType;
      }
      forEncoding.spmsg = this.stateProof.stateProofMessage;
      forEncoding.sp = this.stateProof.stateProof;
      return forEncoding;
    }

    throw new Error(`Unexpected transaction type: ${this.type}`);
  }

  // eslint-disable-next-line camelcase
  static from_obj_for_encoding(txnForEnc: EncodedTransaction): Transaction {
    const suggestedParams: SuggestedParams = {
      minFee: BigInt(0),
      flatFee: true,
      fee: txnForEnc.fee ?? 0,
      firstValid: txnForEnc.fv ?? 0,
      lastValid: txnForEnc.lv,
      genesisHash: bytesToBase64(txnForEnc.gh), // TODO: would like to avoid encoding/decoding here
      genesisID: txnForEnc.gen,
    };

    if (!isTransactionType(txnForEnc.type)) {
      throw new Error(`Unrecognized transaction type: ${txnForEnc.type}`);
    }

    const params: TransactionParams = {
      type: txnForEnc.type,
      sender: txnForEnc.snd
        ? new Address(txnForEnc.snd)
        : Address.zeroAddress(),
      note: txnForEnc.note,
      lease: txnForEnc.lx,
      suggestedParams,
    };

    if (txnForEnc.rekey) {
      params.rekeyTo = new Address(txnForEnc.rekey);
    }

    if (params.type === TransactionType.pay) {
      const paymentParams: PaymentTransactionParams = {
        amount: txnForEnc.amt ?? 0,
        receiver: txnForEnc.rcv
          ? new Address(txnForEnc.rcv)
          : Address.zeroAddress(),
      };
      if (txnForEnc.close) {
        paymentParams.closeRemainderTo = new Address(txnForEnc.close);
      }
      params.paymentParams = paymentParams;
    } else if (params.type === TransactionType.keyreg) {
      const keyregParams: KeyRegistrationTransactionParams = {
        voteKey: txnForEnc.votekey,
        selectionKey: txnForEnc.selkey,
        stateProofKey: txnForEnc.sprfkey,
        voteFirst: txnForEnc.votefst,
        voteLast: txnForEnc.votelst,
        voteKeyDilution: txnForEnc.votekd,
        nonParticipation: txnForEnc.nonpart,
      };
      params.keyregParams = keyregParams;
    } else if (params.type === TransactionType.acfg) {
      const assetConfigParams: AssetConfigurationTransactionParams = {
        assetIndex: txnForEnc.caid,
      };
      if (txnForEnc.apar) {
        assetConfigParams.total = txnForEnc.apar.t;
        assetConfigParams.decimals = txnForEnc.apar.dc;
        assetConfigParams.defaultFrozen = txnForEnc.apar.df;
        assetConfigParams.unitName = txnForEnc.apar.un;
        assetConfigParams.assetName = txnForEnc.apar.an;
        assetConfigParams.assetURL = txnForEnc.apar.au;
        assetConfigParams.assetMetadataHash = txnForEnc.apar.am;
        if (txnForEnc.apar.m) {
          assetConfigParams.manager = new Address(txnForEnc.apar.m);
        }
        if (txnForEnc.apar.r) {
          assetConfigParams.reserve = new Address(txnForEnc.apar.r);
        }
        if (txnForEnc.apar.f) {
          assetConfigParams.freeze = new Address(txnForEnc.apar.f);
        }
        if (txnForEnc.apar.c) {
          assetConfigParams.clawback = new Address(txnForEnc.apar.c);
        }
      }
      params.assetConfigParams = assetConfigParams;
    } else if (params.type === TransactionType.axfer) {
      const assetTransferParams: AssetTransferTransactionParams = {
        assetIndex: txnForEnc.xaid ?? 0,
        amount: txnForEnc.aamt ?? 0,
        receiver: txnForEnc.arcv
          ? new Address(txnForEnc.arcv)
          : Address.zeroAddress(),
      };
      if (txnForEnc.aclose) {
        assetTransferParams.closeRemainderTo = new Address(txnForEnc.aclose);
      }
      if (txnForEnc.asnd) {
        assetTransferParams.assetSender = new Address(txnForEnc.asnd);
      }
      params.assetTransferParams = assetTransferParams;
    } else if (params.type === TransactionType.afrz) {
      const assetFreezeParams: AssetFreezeTransactionParams = {
        assetIndex: txnForEnc.faid ?? 0,
        freezeTarget: txnForEnc.fadd
          ? new Address(txnForEnc.fadd)
          : Address.zeroAddress(),
        frozen: txnForEnc.afrz ?? false,
      };
      params.assetFreezeParams = assetFreezeParams;
    } else if (params.type === TransactionType.appl) {
      const appCallParams: ApplicationCallTransactionParams = {
        appIndex: txnForEnc.apid ?? 0,
        onComplete: utils.ensureSafeUnsignedInteger(txnForEnc.apan ?? 0),
        appArgs: txnForEnc.apaa,
        accounts: (txnForEnc.apat ?? []).map((pk) => new Address(pk)),
        foreignAssets: txnForEnc.apas,
        foreignApps: txnForEnc.apfa,
        approvalProgram: txnForEnc.apap,
        clearProgram: txnForEnc.apsu,
        numLocalInts: txnForEnc.apls?.nui,
        numLocalByteSlices: txnForEnc.apls?.nbs,
        numGlobalInts: txnForEnc.apgs?.nui,
        numGlobalByteSlices: txnForEnc.apgs?.nbs,
        extraPages: txnForEnc.apep,
      };
      if (txnForEnc.apbx) {
        appCallParams.boxes = txnForEnc.apbx.map((box) => {
          const index = utils.ensureSafeUnsignedInteger(box.i ?? 0);
          const name = box.n ?? new Uint8Array();
          if (index === 0) {
            // We return 0 for the app ID so that it's guaranteed translateBoxReferences will
            // translate the app index back to 0. If we instead returned the called app ID,
            // translateBoxReferences would translate the app index to a nonzero value if the called
            // app is also in the foreign app array.
            return {
              appIndex: 0,
              name,
            };
          }
          if (
            !appCallParams.foreignApps ||
            index > appCallParams.foreignApps.length
          ) {
            throw new Error(
              `Cannot find foreign app index ${index} in ${appCallParams.foreignApps}`
            );
          }
          return {
            appIndex: appCallParams.foreignApps[index - 1],
            name,
          };
        });
      }
      params.appCallParams = appCallParams;
    } else if (params.type === TransactionType.stpf) {
      const stateProofParams: StateProofTransactionParams = {
        stateProofType: txnForEnc.sptype,
        stateProof: txnForEnc.sp,
        stateProofMessage: txnForEnc.spmsg,
      };
      params.stateProofParams = stateProofParams;
    } else {
      const exhaustiveCheck: never = params.type;
      throw new Error(`Unexpected transaction type: ${exhaustiveCheck}`);
    }

    const txn = new Transaction(params);

    if (txnForEnc.grp) {
      const group = ensureUint8Array(txnForEnc.grp);
      if (group.byteLength !== ALGORAND_TRANSACTION_GROUP_LENGTH) {
        throw new Error(`Invalid group length: ${group.byteLength}`);
      }
      txn.group = group;
    }

    return txn;
  }

  private estimateSize() {
    return this.toByte().length + NUM_ADDL_BYTES_AFTER_SIGNING;
  }

  bytesToSign() {
    const encodedMsg = this.toByte();
    return utils.concatArrays(TX_TAG, encodedMsg);
  }

  toByte() {
    return encoding.encode(this.get_obj_for_encoding());
  }

  // returns the raw signature
  rawSignTxn(sk: Uint8Array): Uint8Array {
    const toBeSigned = this.bytesToSign();
    const sig = nacl.sign(toBeSigned, sk);
    return sig;
  }

  signTxn(sk: Uint8Array): Uint8Array {
    // construct signed message
    const sTxn: EncodedSignedTransaction = {
      sig: this.rawSignTxn(sk),
      txn: this.get_obj_for_encoding(),
    };
    // add AuthAddr if signing with a different key than sender indicates
    const keypair = nacl.keyPairFromSecretKey(sk);
    const pubKeyFromSk = keypair.publicKey;
    if (!utils.arrayEqual(pubKeyFromSk, this.sender.publicKey)) {
      sTxn.sgnr = pubKeyFromSk;
    }
    return new Uint8Array(encoding.encode(sTxn));
  }

  attachSignature(
    signerAddr: string | Address,
    signature: Uint8Array
  ): Uint8Array {
    if (!nacl.isValidSignatureLength(signature.length)) {
      throw new Error('Invalid signature length');
    }
    const sTxn: EncodedSignedTransaction = {
      sig: signature,
      txn: this.get_obj_for_encoding(),
    };
    const signerAddrObj = ensureAddress(signerAddr);
    // add AuthAddr if signing with a different key than From indicates
    if (!this.sender.equals(signerAddrObj)) {
      sTxn.sgnr = signerAddrObj.publicKey;
    }
    return new Uint8Array(encoding.encode(sTxn));
  }

  rawTxID(): Uint8Array {
    const enMsg = this.toByte();
    const gh = utils.concatArrays(TX_TAG, enMsg);
    return Uint8Array.from(nacl.genericHash(gh));
  }

  txID(): string {
    const hash = this.rawTxID();
    return base32.encode(hash).slice(0, ALGORAND_TRANSACTION_LENGTH);
  }
}

/**
 * encodeUnsignedSimulateTransaction takes a txnBuilder.Transaction object,
 * converts it into a SignedTransaction-like object, and converts it to a Buffer.
 *
 * Note: this function should only be used to simulate unsigned transactions.
 *
 * @param transactionObject - Transaction object to simulate.
 */
export function encodeUnsignedSimulateTransaction(
  transactionObject: Transaction
) {
  const objToEncode: EncodedSignedTransaction = {
    txn: transactionObject.get_obj_for_encoding(),
  };
  return encoding.encode(objToEncode);
}

/**
 * encodeUnsignedTransaction takes a completed txnBuilder.Transaction object, such as from the makeFoo
 * family of transactions, and converts it to a Buffer
 * @param transactionObject - the completed Transaction object
 */
export function encodeUnsignedTransaction(transactionObject: Transaction) {
  const objToEncode = transactionObject.get_obj_for_encoding();
  return encoding.encode(objToEncode);
}

/**
 * decodeUnsignedTransaction takes a Uint8Array (as if from encodeUnsignedTransaction) and converts it to a txnBuilder.Transaction object
 * @param transactionBuffer - the Uint8Array containing a transaction
 */
export function decodeUnsignedTransaction(
  transactionBuffer: ArrayLike<number>
) {
  const partlyDecodedObject = encoding.decode(
    transactionBuffer
  ) as EncodedTransaction;
  return Transaction.from_obj_for_encoding(partlyDecodedObject);
}

/**
 * Object representing a transaction with a signature
 */
export interface SignedTransaction {
  /**
   * Transaction signature
   */
  sig?: Uint8Array;

  /**
   * The transaction that was signed
   */
  txn: Transaction;

  /**
   * Multisig structure
   */
  msig?: EncodedMultisig;

  /**
   * Logic signature
   */
  lsig?: EncodedLogicSig;

  /**
   * The signer, if signing with a different key than the Transaction type `sender` property indicates
   */
  sgnr?: Uint8Array;
}

/**
 * decodeSignedTransaction takes a Uint8Array (from transaction.signTxn) and converts it to an object
 * containing the Transaction (txn), the signature (sig), and the auth-addr field if applicable (sgnr)
 * @param transactionBuffer - the Uint8Array containing a transaction
 * @returns containing a Transaction, the signature, and possibly an auth-addr field
 */
export function decodeSignedTransaction(
  transactionBuffer: Uint8Array
): SignedTransaction {
  const stxnDecoded = encoding.decode(
    transactionBuffer
  ) as EncodedSignedTransaction;
  const stxn: SignedTransaction = {
    ...stxnDecoded,
    txn: Transaction.from_obj_for_encoding(stxnDecoded.txn),
  };
  return stxn;
}
