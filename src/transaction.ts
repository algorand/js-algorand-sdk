import base32 from 'hi-base32';
import {
  jsonPrepareBoxReferences,
  msgpackPrepareBoxReferences,
} from './boxStorage.js';
import { Address } from './encoding/address.js';
import * as encoding from './encoding/encoding.js';
import {
  AddressSchema,
  Uint64Schema,
  ByteArraySchema,
  FixedLengthByteArraySchema,
  StringSchema,
  ArraySchema,
  NamedMapSchema,
  BooleanSchema,
} from './encoding/schema/index.js';
import { bytesToBase64, base64ToBytes } from './encoding/binarydata.js';
import * as nacl from './nacl/naclWrappers.js';
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

  if (input instanceof Uint8Array) {
    inputBytes = input;
  }

  if (inputBytes == null || inputBytes.byteLength !== length) {
    throw Error(`${inputName} must be a ${length} byte Uint8Array`);
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
export class Transaction
  implements encoding.MsgpackEncodable, encoding.JSONEncodable
{
  static encodingSchema = new NamedMapSchema(
    [
      // Common
      { key: 'type', valueSchema: new StringSchema(), required: true },
      { key: 'snd', valueSchema: new AddressSchema(), required: true },
      { key: 'lv', valueSchema: new Uint64Schema(), required: true },
      { key: 'gen', valueSchema: new StringSchema() },
      { key: 'gh', valueSchema: new FixedLengthByteArraySchema(32) },
      { key: 'fee', valueSchema: new Uint64Schema(), required: true },
      { key: 'fv', valueSchema: new Uint64Schema(), required: true },
      { key: 'note', valueSchema: new ByteArraySchema() },
      { key: 'lx', valueSchema: new FixedLengthByteArraySchema(32) },
      { key: 'rekey', valueSchema: new AddressSchema() },
      { key: 'grp', valueSchema: new FixedLengthByteArraySchema(32) },
      // Payment
      { key: 'amt', valueSchema: new Uint64Schema(), required: true },
      { key: 'rcv', valueSchema: new AddressSchema(), required: true },
      { key: 'close', valueSchema: new AddressSchema() },
      // Keyreg
      { key: 'votekey', valueSchema: new FixedLengthByteArraySchema(32) },
      { key: 'selkey', valueSchema: new FixedLengthByteArraySchema(32) },
      { key: 'sprfkey', valueSchema: new FixedLengthByteArraySchema(64) },
      { key: 'votefst', valueSchema: new Uint64Schema() },
      { key: 'votelst', valueSchema: new Uint64Schema() },
      { key: 'votekd', valueSchema: new Uint64Schema() },
      { key: 'nonpart', valueSchema: new BooleanSchema(), required: true },
      // AssetConfig
      { key: 'caid', valueSchema: new Uint64Schema() },
      {
        key: 'apar',
        valueSchema: new NamedMapSchema(
          [
            { key: 't', valueSchema: new Uint64Schema() },
            { key: 'dc', valueSchema: new Uint64Schema() },
            { key: 'df', valueSchema: new BooleanSchema() },
            { key: 'm', valueSchema: new AddressSchema() },
            { key: 'r', valueSchema: new AddressSchema() },
            { key: 'f', valueSchema: new AddressSchema() },
            { key: 'c', valueSchema: new AddressSchema() },
            { key: 'un', valueSchema: new StringSchema() },
            { key: 'an', valueSchema: new StringSchema() },
            { key: 'au', valueSchema: new StringSchema() },
            { key: 'am', valueSchema: new FixedLengthByteArraySchema(32) },
          ].map((entry) => ({ ...entry, omitEmpty: true, required: false }))
        ),
        required: false,
      },
      // AssetTransfer
      { key: 'xaid', valueSchema: new Uint64Schema(), required: true },
      { key: 'aamt', valueSchema: new Uint64Schema(), required: true },
      { key: 'arcv', valueSchema: new AddressSchema(), required: true },
      { key: 'aclose', valueSchema: new AddressSchema() },
      { key: 'asnd', valueSchema: new AddressSchema() },
      // AssetFreeze
      { key: 'faid', valueSchema: new Uint64Schema(), required: true },
      { key: 'afrz', valueSchema: new BooleanSchema(), required: true },
      { key: 'fadd', valueSchema: new AddressSchema(), required: true },
      // Application
      { key: 'apid', valueSchema: new Uint64Schema(), required: true },
      { key: 'apan', valueSchema: new Uint64Schema(), required: true },
      {
        key: 'apaa',
        valueSchema: new ArraySchema(new ByteArraySchema()),
        required: true,
      },
      {
        key: 'apat',
        valueSchema: new ArraySchema(new AddressSchema()),
        required: true,
      },
      {
        key: 'apas',
        valueSchema: new ArraySchema(new Uint64Schema()),
        required: true,
      },
      {
        key: 'apfa',
        valueSchema: new ArraySchema(new Uint64Schema()),
        required: true,
      },
      {
        key: 'apbx',
        valueSchema: new ArraySchema(
          new NamedMapSchema([
            {
              key: 'i',
              valueSchema: new Uint64Schema(),
              omitEmpty: true,
              required: true,
            },
            {
              key: 'n',
              valueSchema: new ByteArraySchema(),
              omitEmpty: true,
              required: true,
            },
          ])
        ),
      },
      { key: 'apap', valueSchema: new ByteArraySchema() },
      { key: 'apsu', valueSchema: new ByteArraySchema() },
      { key: 'nui', valueSchema: new Uint64Schema(), required: true },
      { key: 'nbs', valueSchema: new Uint64Schema(), required: true },
      { key: 'ngi', valueSchema: new Uint64Schema(), required: true },
      { key: 'nbs', valueSchema: new Uint64Schema(), required: true },
      { key: 'ep', valueSchema: new Uint64Schema(), required: true },
      // StateProof
      { key: 'spft', valueSchema: new Uint64Schema(), required: true },
      { key: 'sp', valueSchema: new ByteArraySchema(), required: true },
      { key: 'spm', valueSchema: new ByteArraySchema(), required: true },
    ].map((entry) => ({
      ...entry,
      omitEmpty: true,
      required: entry.required ?? false,
    }))
  );

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
  public readonly genesisHash?: Uint8Array;

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
    this.genesisHash = optionalUint8Array(params.suggestedParams.genesisHash);
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

  msgpackPrepare(): Map<string, encoding.MsgpackEncodingData> {
    const data = new Map<string, encoding.MsgpackEncodingData>([
      ['type', this.type],
      ['lv', this.lastValid],
    ]);
    if (!uint8ArrayIsEmpty(this.sender.publicKey)) {
      data.set('snd', this.sender.publicKey);
    }
    if (this.genesisID) {
      data.set('gen', this.genesisID);
    }
    if (this.genesisHash) {
      data.set('gh', this.genesisHash);
    }
    if (this.fee) {
      data.set('fee', this.fee);
    }
    if (this.firstValid) {
      data.set('fv', this.firstValid);
    }
    if (this.note.length) {
      data.set('note', this.note);
    }
    if (this.lease) {
      data.set('lx', this.lease);
    }
    if (this.rekeyTo) {
      data.set('rekey', this.rekeyTo.publicKey);
    }
    if (this.group.length) {
      data.set('grp', this.group);
    }

    if (this.payment) {
      if (this.payment.amount) {
        data.set('amt', this.payment.amount);
      }
      if (!uint8ArrayIsEmpty(this.payment.receiver.publicKey)) {
        data.set('rcv', this.payment.receiver.publicKey);
      }
      if (this.payment.closeRemainderTo) {
        data.set('close', this.payment.closeRemainderTo.publicKey);
      }
      return data;
    }

    if (this.keyreg) {
      if (this.keyreg.voteKey) {
        data.set('votekey', this.keyreg.voteKey);
      }
      if (this.keyreg.selectionKey) {
        data.set('selkey', this.keyreg.selectionKey);
      }
      if (this.keyreg.stateProofKey) {
        data.set('sprfkey', this.keyreg.stateProofKey);
      }
      if (this.keyreg.voteFirst) {
        data.set('votefst', this.keyreg.voteFirst);
      }
      if (this.keyreg.voteLast) {
        data.set('votelst', this.keyreg.voteLast);
      }
      if (this.keyreg.voteKeyDilution) {
        data.set('votekd', this.keyreg.voteKeyDilution);
      }
      if (this.keyreg.nonParticipation) {
        data.set('nonpart', this.keyreg.nonParticipation);
      }
      return data;
    }

    if (this.assetConfig) {
      if (this.assetConfig.assetIndex) {
        data.set('caid', this.assetConfig.assetIndex);
      }
      const assetParams = new Map<string, encoding.MsgpackEncodingData>();
      if (this.assetConfig.total) {
        assetParams.set('t', this.assetConfig.total);
      }
      if (this.assetConfig.decimals) {
        assetParams.set('dc', this.assetConfig.decimals);
      }
      if (this.assetConfig.defaultFrozen) {
        assetParams.set('df', this.assetConfig.defaultFrozen);
      }
      if (this.assetConfig.manager) {
        assetParams.set('m', this.assetConfig.manager.publicKey);
      }
      if (this.assetConfig.reserve) {
        assetParams.set('r', this.assetConfig.reserve.publicKey);
      }
      if (this.assetConfig.freeze) {
        assetParams.set('f', this.assetConfig.freeze.publicKey);
      }
      if (this.assetConfig.clawback) {
        assetParams.set('c', this.assetConfig.clawback.publicKey);
      }
      if (this.assetConfig.unitName) {
        assetParams.set('un', this.assetConfig.unitName);
      }
      if (this.assetConfig.assetName) {
        assetParams.set('an', this.assetConfig.assetName);
      }
      if (this.assetConfig.assetURL) {
        assetParams.set('au', this.assetConfig.assetURL);
      }
      if (this.assetConfig.assetMetadataHash) {
        assetParams.set('am', this.assetConfig.assetMetadataHash);
      }
      if (assetParams.size) {
        data.set('apar', assetParams);
      }
      return data;
    }

    if (this.assetTransfer) {
      if (this.assetTransfer.assetIndex) {
        data.set('xaid', this.assetTransfer.assetIndex);
      }
      if (this.assetTransfer.amount) {
        data.set('aamt', this.assetTransfer.amount);
      }
      if (!uint8ArrayIsEmpty(this.assetTransfer.receiver.publicKey)) {
        data.set('arcv', this.assetTransfer.receiver.publicKey);
      }
      if (this.assetTransfer.closeRemainderTo) {
        data.set('aclose', this.assetTransfer.closeRemainderTo.publicKey);
      }
      if (this.assetTransfer.assetSender) {
        data.set('asnd', this.assetTransfer.assetSender.publicKey);
      }
      return data;
    }

    if (this.assetFreeze) {
      if (this.assetFreeze.assetIndex) {
        data.set('faid', this.assetFreeze.assetIndex);
      }
      if (this.assetFreeze.frozen) {
        data.set('afrz', this.assetFreeze.frozen);
      }
      if (!uint8ArrayIsEmpty(this.assetFreeze.freezeAccount.publicKey)) {
        data.set('fadd', this.assetFreeze.freezeAccount.publicKey);
      }
      return data;
    }

    if (this.applicationCall) {
      if (this.applicationCall.appIndex) {
        data.set('apid', this.applicationCall.appIndex);
      }
      if (this.applicationCall.onComplete) {
        data.set('apan', this.applicationCall.onComplete);
      }
      if (this.applicationCall.appArgs.length) {
        data.set('apaa', this.applicationCall.appArgs.slice());
      }
      if (this.applicationCall.accounts.length) {
        data.set(
          'apat',
          this.applicationCall.accounts.map((addr) => addr.publicKey)
        );
      }
      if (this.applicationCall.foreignAssets.length) {
        data.set('apas', this.applicationCall.foreignAssets.slice());
      }
      if (this.applicationCall.foreignApps.length) {
        data.set('apfa', this.applicationCall.foreignApps.slice());
      }
      if (this.applicationCall.boxes.length) {
        data.set(
          'apbx',
          msgpackPrepareBoxReferences(
            this.applicationCall.boxes,
            this.applicationCall.foreignApps,
            this.applicationCall.appIndex
          )
        );
      }
      if (this.applicationCall.approvalProgram.length) {
        data.set('apap', this.applicationCall.approvalProgram);
      }
      if (this.applicationCall.clearProgram.length) {
        data.set('apsu', this.applicationCall.clearProgram);
      }
      if (
        this.applicationCall.numLocalInts ||
        this.applicationCall.numLocalByteSlices
      ) {
        const localSchema: Map<string, number> = new Map();
        if (this.applicationCall.numLocalInts) {
          localSchema.set('nui', this.applicationCall.numLocalInts);
        }
        if (this.applicationCall.numLocalByteSlices) {
          localSchema.set('nbs', this.applicationCall.numLocalByteSlices);
        }
        data.set('apls', localSchema);
      }
      if (
        this.applicationCall.numGlobalInts ||
        this.applicationCall.numGlobalByteSlices
      ) {
        const globalSchema: Map<string, number> = new Map();
        if (this.applicationCall.numGlobalInts) {
          globalSchema.set('nui', this.applicationCall.numGlobalInts);
        }
        if (this.applicationCall.numGlobalByteSlices) {
          globalSchema.set('nbs', this.applicationCall.numGlobalByteSlices);
        }
        data.set('apgs', globalSchema);
      }
      if (this.applicationCall.extraPages) {
        data.set('apep', this.applicationCall.extraPages);
      }
      return data;
    }

    if (this.stateProof) {
      if (this.stateProof.stateProofType) {
        data.set('sptype', this.stateProof.stateProofType);
      }
      data.set('spmsg', this.stateProof.stateProofMessage);
      data.set('sp', this.stateProof.stateProof);
      return data;
    }

    throw new Error(`Unexpected transaction type: ${this.type}`);
  }

  jsonPrepare(): Record<string, encoding.JSONEncodingData> {
    const forEncoding: Record<string, encoding.JSONEncodingData> = {
      type: this.type,
      lv: this.lastValid,
    };
    if (!uint8ArrayIsEmpty(this.sender.publicKey)) {
      forEncoding.snd = this.sender.toString();
    }
    if (this.genesisID) {
      forEncoding.gen = this.genesisID;
    }
    if (this.genesisHash) {
      forEncoding.gh = bytesToBase64(this.genesisHash);
    }
    if (this.fee) {
      forEncoding.fee = this.fee;
    }
    if (this.firstValid) {
      forEncoding.fv = this.firstValid;
    }
    if (this.note.length) {
      forEncoding.note = bytesToBase64(this.note);
    }
    if (this.lease) {
      forEncoding.lx = bytesToBase64(this.lease);
    }
    if (this.rekeyTo) {
      forEncoding.rekey = this.rekeyTo.toString();
    }
    if (this.group.length) {
      forEncoding.grp = bytesToBase64(this.group);
    }

    if (this.payment) {
      if (this.payment.amount) {
        forEncoding.amt = this.payment.amount;
      }
      if (!uint8ArrayIsEmpty(this.payment.receiver.publicKey)) {
        forEncoding.rcv = this.payment.receiver.toString();
      }
      if (this.payment.closeRemainderTo) {
        forEncoding.close = this.payment.closeRemainderTo.toString();
      }
      return forEncoding;
    }

    if (this.keyreg) {
      if (this.keyreg.voteKey) {
        forEncoding.votekey = bytesToBase64(this.keyreg.voteKey);
      }
      if (this.keyreg.selectionKey) {
        forEncoding.selkey = bytesToBase64(this.keyreg.selectionKey);
      }
      if (this.keyreg.stateProofKey) {
        forEncoding.sprfkey = bytesToBase64(this.keyreg.stateProofKey);
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
      const assetParams: Record<string, encoding.JSONEncodingData> = {};
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
        assetParams.m = this.assetConfig.manager.toString();
      }
      if (this.assetConfig.reserve) {
        assetParams.r = this.assetConfig.reserve.toString();
      }
      if (this.assetConfig.freeze) {
        assetParams.f = this.assetConfig.freeze.toString();
      }
      if (this.assetConfig.clawback) {
        assetParams.c = this.assetConfig.clawback.toString();
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
        assetParams.am = bytesToBase64(this.assetConfig.assetMetadataHash);
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
        forEncoding.arcv = this.assetTransfer.receiver.toString();
      }
      if (this.assetTransfer.closeRemainderTo) {
        forEncoding.aclose = this.assetTransfer.closeRemainderTo.toString();
      }
      if (this.assetTransfer.assetSender) {
        forEncoding.asnd = this.assetTransfer.assetSender.toString();
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
        forEncoding.fadd = this.assetFreeze.freezeAccount.toString();
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
        forEncoding.apaa = this.applicationCall.appArgs.map(bytesToBase64);
      }
      if (this.applicationCall.accounts.length) {
        forEncoding.apat = this.applicationCall.accounts.map((decodedAddress) =>
          decodedAddress.toString()
        );
      }
      if (this.applicationCall.foreignAssets.length) {
        forEncoding.apas = this.applicationCall.foreignAssets.slice();
      }
      if (this.applicationCall.foreignApps.length) {
        forEncoding.apfa = this.applicationCall.foreignApps.slice();
      }
      if (this.applicationCall.boxes.length) {
        forEncoding.apbx = jsonPrepareBoxReferences(
          this.applicationCall.boxes,
          this.applicationCall.foreignApps,
          this.applicationCall.appIndex
        );
      }
      if (this.applicationCall.approvalProgram.length) {
        forEncoding.apap = bytesToBase64(this.applicationCall.approvalProgram);
      }
      if (this.applicationCall.clearProgram.length) {
        forEncoding.apsu = bytesToBase64(this.applicationCall.clearProgram);
      }
      if (
        this.applicationCall.numLocalInts ||
        this.applicationCall.numLocalByteSlices
      ) {
        const localSchema: Record<string, number> = {};
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
        const globalSchema: Record<string, number> = {};
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
      forEncoding.spmsg = this.stateProof.stateProofMessage as any; // TODO
      forEncoding.sp = this.stateProof.stateProof as any; // TODO
      return forEncoding;
    }

    throw new Error(`Unexpected transaction type: ${this.type}`);
  }

  static fromDecodedJSON(data: unknown): Transaction {
    if (data === null || typeof data !== 'object') {
      throw new Error(`Invalid decoded Transaction: ${data}`);
    }
    const txnForEnc = data as Record<string, any>;
    const suggestedParams: SuggestedParams = {
      minFee: BigInt(0),
      flatFee: true,
      fee: txnForEnc.fee ?? 0,
      firstValid: txnForEnc.fv ?? 0,
      lastValid: txnForEnc.lv,
      genesisHash: txnForEnc.gh ? base64ToBytes(txnForEnc.gh) : undefined,
      genesisID: txnForEnc.gen,
    };

    if (!isTransactionType(txnForEnc.type)) {
      throw new Error(`Unrecognized transaction type: ${txnForEnc.type}`);
    }

    const params: TransactionParams = {
      type: txnForEnc.type,
      sender: txnForEnc.snd
        ? Address.fromString(txnForEnc.snd)
        : Address.zeroAddress(),
      suggestedParams,
    };

    if (txnForEnc.note) {
      params.note = base64ToBytes(txnForEnc.note);
    }

    if (txnForEnc.lx) {
      params.lease = base64ToBytes(txnForEnc.lx);
    }

    if (txnForEnc.rekey) {
      params.rekeyTo = Address.fromString(txnForEnc.rekey);
    }

    if (params.type === TransactionType.pay) {
      const paymentParams: PaymentTransactionParams = {
        amount: txnForEnc.amt ?? 0,
        receiver: txnForEnc.rcv
          ? Address.fromString(txnForEnc.rcv)
          : Address.zeroAddress(),
      };
      if (txnForEnc.close) {
        paymentParams.closeRemainderTo = Address.fromString(txnForEnc.close);
      }
      params.paymentParams = paymentParams;
    } else if (params.type === TransactionType.keyreg) {
      const keyregParams: KeyRegistrationTransactionParams = {
        voteKey: txnForEnc.votekey
          ? base64ToBytes(txnForEnc.votekey)
          : undefined,
        selectionKey: txnForEnc.selkey
          ? base64ToBytes(txnForEnc.selkey)
          : undefined,
        stateProofKey: txnForEnc.sprfkey
          ? base64ToBytes(txnForEnc.sprfkey)
          : undefined,
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
        if (txnForEnc.apar.am) {
          assetConfigParams.assetMetadataHash = base64ToBytes(
            txnForEnc.apar.am
          );
        }
        if (txnForEnc.apar.m) {
          assetConfigParams.manager = Address.fromString(txnForEnc.apar.m);
        }
        if (txnForEnc.apar.r) {
          assetConfigParams.reserve = Address.fromString(txnForEnc.apar.r);
        }
        if (txnForEnc.apar.f) {
          assetConfigParams.freeze = Address.fromString(txnForEnc.apar.f);
        }
        if (txnForEnc.apar.c) {
          assetConfigParams.clawback = Address.fromString(txnForEnc.apar.c);
        }
      }
      params.assetConfigParams = assetConfigParams;
    } else if (params.type === TransactionType.axfer) {
      const assetTransferParams: AssetTransferTransactionParams = {
        assetIndex: txnForEnc.xaid ?? 0,
        amount: txnForEnc.aamt ?? 0,
        receiver: txnForEnc.arcv
          ? Address.fromString(txnForEnc.arcv)
          : Address.zeroAddress(),
      };
      if (txnForEnc.aclose) {
        assetTransferParams.closeRemainderTo = Address.fromString(
          txnForEnc.aclose
        );
      }
      if (txnForEnc.asnd) {
        assetTransferParams.assetSender = Address.fromString(txnForEnc.asnd);
      }
      params.assetTransferParams = assetTransferParams;
    } else if (params.type === TransactionType.afrz) {
      const assetFreezeParams: AssetFreezeTransactionParams = {
        assetIndex: txnForEnc.faid ?? 0,
        freezeTarget: txnForEnc.fadd
          ? Address.fromString(txnForEnc.fadd)
          : Address.zeroAddress(),
        frozen: txnForEnc.afrz ?? false,
      };
      params.assetFreezeParams = assetFreezeParams;
    } else if (params.type === TransactionType.appl) {
      const appCallParams: ApplicationCallTransactionParams = {
        appIndex: txnForEnc.apid ?? 0,
        onComplete: utils.ensureSafeUnsignedInteger(txnForEnc.apan ?? 0),
        appArgs: (txnForEnc.apaa ?? []).map(base64ToBytes),
        accounts: (txnForEnc.apat ?? []).map(Address.fromString),
        foreignAssets: txnForEnc.apas,
        foreignApps: txnForEnc.apfa,
        numLocalInts: txnForEnc.apls?.nui,
        numLocalByteSlices: txnForEnc.apls?.nbs,
        numGlobalInts: txnForEnc.apgs?.nui,
        numGlobalByteSlices: txnForEnc.apgs?.nbs,
        extraPages: txnForEnc.apep,
      };
      if (txnForEnc.apap) {
        appCallParams.approvalProgram = base64ToBytes(txnForEnc.apap);
      }
      if (txnForEnc.apsu) {
        appCallParams.clearProgram = base64ToBytes(txnForEnc.apsu);
      }
      if (txnForEnc.apbx) {
        appCallParams.boxes = txnForEnc.apbx.map((box: Record<string, any>) => {
          const index = utils.ensureSafeUnsignedInteger(box.i ?? 0);
          const name = box.n ? base64ToBytes(box.n) : new Uint8Array();
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
      const group = base64ToBytes(txnForEnc.grp);
      if (group.byteLength !== ALGORAND_TRANSACTION_GROUP_LENGTH) {
        throw new Error(`Invalid group length: ${group.byteLength}`);
      }
      txn.group = group;
    }

    return txn;
  }

  static fromDecodedMsgpack(data: unknown) {
    if (!(data instanceof Map)) {
      throw new Error(`Invalid decoded logic sig account: ${data}`);
    }
    const suggestedParams: SuggestedParams = {
      minFee: BigInt(0),
      flatFee: true,
      fee: data.get('fee') ?? 0,
      firstValid: data.get('fv') ?? 0,
      lastValid: data.get('lv') ?? 0,
      genesisHash: data.get('gh'),
      genesisID: data.get('gen'),
    };

    const txnType = data.get('type');
    if (!isTransactionType(txnType)) {
      throw new Error(`Unrecognized transaction type: ${txnType}`);
    }

    const params: TransactionParams = {
      type: txnType,
      sender: data.get('snd')
        ? new Address(data.get('snd'))
        : Address.zeroAddress(),
      note: data.get('note'),
      lease: data.get('lx'),
      suggestedParams,
    };

    if (data.get('rekey')) {
      params.rekeyTo = new Address(data.get('rekey'));
    }

    if (params.type === TransactionType.pay) {
      const paymentParams: PaymentTransactionParams = {
        amount: data.get('amt') ?? 0,
        receiver: data.get('rcv')
          ? new Address(data.get('rcv'))
          : Address.zeroAddress(),
      };
      if (data.get('close')) {
        paymentParams.closeRemainderTo = new Address(data.get('close'));
      }
      params.paymentParams = paymentParams;
    } else if (params.type === TransactionType.keyreg) {
      const keyregParams: KeyRegistrationTransactionParams = {
        voteKey: data.get('votekey'),
        selectionKey: data.get('selkey'),
        stateProofKey: data.get('sprfkey'),
        voteFirst: data.get('votefst'),
        voteLast: data.get('votelst'),
        voteKeyDilution: data.get('votekd'),
        nonParticipation: data.get('nonpart'),
      };
      params.keyregParams = keyregParams;
    } else if (params.type === TransactionType.acfg) {
      const assetConfigParams: AssetConfigurationTransactionParams = {
        assetIndex: data.get('caid'),
      };
      if (data.has('apar')) {
        const assetParams = data.get('apar') as Map<string, any>;
        assetConfigParams.total = assetParams.get('t');
        assetConfigParams.decimals = assetParams.get('dc');
        assetConfigParams.defaultFrozen = assetParams.get('df');
        assetConfigParams.unitName = assetParams.get('un');
        assetConfigParams.assetName = assetParams.get('an');
        assetConfigParams.assetURL = assetParams.get('au');
        assetConfigParams.assetMetadataHash = assetParams.get('am');
        if (assetParams.get('m')) {
          assetConfigParams.manager = new Address(assetParams.get('m'));
        }
        if (assetParams.get('r')) {
          assetConfigParams.reserve = new Address(assetParams.get('r'));
        }
        if (assetParams.get('f')) {
          assetConfigParams.freeze = new Address(assetParams.get('f'));
        }
        if (assetParams.get('c')) {
          assetConfigParams.clawback = new Address(assetParams.get('c'));
        }
      }
      params.assetConfigParams = assetConfigParams;
    } else if (params.type === TransactionType.axfer) {
      const assetTransferParams: AssetTransferTransactionParams = {
        assetIndex: data.get('xaid') ?? 0,
        amount: data.get('aamt') ?? 0,
        receiver: data.get('arcv')
          ? new Address(data.get('arcv'))
          : Address.zeroAddress(),
      };
      if (data.get('aclose')) {
        assetTransferParams.closeRemainderTo = new Address(data.get('aclose'));
      }
      if (data.get('asnd')) {
        assetTransferParams.assetSender = new Address(data.get('asnd'));
      }
      params.assetTransferParams = assetTransferParams;
    } else if (params.type === TransactionType.afrz) {
      const assetFreezeParams: AssetFreezeTransactionParams = {
        assetIndex: data.get('faid') ?? 0,
        freezeTarget: data.get('fadd')
          ? new Address(data.get('fadd'))
          : Address.zeroAddress(),
        frozen: data.get('afrz') ?? false,
      };
      params.assetFreezeParams = assetFreezeParams;
    } else if (params.type === TransactionType.appl) {
      const appCallParams: ApplicationCallTransactionParams = {
        appIndex: data.get('apid') ?? 0,
        onComplete: utils.ensureSafeUnsignedInteger(data.get('apan') ?? 0),
        appArgs: data.get('apaa'),
        accounts: (data.get('apat') ?? []).map(
          (pk: Uint8Array) => new Address(pk)
        ),
        foreignAssets: data.get('apas'),
        foreignApps: data.get('apfa'),
        approvalProgram: data.get('apap'),
        clearProgram: data.get('apsu'),
        extraPages: data.get('apep'),
      };
      const localSchema = data.get('apls') as Map<string, number> | undefined;
      if (localSchema) {
        appCallParams.numLocalInts = localSchema.get('nui');
        appCallParams.numLocalByteSlices = localSchema.get('nbs');
      }
      const globalSchema = data.get('apgs') as Map<string, number> | undefined;
      if (globalSchema) {
        appCallParams.numGlobalInts = globalSchema.get('nui');
        appCallParams.numGlobalByteSlices = globalSchema.get('nbs');
      }
      const boxes = data.get('apbx') as Array<Map<string, unknown>> | undefined;
      if (boxes) {
        appCallParams.boxes = boxes.map((box) => {
          const index = utils.ensureSafeUnsignedInteger(box.get('i') ?? 0);
          const name = ensureUint8Array(box.get('n') ?? new Uint8Array());
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
        stateProofType: data.get('sptype'),
        stateProof: data.get('sp'),
        stateProofMessage: data.get('spmsg'),
      };
      params.stateProofParams = stateProofParams;
    } else {
      const exhaustiveCheck: never = params.type;
      throw new Error(`Unexpected transaction type: ${exhaustiveCheck}`);
    }

    const txn = new Transaction(params);

    if (data.get('grp')) {
      const group = ensureUint8Array(data.get('grp'));
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
    return encoding.encodeMsgpack(this);
  }

  // returns the raw signature
  rawSignTxn(sk: Uint8Array): Uint8Array {
    const toBeSigned = this.bytesToSign();
    const sig = nacl.sign(toBeSigned, sk);
    return sig;
  }

  signTxn(sk: Uint8Array): Uint8Array {
    // TODO: deprecate in favor of SignedTransaction class
    const keypair = nacl.keyPairFromSecretKey(sk);
    const signerAddr = new Address(keypair.publicKey);
    const sig = this.rawSignTxn(sk);
    return this.attachSignature(signerAddr, sig);
  }

  attachSignature(
    signerAddr: string | Address,
    signature: Uint8Array
  ): Uint8Array {
    // TODO: deprecate in favor of SignedTransaction class
    if (!nacl.isValidSignatureLength(signature.length)) {
      throw new Error('Invalid signature length');
    }
    const sTxn = new Map<string, encoding.MsgpackEncodingData>([
      ['sig', signature],
      ['txn', this.msgpackPrepare()],
    ]);
    const signerAddrObj = ensureAddress(signerAddr);
    // add AuthAddr if signing with a different key than From indicates
    if (!this.sender.equals(signerAddrObj)) {
      sTxn.set('sgnr', signerAddrObj.publicKey);
    }
    return encoding.rawEncode(sTxn);
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
 * encodeUnsignedTransaction takes a completed txnBuilder.Transaction object, such as from the makeFoo
 * family of transactions, and converts it to a Buffer
 * @param transactionObject - the completed Transaction object
 */
export function encodeUnsignedTransaction(
  transactionObject: Transaction
): Uint8Array {
  return encoding.encodeMsgpack(transactionObject);
}

/**
 * decodeUnsignedTransaction takes a Uint8Array (as if from encodeUnsignedTransaction) and converts it to a txnBuilder.Transaction object
 * @param transactionBuffer - the Uint8Array containing a transaction
 */
export function decodeUnsignedTransaction(
  transactionBuffer: ArrayLike<number>
): Transaction {
  return encoding.decodeMsgpack(transactionBuffer, Transaction);
}
