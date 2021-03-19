/// <reference types="node" />
import { OnApplicationComplete, TransactionParams, TransactionType } from './types/transactions/base';
import AnyTransaction, { EncodedTransaction, EncodedSignedTransaction } from './types/transactions';
import { Address } from './types/address';
export declare const ALGORAND_MIN_TX_FEE = 1000;
/**
 * A modified version of the transaction params. Represents the internal structure that the Transaction class uses
 * to store inputted transaction objects.
 */
interface TransactionStorageStructure extends Omit<TransactionParams, 'from' | 'to' | 'genesisHash' | 'closeRemainderTo' | 'voteKey' | 'selectionKey' | 'assetManager' | 'assetReserve' | 'assetFreeze' | 'assetClawback' | 'assetRevocationTarget' | 'freezeAccount' | 'appAccounts' | 'suggestedParams' | 'reKeyTo'> {
    from: string | Address;
    to: string | Address;
    fee: number;
    amount: number;
    firstRound: number;
    lastRound: number;
    note?: Uint8Array;
    genesisID: string;
    genesisHash: string | Buffer;
    lease?: Uint8Array;
    closeRemainderTo?: string | Address;
    voteKey: string | Buffer;
    selectionKey: string | Buffer;
    voteFirst: number;
    voteLast: number;
    voteKeyDilution: number;
    assetIndex: number;
    assetTotal: number;
    assetDecimals: number;
    assetDefaultFrozen: boolean;
    assetManager: string | Address;
    assetReserve: string | Address;
    assetFreeze: string | Address;
    assetClawback: string | Address;
    assetUnitName: string;
    assetName: string;
    assetURL: string;
    assetMetadataHash: string | Uint8Array;
    freezeAccount: string | Address;
    freezeState: boolean;
    assetRevocationTarget?: string | Address;
    appIndex: number;
    appOnComplete: OnApplicationComplete;
    appLocalInts: number;
    appLocalByteSlices: number;
    appGlobalInts: number;
    appGlobalByteSlices: number;
    appApprovalProgram: Uint8Array;
    appClearProgram: Uint8Array;
    appArgs?: Uint8Array[];
    appAccounts?: string[] | Address[];
    appForeignApps?: number[];
    appForeignAssets?: number[];
    type?: TransactionType;
    flatFee: boolean;
    reKeyTo?: string | Address;
    nonParticipation?: boolean;
    group: undefined;
}
/**
 * Transaction enables construction of Algorand transactions
 * */
export declare class Transaction implements TransactionStorageStructure {
    name: string;
    tag: Buffer;
    from: Address;
    to: Address;
    fee: number;
    amount: number;
    firstRound: number;
    lastRound: number;
    note?: Uint8Array;
    genesisID: string;
    genesisHash: Buffer;
    lease?: Uint8Array;
    closeRemainderTo?: Address;
    voteKey: Buffer;
    selectionKey: Buffer;
    voteFirst: number;
    voteLast: number;
    voteKeyDilution: number;
    assetIndex: number;
    assetTotal: number;
    assetDecimals: number;
    assetDefaultFrozen: boolean;
    assetManager: Address;
    assetReserve: Address;
    assetFreeze: Address;
    assetClawback: Address;
    assetUnitName: string;
    assetName: string;
    assetURL: string;
    assetMetadataHash: Uint8Array;
    freezeAccount: Address;
    freezeState: boolean;
    assetRevocationTarget?: Address;
    appIndex: number;
    appOnComplete: OnApplicationComplete;
    appLocalInts: number;
    appLocalByteSlices: number;
    appGlobalInts: number;
    appGlobalByteSlices: number;
    appApprovalProgram: Uint8Array;
    appClearProgram: Uint8Array;
    appArgs?: Uint8Array[];
    appAccounts?: Address[];
    appForeignApps?: number[];
    appForeignAssets?: number[];
    type?: TransactionType;
    flatFee: boolean;
    reKeyTo?: Address;
    nonParticipation?: boolean;
    group: undefined;
    constructor(transactionObj: AnyTransaction);
    get_obj_for_encoding(): EncodedTransaction;
    static from_obj_for_encoding(txnForEnc: EncodedTransaction): any;
    estimateSize(): number;
    bytesToSign(): Buffer;
    toByte(): Uint8Array;
    rawSignTxn(sk: Uint8Array): Buffer;
    signTxn(sk: Uint8Array): Uint8Array;
    rawTxID(): Buffer;
    txID(): string;
    addLease(lease: Uint8Array, feePerByte?: number): void;
    addRekey(reKeyTo: string, feePerByte?: number): void;
    _getDictForDisplay(): TransactionStorageStructure & Record<string, any>;
    prettyPrint(): void;
    toString(): string;
}
/**
 * encodeUnsignedTransaction takes a completed txnBuilder.Transaction object, such as from the makeFoo
 * family of transactions, and converts it to a Buffer
 * @param transactionObject the completed Transaction object
 */
export declare function encodeUnsignedTransaction(transactionObject: Transaction): Uint8Array;
/**
 * decodeUnsignedTransaction takes a Buffer (as if from encodeUnsignedTransaction) and converts it to a txnBuilder.Transaction object
 * @param transactionBuffer the Uint8Array containing a transaction
 */
export declare function decodeUnsignedTransaction(transactionBuffer: ArrayLike<number>): any;
/**
 * decodeSignedTransaction takes a Buffer (from transaction.signTxn) and converts it to an object
 * containing the Transaction (txn), the signature (sig), and the auth-addr field if applicable (sgnr)
 * @param transactionBuffer the Uint8Array containing a transaction
 * @returns containing a Transaction, the signature, and possibly an auth-addr field
 */
export declare function decodeSignedTransaction(transactionBuffer: Uint8Array): EncodedSignedTransaction;
export default Transaction;
