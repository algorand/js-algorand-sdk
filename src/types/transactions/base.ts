import { Address } from '../../encoding/address.js';
import { StateProof, StateProofMessage } from '../../stateproof.js';

/**
 * Enum for application transaction types.
 */
export enum TransactionType {
  /**
   * Payment transaction
   */
  pay = 'pay',

  /**
   * Key registration transaction
   */
  keyreg = 'keyreg',

  /**
   * Asset configuration transaction
   */
  acfg = 'acfg',

  /**
   * Asset transfer transaction
   */
  axfer = 'axfer',

  /**
   * Asset freeze transaction
   */
  afrz = 'afrz',

  /**
   * Application transaction
   */
  appl = 'appl',
  /**
   * State proof transaction
   */
  stpf = 'stpf',
}

/**
 * Check if a string is a valid transaction type
 * @param s - string to check
 * @returns true if s is a valid transaction type
 */
export function isTransactionType(s: string): s is TransactionType {
  return (
    s === TransactionType.pay ||
    s === TransactionType.keyreg ||
    s === TransactionType.acfg ||
    s === TransactionType.axfer ||
    s === TransactionType.afrz ||
    s === TransactionType.appl ||
    s === TransactionType.stpf
  );
}

/**
 * Enums for application transactions on-transaction-complete behavior
 */
export enum OnApplicationComplete {
  /**
   * NoOpOC indicates that an application transaction will simply call its
   * ApprovalProgram
   */
  NoOpOC,

  /**
   * OptInOC indicates that an application transaction will allocate some
   * LocalState for the application in the sender's account
   */
  OptInOC,

  /**
   * CloseOutOC indicates that an application transaction will deallocate
   * some LocalState for the application from the user's account
   */
  CloseOutOC,

  /**
   * ClearStateOC is similar to CloseOutOC, but may never fail. This
   * allows users to reclaim their minimum balance from an application
   * they no longer wish to opt in to.
   */
  ClearStateOC,

  /**
   * UpdateApplicationOC indicates that an application transaction will
   * update the ApprovalProgram and ClearStateProgram for the application
   */
  UpdateApplicationOC,

  /**
   * DeleteApplicationOC indicates that an application transaction will
   * delete the AppParams for the application from the creator's balance
   * record
   */
  DeleteApplicationOC,
}

/**
 * Check if a value is a valid OnApplicationComplete value
 * @param v - value to check
 * @returns true if v is a valid OnApplicationComplete value
 */
export function isOnApplicationComplete(
  v: unknown
): v is OnApplicationComplete {
  return (
    v === OnApplicationComplete.NoOpOC ||
    v === OnApplicationComplete.OptInOC ||
    v === OnApplicationComplete.CloseOutOC ||
    v === OnApplicationComplete.ClearStateOC ||
    v === OnApplicationComplete.UpdateApplicationOC ||
    v === OnApplicationComplete.DeleteApplicationOC
  );
}

/**
 * Contains parameters relevant to the creation of a new transaction in a specific network at a specific time
 */
export interface SuggestedParams {
  /**
   * Set this to true to specify fee as microalgos-per-txn
   *   If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum
   */
  flatFee?: boolean;

  /**
   * Integer fee per byte, in microAlgos. For a flat fee, set flatFee to true
   */
  fee: number | bigint;

  /**
   * Minimum fee (not per byte) required for the transaction to be confirmed
   */
  minFee: number | bigint;

  /**
   * First protocol round on which this txn is valid
   */
  firstValid: number | bigint;

  /**
   * Last protocol round on which this txn is valid
   */
  lastValid: number | bigint;

  /**
   * Specifies genesis ID of network in use
   */
  genesisID?: string;

  /**
   * Specifies hash genesis block of network in use
   */
  genesisHash?: Uint8Array;
}

/**
 * A grouping of the app ID and name of the box in an Uint8Array
 */
export interface BoxReference {
  /**
   * A unique application index
   */
  appIndex: number | bigint;

  /**
   * Name of box to reference
   */
  name: Uint8Array;
}

/**
 * Contains payment transaction parameters.
 *
 * The full documentation is available at:
 * https://developer.algorand.org/docs/get-details/transactions/transactions/#payment-transaction
 */
