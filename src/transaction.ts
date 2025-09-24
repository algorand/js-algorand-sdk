import base32 from 'hi-base32';
import { boxReferencesToEncodingData } from './boxStorage.js';
import {
  resourceReferencesToEncodingData,
  convertIndicesToResourceReferences,
} from './appAccess.js';
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
  OptionalSchema,
  allOmitEmpty,
} from './encoding/schema/index.js';
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
  HeartbeatTransactionParams,
} from './types/transactions/base.js';
import { StateProof, StateProofMessage } from './stateproof.js';
import { Heartbeat, HeartbeatProof } from './heartbeat.js';
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

export interface TransactionHoldingReference {
  readonly assetIndex: bigint;
  readonly address: Address;
}

function ensureHoldingReference(input: unknown): TransactionHoldingReference {
  if (input != null && typeof input === 'object') {
    const { assetIndex, address } = input as TransactionHoldingReference;
    return {
      assetIndex: utils.ensureUint64(assetIndex),
      address: ensureAddress(address),
    };
  }
  throw new Error(`Not a holding reference: ${input}`);
}

export interface TransactionLocalsReference {
  readonly appIndex: bigint;
  readonly address: Address;
}

function ensureLocalsReference(input: unknown): TransactionLocalsReference {
  if (input != null && typeof input === 'object') {
    const { appIndex, address } = input as TransactionLocalsReference;
    return {
      appIndex: utils.ensureUint64(appIndex),
      address: ensureAddress(address),
    };
  }
  throw new Error(`Not a locals reference: ${input}`);
}

export interface TransactionResourceReference {
  readonly address?: Readonly<Address>;
  readonly appIndex?: Readonly<bigint>;
  readonly assetIndex?: Readonly<bigint>;
  readonly holding?: Readonly<TransactionHoldingReference>;
  readonly locals?: Readonly<TransactionLocalsReference>;
  readonly box?: Readonly<TransactionBoxReference>;
}

function ensureResourceReference(input: unknown): TransactionResourceReference {
  if (input != null && typeof input === 'object') {
    const { address, appIndex, assetIndex, holding, locals, box } =
      input as TransactionResourceReference;
    if (address !== undefined) {
      return { address: ensureAddress(address) };
    }
    if (appIndex !== undefined) {
      return { appIndex: utils.ensureUint64(appIndex) };
    }
    if (assetIndex !== undefined) {
      return { assetIndex: utils.ensureUint64(assetIndex) };
    }
    if (holding !== undefined) {
      return { holding: ensureHoldingReference(holding) };
    }
    if (locals !== undefined) {
      return { locals: ensureLocalsReference(locals) };
    }
    if (box !== undefined) {
      return { box: ensureBoxReference(box) };
    }
  }
  throw new Error(`Not a resource reference: ${input}`);
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
  readonly access: ReadonlyArray<TransactionResourceReference>;
  readonly rejectVersion: number;
}

export interface StateProofTransactionFields {
  readonly stateProofType: number;
  readonly stateProof?: StateProof;
  readonly message?: StateProofMessage;
}

export interface HeartbeatTransactionFields {
  readonly address: Address;
  readonly proof: HeartbeatProof;
  readonly seed: Uint8Array;
  readonly voteID: Uint8Array;
  readonly keyDilution: bigint;
}

/**
 * Transaction enables construction of Algorand transactions
 * */
