import * as txnBuilder from './transaction';
import bidBuilder from './bid';
import algod from './client/algod';
import kmd from './client/kmd';
import algodv2 from './client/v2/algod/algod';
import indexer from './client/v2/indexer/indexer';
import AnyTransaction from './types/transactions';
import { MultisigMetadata } from './types/multisig';
export declare const Algod: typeof algod.Algod;
export declare const Kmd: typeof kmd.Kmd;
export declare const Algodv2: typeof algodv2.AlgodClient;
export declare const Indexer: typeof indexer.IndexerClient;
export declare const MULTISIG_BAD_SENDER_ERROR_MSG = "The transaction sender address and multisig preimage do not match.";
/**
 * signTransaction takes an object with either payment or key registration fields and
 * a secret key and returns a signed blob.
 *
 * Payment transaction fields: from, to, amount, fee, firstRound, lastRound, genesisHash,
 * note(optional), GenesisID(optional), closeRemainderTo(optional)
 *
 * Key registration fields: fee, firstRound, lastRound, voteKey, selectionKey, voteFirst,
 * voteLast, voteKeyDilution, genesisHash, note(optional), GenesisID(optional)
 *
 * If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * @param txn object with either payment or key registration fields
 * @param sk Algorand Secret Key
 * @returns object contains the binary signed transaction and its txID
 */
export declare function signTransaction(txn: AnyTransaction | txnBuilder.Transaction, sk: Uint8Array): {
    txID: string;
    blob: Uint8Array;
};
/**
 * signBid takes an object with the following fields: bidder key, bid amount, max price, bid ID, auctionKey, auction ID,
 * and a secret key and returns a signed blob to be inserted into a transaction Algorand note field.
 * @param bid Algorand Bid
 * @param sk Algorand secret key
 * @returns Uint8Array binary signed bid
 */
export declare function signBid(bid: ConstructorParameters<typeof bidBuilder.Bid>[0], sk: Uint8Array): Uint8Array;
/**
 * signBytes takes arbitrary bytes and a secret key, prepends the bytes with "MX" for domain separation, signs the bytes
 * with the private key, and returns the signature.
 * @param bytes Uint8array
 * @param sk Algorand secret key
 * @returns binary signature
 */
export declare function signBytes(bytes: Uint8Array, sk: Uint8Array): Uint8Array;
/**
 * verifyBytes takes array of bytes, an address, and a signature and verifies if the signature is correct for the public
 * key and the bytes (the bytes should have been signed with "MX" prepended for domain separation).
 * @param bytes Uint8Array
 * @param signature binary signature
 * @param addr string address
 * @returns bool
 */
export declare function verifyBytes(bytes: Uint8Array, signature: Uint8Array, addr: string): boolean;
/**
 * signMultisigTransaction takes a raw transaction (see signTransaction), a multisig preimage, a secret key, and returns
 * a multisig transaction, which is a blob representing a transaction and multisignature account preimage. The returned
 * multisig txn can accumulate additional signatures through mergeMultisigTransactions or appendMultisigTransaction.
 * @param txn object with either payment or key registration fields
 * @param version multisig version
 * @param threshold multisig threshold
 * @param addrs a list of Algorand addresses representing possible signers for this multisig. Order is important.
 * @param sk Algorand secret key. The corresponding pk should be in the pre image.
 * @returns object containing txID, and blob of partially signed multisig transaction (with multisig preimage information)
 * If the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 */
export declare function signMultisigTransaction(txn: AnyTransaction | txnBuilder.Transaction, { version, threshold, addrs }: MultisigMetadata, sk: Uint8Array): {
    txID: string;
    blob: Uint8Array;
};
/**
 * mergeMultisigTransactions takes a list of multisig transaction blobs, and merges them.
 * @param multisigTxnBlobs a list of blobs representing encoded multisig txns
 * @returns blob representing encoded multisig txn
 */
export declare function mergeMultisigTransactions(multisigTxnBlobs: Uint8Array[]): Uint8Array;
/**
 * appendSignMultisigTransaction takes a multisig transaction blob, and appends our signature to it.
 * While we could derive public key preimagery from the partially-signed multisig transaction,
 * we ask the caller to pass it back in, to ensure they know what they are signing.
 * @param multisigTxnBlob an encoded multisig txn. Supports non-payment txn types.
 * @param version multisig version
 * @param threshold multisig threshold
 * @param addrs a list of Algorand addresses representing possible signers for this multisig. Order is important.
 * @param sk Algorand secret key
 * @returns object containing txID, and blob representing encoded multisig txn
 */
export declare function appendSignMultisigTransaction(multisigTxnBlob: Uint8Array, { version, threshold, addrs }: MultisigMetadata, sk: Uint8Array): {
    txID: any;
    blob: Uint8Array;
};
/**
 * multisigAddress takes multisig metadata (preimage) and returns the corresponding human readable Algorand address.
 * @param version mutlisig version
 * @param threshold multisig threshold
 * @param addrs list of Algorand addresses
 */
export declare function multisigAddress({ version, threshold, addrs, }: MultisigMetadata): string;
/**
 * encodeObj takes a javascript object and returns its msgpack encoding
 * Note that the encoding sorts the fields alphabetically
 * @param o js obj
 * @returns Uint8Array binary representation
 */
export declare function encodeObj(o: Record<string | number | symbol, any>): Uint8Array;
/**
 * decodeObj takes a Uint8Array and returns its javascript obj
 * @param o Uint8Array to decode
 * @returns object
 */
export declare function decodeObj(o: ArrayLike<number>): unknown;
export declare const ERROR_MULTISIG_BAD_SENDER: Error;
export declare const ERROR_INVALID_MICROALGOS: Error;
export { isValidAddress, encodeAddress, decodeAddress, } from './encoding/address';
export { encodeUint64, decodeUint64 } from './encoding/uint64';
export { generateAccount } from './account';
export { secretKeyToMnemonic, mnemonicToSecretKey } from './mnemonic/mnemonic';
export { default as modelsv2 } from './client/v2/algod/models/types';
export { mnemonicToMasterDerivationKey, masterDerivationKeyToMnemonic, } from './mnemonic/mnemonic';
export { microalgosToAlgos, algosToMicroalgos, INVALID_MICROALGOS_ERROR_MSG, } from './convert';
export { computeGroupID, assignGroupID } from './group';
export { makeLogicSig, signLogicSigTransaction, signLogicSigTransactionObject, logicSigFromByte, tealSign, tealSignFromProgram, } from './logicsig';
export { default as LogicTemplates } from './logicTemplates';
export * from './makeTxn';
export * from './transaction';