export interface PaymentTransactionParams {
  /**
   * Algorand address of recipient
   */
  receiver: string | Address;

  /**
   * Integer amount to send, in microAlgos. Must be nonnegative.
   */
  amount: number | bigint;

  /**
   * Optional, indicates the sender will close their account and the remaining balance will transfer
   * to this account
   */
  closeRemainderTo?: string | Address;
}

/**
 * Contains key registration transaction parameters
 *
 * The full documentation is available at:
 * https://developer.algorand.org/docs/get-details/transactions/transactions/#key-registration-transaction
 */
export interface KeyRegistrationTransactionParams {
  /**
   * 32-byte voting key. For key deregistration, leave undefined
   */
  voteKey?: Uint8Array | string;

  /**
   * 32-byte selection key. For key deregistration, leave undefined
   */
  selectionKey?: Uint8Array | string;

  /**
   * 64-byte state proof key. For key deregistration, leave undefined
   */
  stateProofKey?: Uint8Array | string;

  /**
   * First round on which voting keys are valid
   */
  voteFirst?: number | bigint;

  /**
   * Last round on which voting keys are valid
   */
  voteLast?: number | bigint;

  /**
   * The dilution fo the 2-level participation key
   */
  voteKeyDilution?: number | bigint;

  /**
   * Set this value to true to mark this account as nonparticipating.
   *
   * All new Algorand accounts are participating by default. This means they earn rewards.
   */
  nonParticipation?: boolean;
}

/**
 * Contains asset configuration transaction parameters.
 *
 * The full documentation is available at:
 * https://developer.algorand.org/docs/get-details/transactions/transactions/#asset-configuration-transaction
 */
export interface AssetConfigurationTransactionParams {
  /**
   * Asset index uniquely specifying the asset
   */
  assetIndex?: number | bigint;

  /**
   * Total supply of the asset
   */
  total?: number | bigint;

  /**
   * Integer number of decimals for asset unit calcuation
   */
  decimals?: number | bigint;

  /**
   * Whether asset accounts should default to being frozen
   */
  defaultFrozen?: boolean;

  /**
   * The Algorand address in charge of reserve, freeze, clawback, destruction, etc.
   */
  manager?: string | Address;

  /**
   * The Algorand address representing asset reserve
   */
  reserve?: string | Address;

  /**
   * The Algorand address with power to freeze/unfreeze asset holdings
   */
  freeze?: string | Address;

  /**
   * The Algorand address with power to revoke asset holdings
   */
  clawback?: string | Address;

  /**
   * Unit name for this asset
   */
  unitName?: string;

  /**
   * Name for this asset
   */
  assetName?: string;

  /**
   * URL relating to this asset
   */
  assetURL?: string;

  /**
   * Uint8Array containing a hash commitment with respect to the asset. Must be exactly 32 bytes long.
   */
  assetMetadataHash?: Uint8Array;
}

/**
 * Contains asset transfer transaction parameters.
 *
 * The full documentation is available at:
 * https://developer.algorand.org/docs/get-details/transactions/transactions/#asset-transfer-transaction
 */
export interface AssetTransferTransactionParams {
  /**
   * Asset index uniquely specifying the asset
   */
  assetIndex: number | bigint;

  /**
   * String representation of Algorand address – if provided, and if "sender" is
   * the asset's revocation manager, then deduct from "assetSender" rather than "sender"
   */
  assetSender?: string | Address;

  /**
   * The Algorand address of recipient
   */
  receiver: string | Address;

  /**
   * Integer amount to send
   */
  amount: number | bigint;

  /**
   * Close out remaining asset balance of the sender to this account
   */
  closeRemainderTo?: string | Address;
}

/**
 * Contains asset freeze transaction parameters.
 *
 * The full documentation is available at:
 * https://developer.algorand.org/docs/get-details/transactions/transactions/#asset-freeze-transaction
 */
export interface AssetFreezeTransactionParams {
  /**
   * Asset index uniquely specifying the asset
   */
  assetIndex: number | bigint;

  /**
   * Algorand address being frozen or unfrozen
   */
  freezeTarget: string | Address;