export class Transaction implements encoding.Encodable {
  static readonly encodingSchema = new NamedMapSchema(
    allOmitEmpty([
      // Common
      { key: 'type', valueSchema: new StringSchema() },
      { key: 'snd', valueSchema: new AddressSchema() },
      { key: 'lv', valueSchema: new Uint64Schema() },
      { key: 'gen', valueSchema: new OptionalSchema(new StringSchema()) },
      {
        key: 'gh',
        valueSchema: new OptionalSchema(new FixedLengthByteArraySchema(32)),
      },
      { key: 'fee', valueSchema: new Uint64Schema() },
      { key: 'fv', valueSchema: new Uint64Schema() },
      { key: 'note', valueSchema: new ByteArraySchema() },
      {
        key: 'lx',
        valueSchema: new OptionalSchema(new FixedLengthByteArraySchema(32)),
      },
      { key: 'rekey', valueSchema: new OptionalSchema(new AddressSchema()) },
      {
        key: 'grp',
        valueSchema: new OptionalSchema(new FixedLengthByteArraySchema(32)),
      },
      // We mark all top-level type-specific fields optional because they will not be present when
      // the transaction is not that type.
      // Payment
      { key: 'amt', valueSchema: new OptionalSchema(new Uint64Schema()) },
      { key: 'rcv', valueSchema: new OptionalSchema(new AddressSchema()) },
      { key: 'close', valueSchema: new OptionalSchema(new AddressSchema()) },
      // Keyreg
      {
        key: 'votekey',
        valueSchema: new OptionalSchema(new FixedLengthByteArraySchema(32)),
      },
      {
        key: 'selkey',
        valueSchema: new OptionalSchema(new FixedLengthByteArraySchema(32)),
      },
      {
        key: 'sprfkey',
        valueSchema: new OptionalSchema(new FixedLengthByteArraySchema(64)),
      },
      { key: 'votefst', valueSchema: new OptionalSchema(new Uint64Schema()) },
      { key: 'votelst', valueSchema: new OptionalSchema(new Uint64Schema()) },
      { key: 'votekd', valueSchema: new OptionalSchema(new Uint64Schema()) },
      { key: 'nonpart', valueSchema: new OptionalSchema(new BooleanSchema()) },
      // AssetConfig
      { key: 'caid', valueSchema: new OptionalSchema(new Uint64Schema()) },
      {
        key: 'apar',
        valueSchema: new OptionalSchema(
          new NamedMapSchema(
            allOmitEmpty([
              { key: 't', valueSchema: new Uint64Schema() },
              { key: 'dc', valueSchema: new Uint64Schema() },
              { key: 'df', valueSchema: new BooleanSchema() },
              {
                key: 'm',
                valueSchema: new OptionalSchema(new AddressSchema()),
              },
              {
                key: 'r',
                valueSchema: new OptionalSchema(new AddressSchema()),
              },
              {
                key: 'f',
                valueSchema: new OptionalSchema(new AddressSchema()),
              },
              {
                key: 'c',
                valueSchema: new OptionalSchema(new AddressSchema()),
              },
              {
                key: 'un',
                valueSchema: new OptionalSchema(new StringSchema()),
              },
              {
                key: 'an',
                valueSchema: new OptionalSchema(new StringSchema()),
              },
              {
                key: 'au',
                valueSchema: new OptionalSchema(new StringSchema()),
              },
              {
                key: 'am',
                valueSchema: new OptionalSchema(
                  new FixedLengthByteArraySchema(32)
                ),
              },
            ])
          )
        ),
      },
      // AssetTransfer
      { key: 'xaid', valueSchema: new OptionalSchema(new Uint64Schema()) },
      { key: 'aamt', valueSchema: new OptionalSchema(new Uint64Schema()) },
      { key: 'arcv', valueSchema: new OptionalSchema(new AddressSchema()) },
      { key: 'aclose', valueSchema: new OptionalSchema(new AddressSchema()) },
      { key: 'asnd', valueSchema: new OptionalSchema(new AddressSchema()) },
      // AssetFreeze
      { key: 'faid', valueSchema: new OptionalSchema(new Uint64Schema()) },
      { key: 'afrz', valueSchema: new OptionalSchema(new BooleanSchema()) },
      { key: 'fadd', valueSchema: new OptionalSchema(new AddressSchema()) },
      // Application
      { key: 'apid', valueSchema: new OptionalSchema(new Uint64Schema()) },
      { key: 'apan', valueSchema: new OptionalSchema(new Uint64Schema()) },
      {
        key: 'apaa',
        valueSchema: new OptionalSchema(new ArraySchema(new ByteArraySchema())),
      },
      {
        key: 'apat',
        valueSchema: new OptionalSchema(new ArraySchema(new AddressSchema())),
      },
      {
        key: 'apas',
        valueSchema: new OptionalSchema(new ArraySchema(new Uint64Schema())),
      },
      {
        key: 'apfa',
        valueSchema: new OptionalSchema(new ArraySchema(new Uint64Schema())),
      },
      {
        key: 'apbx',
        valueSchema: new OptionalSchema(
          new ArraySchema(
            new NamedMapSchema(
              allOmitEmpty([
                {
                  key: 'i',
                  valueSchema: new Uint64Schema(),
                },
                {
                  key: 'n',
                  valueSchema: new ByteArraySchema(),
                },
              ])
            )
          )
        ),
      },
      {
        key: 'al',
        valueSchema: new OptionalSchema(
          new ArraySchema(
            new NamedMapSchema(
              allOmitEmpty([
                {
                  key: 'd',
                  valueSchema: new OptionalSchema(new AddressSchema()),
                },
                {
                  key: 's',
                  valueSchema: new OptionalSchema(new Uint64Schema()),
                },
                {
                  key: 'p',
                  valueSchema: new OptionalSchema(new Uint64Schema()),
                },
                {
                  key: 'h',
                  valueSchema: new OptionalSchema(
                    new NamedMapSchema(
                      allOmitEmpty([
                        {
                          key: 'd',
                          valueSchema: new Uint64Schema(),
                        },
                        {
                          key: 's',
                          valueSchema: new Uint64Schema(),
                        },
                      ])
                    )
                  ),
                },
                {
                  key: 'l',
                  valueSchema: new OptionalSchema(
                    new NamedMapSchema(
                      allOmitEmpty([
                        {
                          key: 'd',
                          valueSchema: new Uint64Schema(),
                        },
                        {
                          key: 'p',
                          valueSchema: new Uint64Schema(),
                        },
                      ])
                    )
                  ),
                },
                {
                  key: 'b',
                  valueSchema: new OptionalSchema(
                    new NamedMapSchema(
                      allOmitEmpty([
                        {
                          key: 'i',
                          valueSchema: new Uint64Schema(),
                        },
                        {
                          key: 'n',
                          valueSchema: new ByteArraySchema(),
                        },
                      ])
                    )
                  ),
                },
              ])
            )
          )
        ),
      },
      { key: 'apap', valueSchema: new OptionalSchema(new ByteArraySchema()) },
      { key: 'apsu', valueSchema: new OptionalSchema(new ByteArraySchema()) },
      {
        key: 'apls',
        valueSchema: new OptionalSchema(
          new NamedMapSchema(
            allOmitEmpty([
              {
                key: 'nui',
                valueSchema: new Uint64Schema(),
              },
              {
                key: 'nbs',
                valueSchema: new Uint64Schema(),
              },
            ])
          )
        ),
      },
      {
        key: 'apgs',
        valueSchema: new OptionalSchema(
          new NamedMapSchema(
            allOmitEmpty([
              {
                key: 'nui',
                valueSchema: new Uint64Schema(),
              },
              {
                key: 'nbs',
                valueSchema: new Uint64Schema(),
              },
            ])
          )
        ),
      },
      { key: 'apep', valueSchema: new OptionalSchema(new Uint64Schema()) },
      { key: 'aprv', valueSchema: new OptionalSchema(new Uint64Schema()) },
      // StateProof
      { key: 'sptype', valueSchema: new OptionalSchema(new Uint64Schema()) },
      { key: 'sp', valueSchema: new OptionalSchema(StateProof.encodingSchema) },
      {
        key: 'spmsg',
        valueSchema: new OptionalSchema(StateProofMessage.encodingSchema),
      },
      // Heartbeat
      { key: 'hb', valueSchema: new OptionalSchema(Heartbeat.encodingSchema) },
    ])
  );