  /**
   * true if freezeTarget should be frozen, false if freezeTarget should be allowed to transact
   */
  frozen: boolean;
}

/**
 * Contains application call transaction parameters.
 *
 * The full documentation is available at:
 * https://developer.algorand.org/docs/get-details/transactions/transactions/#application-call-transaction
 */
export interface ApplicationCallTransactionParams {
  /**
   * A unique application ID
   */
  appIndex: number | bigint;

  /**
   * What application should do once the program has been run
   */
  onComplete: OnApplicationComplete;

  /**
   * Restricts number of ints in per-user local state
   */
  numLocalInts?: number | bigint;

  /**
   * Restricts number of byte slices in per-user local state
   */
  numLocalByteSlices?: number | bigint;

  /**
   * Restricts number of ints in global state
   */
  numGlobalInts?: number | bigint;

  /**
   * Restricts number of byte slices in global state
   */
  numGlobalByteSlices?: number | bigint;

  /**
   * The compiled TEAL that approves a transaction
   */
  approvalProgram?: Uint8Array;

  /**
   * The compiled TEAL program that runs when clearing state
   */
  clearProgram?: Uint8Array;

  /**
   * Array of Uint8Array, any additional arguments to the application
   */
  appArgs?: Uint8Array[];

  /**
   * Array of Address strings, any additional accounts to supply to the application
   */
  accounts?: Array<string | Address>;

  /**
   * Array of int, any other apps used by the application, identified by index
   */
  foreignApps?: Array<number | bigint>;

  /**
   * Array of int, any assets used by the application, identified by index
   */
  foreignAssets?: Array<number | bigint>;

  /**
   * Int representing extra pages of memory to rent during an application create transaction.
   */
  extraPages?: number | bigint;

  /**
   * A grouping of the app ID and name of the box in an Uint8Array
   */
  boxes?: BoxReference[];
}

/**
 * Contains state proof transaction parameters.
 */
export interface StateProofTransactionParams {
  /*
   * Uint64 identifying a particular configuration of state proofs.
   */
  stateProofType?: number | bigint;

  /**
   * The state proof.
   */
  stateProof?: StateProof;

  /**
   * The state proof message.
   */
  message?: StateProofMessage;
}

/**
 * A full list of all available transaction parameters
 *
 * The full documentation is available at:
 * https://developer.algorand.org/docs/get-details/transactions/transactions/#common-fields-header-and-type
 */
export interface TransactionParams {
  /**
   * Transaction type
   */
  type: TransactionType;

  /**
   * Algorand address of sender
   */
  sender: string | Address;

  /**
   * Optional, arbitrary data to be included in the transaction's note field
   */
  note?: Uint8Array;

  /**
   * Optional, 32-byte lease to associate with this transaction.
   *
   * The sender cannot send another transaction with the same lease until the last round of original
   * transaction has passed.
   */
  lease?: Uint8Array;

  /**
   * The Algorand address that will be used to authorize all future transactions from the sender, if provided.
   */
  rekeyTo?: string | Address;

  /**
   * Suggested parameters relevant to the network that will accept this transaction
   */
  suggestedParams: SuggestedParams;

  /**
   * Payment transaction parameters. Only set if type is TransactionType.pay
   */
  paymentParams?: PaymentTransactionParams;

  /**
   * Key registration transaction parameters. Only set if type is TransactionType.keyreg
   */
  keyregParams?: KeyRegistrationTransactionParams;

  /**
   * Asset configuration transaction parameters. Only set if type is TransactionType.acfg
   */
  assetConfigParams?: AssetConfigurationTransactionParams;

  /**
   * Asset transfer transaction parameters. Only set if type is TransactionType.axfer
   */
  assetTransferParams?: AssetTransferTransactionParams;

  /**
   * Asset freeze transaction parameters. Only set if type is TransactionType.afrz
   */
  assetFreezeParams?: AssetFreezeTransactionParams;

  /**
   * Application call transaction parameters. Only set if type is TransactionType.appl
   */
  appCallParams?: ApplicationCallTransactionParams;

  /**
   * State proof transaction parameters. Only set if type is TransactionType.stpf
   */
  stateProofParams?: StateProofTransactionParams;
}