  /** common */
  public readonly type: TransactionType;
  public readonly sender: Address;
  public readonly note: Uint8Array;
  public readonly lease?: Uint8Array;
  public readonly rekeyTo?: Address;

  /** group */
  public group?: Uint8Array;

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
  public readonly heartbeat?: HeartbeatTransactionFields;

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
    this.group = undefined;

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
    if (params.heartbeatParams) fieldsPresent.push(TransactionType.hb);

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
        unitName: params.assetConfigParams.unitName,
        assetName: params.assetConfigParams.assetName,
        assetURL: params.assetConfigParams.assetURL,
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
        access: ensureArray(params.appCallParams.access ?? []).map(
          ensureResourceReference
        ),
        rejectVersion: utils.ensureSafeUnsignedInteger(
          params.appCallParams.rejectVersion ?? 0
        ),
      };
    }

    if (params.stateProofParams) {
      this.stateProof = {
        stateProofType: utils.ensureSafeUnsignedInteger(
          params.stateProofParams.stateProofType ?? 0
        ),
        stateProof: params.stateProofParams.stateProof,
        message: params.stateProofParams.message,
      };
    }

    if (params.heartbeatParams) {
      this.heartbeat = new Heartbeat({
        address: params.heartbeatParams.address,
        proof: params.heartbeatParams.proof,
        seed: params.heartbeatParams.seed,
        voteID: params.heartbeatParams.voteID,
        keyDilution: params.heartbeatParams.keyDilution,
      });
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

  // eslint-disable-next-line class-methods-use-this
  getEncodingSchema(): encoding.Schema {
    return Transaction.encodingSchema;
  }

  toEncodingData(): Map<string, unknown> {
    const data = new Map<string, unknown>([
      ['type', this.type],
      ['fv', this.firstValid],
      ['lv', this.lastValid],
      ['snd', this.sender],
      ['gen', this.genesisID],
      ['gh', this.genesisHash],
      ['fee', this.fee],
      ['note', this.note],
      ['lx', this.lease],
      ['rekey', this.rekeyTo],
      ['grp', this.group],
    ]);

    if (this.payment) {
      data.set('amt', this.payment.amount);
      data.set('rcv', this.payment.receiver);
      data.set('close', this.payment.closeRemainderTo);
      return data;
    }

    if (this.keyreg) {
      data.set('votekey', this.keyreg.voteKey);
      data.set('selkey', this.keyreg.selectionKey);
      data.set('sprfkey', this.keyreg.stateProofKey);
      data.set('votefst', this.keyreg.voteFirst);
      data.set('votelst', this.keyreg.voteLast);
      data.set('votekd', this.keyreg.voteKeyDilution);
      data.set('nonpart', this.keyreg.nonParticipation);
      return data;
    }

    if (this.assetConfig) {
      data.set('caid', this.assetConfig.assetIndex);
      const assetParams = new Map<string, unknown>([
        ['t', this.assetConfig.total],
        ['dc', this.assetConfig.decimals],
        ['df', this.assetConfig.defaultFrozen],
        ['m', this.assetConfig.manager],
        ['r', this.assetConfig.reserve],
        ['f', this.assetConfig.freeze],
        ['c', this.assetConfig.clawback],
        ['un', this.assetConfig.unitName],
        ['an', this.assetConfig.assetName],
        ['au', this.assetConfig.assetURL],
        ['am', this.assetConfig.assetMetadataHash],
      ]);
      data.set('apar', assetParams);
      return data;
    }

    if (this.assetTransfer) {
      data.set('xaid', this.assetTransfer.assetIndex);
      data.set('aamt', this.assetTransfer.amount);
      data.set('arcv', this.assetTransfer.receiver);
      data.set('aclose', this.assetTransfer.closeRemainderTo);
      data.set('asnd', this.assetTransfer.assetSender);
      return data;
    }

    if (this.assetFreeze) {
      data.set('faid', this.assetFreeze.assetIndex);
      data.set('afrz', this.assetFreeze.frozen);
      data.set('fadd', this.assetFreeze.freezeAccount);
      return data;
    }

    if (this.applicationCall) {
      data.set('apid', this.applicationCall.appIndex);
      data.set('apan', this.applicationCall.onComplete);
      data.set('apaa', this.applicationCall.appArgs);
      data.set('apat', this.applicationCall.accounts);
      data.set('apas', this.applicationCall.foreignAssets);
      data.set('apfa', this.applicationCall.foreignApps);
      data.set(
        'apbx',
        boxReferencesToEncodingData(
          this.applicationCall.boxes,
          this.applicationCall.foreignApps,
          this.applicationCall.appIndex
        )
      );
      data.set(
        'al',
        resourceReferencesToEncodingData(
          this.applicationCall.appIndex,
          this.applicationCall.access
        )
      );
      data.set('apap', this.applicationCall.approvalProgram);
      data.set('apsu', this.applicationCall.clearProgram);
      data.set(
        'apls',
        new Map<string, number>([
          ['nui', this.applicationCall.numLocalInts],
          ['nbs', this.applicationCall.numLocalByteSlices],
        ])
      );
      data.set(
        'apgs',
        new Map<string, number>([
          ['nui', this.applicationCall.numGlobalInts],
          ['nbs', this.applicationCall.numGlobalByteSlices],
        ])
      );
      data.set('apep', this.applicationCall.extraPages);
      data.set('aprv', this.applicationCall.rejectVersion);
      return data;
    }

    if (this.stateProof) {
      data.set('sptype', this.stateProof.stateProofType);
      data.set(
        'sp',
        this.stateProof.stateProof
          ? this.stateProof.stateProof.toEncodingData()
          : undefined
      );
      data.set(
        'spmsg',
        this.stateProof.message
          ? this.stateProof.message.toEncodingData()
          : undefined
      );
      return data;
    }

    if (this.heartbeat) {
      const heartbeat = new Heartbeat({
        address: this.heartbeat.address,
        proof: this.heartbeat.proof,
        seed: this.heartbeat.seed,
        voteID: this.heartbeat.voteID,
        keyDilution: this.heartbeat.keyDilution,
      });
      data.set('hb', heartbeat.toEncodingData());
      return data;
    }

    throw new Error(`Unexpected transaction type: ${this.type}`);
  }

  static fromEncodingData(data: unknown): Transaction {
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
      sender: data.get('snd') ?? Address.zeroAddress(),
      note: data.get('note'),
      lease: data.get('lx'),
      suggestedParams,
    };

    if (data.get('rekey')) {
      params.rekeyTo = data.get('rekey');
    }

    if (params.type === TransactionType.pay) {
      const paymentParams: PaymentTransactionParams = {
        amount: data.get('amt') ?? 0,
        receiver: data.get('rcv') ?? Address.zeroAddress(),
      };
      if (data.get('close')) {
        paymentParams.closeRemainderTo = data.get('close');
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
      if (data.get('apar')) {
        const assetParams = data.get('apar') as Map<string, any>;
        assetConfigParams.total = assetParams.get('t');
        assetConfigParams.decimals = assetParams.get('dc');
        assetConfigParams.defaultFrozen = assetParams.get('df');
        assetConfigParams.unitName = assetParams.get('un');
        assetConfigParams.assetName = assetParams.get('an');
        assetConfigParams.assetURL = assetParams.get('au');
        assetConfigParams.assetMetadataHash = assetParams.get('am');
        if (assetParams.get('m')) {
          assetConfigParams.manager = assetParams.get('m');
        }
        if (assetParams.get('r')) {
          assetConfigParams.reserve = assetParams.get('r');
        }
        if (assetParams.get('f')) {
          assetConfigParams.freeze = assetParams.get('f');
        }
        if (assetParams.get('c')) {
          assetConfigParams.clawback = assetParams.get('c');
        }
      }
      params.assetConfigParams = assetConfigParams;
    } else if (params.type === TransactionType.axfer) {
      const assetTransferParams: AssetTransferTransactionParams = {
        assetIndex: data.get('xaid') ?? 0,
        amount: data.get('aamt') ?? 0,
        receiver: data.get('arcv') ?? Address.zeroAddress(),
      };
      if (data.get('aclose')) {
        assetTransferParams.closeRemainderTo = data.get('aclose');
      }
      if (data.get('asnd')) {
        assetTransferParams.assetSender = data.get('asnd');
      }
      params.assetTransferParams = assetTransferParams;
    } else if (params.type === TransactionType.afrz) {
      const assetFreezeParams: AssetFreezeTransactionParams = {
        assetIndex: data.get('faid') ?? 0,
        freezeTarget: data.get('fadd') ?? Address.zeroAddress(),
        frozen: data.get('afrz') ?? false,
      };
      params.assetFreezeParams = assetFreezeParams;
    } else if (params.type === TransactionType.appl) {
      const appCallParams: ApplicationCallTransactionParams = {
        appIndex: data.get('apid') ?? 0,
        onComplete: utils.ensureSafeUnsignedInteger(data.get('apan') ?? 0),
        appArgs: data.get('apaa'),
        accounts: data.get('apat'),
        foreignAssets: data.get('apas'),
        foreignApps: data.get('apfa'),
        approvalProgram: data.get('apap'),
        clearProgram: data.get('apsu'),
        extraPages: data.get('apep'),
        rejectVersion: data.get('aprv') ?? 0,
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
      const references = data.get('al') as
        | Array<Map<string, unknown>>
        | undefined;
      if (references) {
        appCallParams.access = convertIndicesToResourceReferences(references);
      }
      params.appCallParams = appCallParams;
    } else if (params.type === TransactionType.stpf) {
      const stateProofParams: StateProofTransactionParams = {
        stateProofType: data.get('sptype'),
        stateProof: data.get('sp')
          ? StateProof.fromEncodingData(data.get('sp'))
          : undefined,
        message: data.get('spmsg')
          ? StateProofMessage.fromEncodingData(data.get('spmsg'))
          : undefined,
      };
      params.stateProofParams = stateProofParams;
    } else if (params.type === TransactionType.hb) {
      const heartbeat = Heartbeat.fromEncodingData(data.get('hb'));
      const heartbeatParams: HeartbeatTransactionParams = {
        address: heartbeat.address,
        proof: heartbeat.proof,
        seed: heartbeat.seed,
        voteID: heartbeat.voteID,
        keyDilution: heartbeat.keyDilution,
      };
      params.heartbeatParams = heartbeatParams;
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
    const sTxn = new Map<string, unknown>([
      ['sig', signature],
      ['txn', this.toEncodingData()],
    ]);
    const signerAddrObj = ensureAddress(signerAddr);
    // add AuthAddr if signing with a different key than From indicates
    if (!this.sender.equals(signerAddrObj)) {
      sTxn.set('sgnr', signerAddrObj);
    }

    // This is a hack to avoid a circular reference with the SignedTransaction class
    const stxnSchema = new NamedMapSchema(
      allOmitEmpty([
        {
          key: 'txn',
          valueSchema: Transaction.encodingSchema,
        },
        {
          key: 'sig',
          valueSchema: new FixedLengthByteArraySchema(64),
        },
        {
          key: 'sgnr',
          valueSchema: new OptionalSchema(new AddressSchema()),
        },
      ])
    );

    return encoding.msgpackRawEncode(stxnSchema.prepareMsgpack(sTxn));
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
