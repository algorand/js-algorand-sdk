import * as nacl from './nacl/naclWrappers.js';
import { Address } from './encoding/address.js';
import { Transaction } from './transaction.js';
import * as convert from './convert.js';
import * as utils from './utils/utils.js';

const SIGN_BYTES_PREFIX = Uint8Array.from([77, 88]); // "MX"

// Errors
export const MULTISIG_BAD_SENDER_ERROR_MSG =
  'The transaction sender address and multisig preimage do not match.';

/**
 * signTransaction takes an object with either payment or key registration fields and
 * a secret key and returns a signed blob.
 *
 * Payment transaction fields: from, to, amount, fee, firstValid, lastValid, genesisHash,
 * note(optional), GenesisID(optional), closeRemainderTo(optional)
 *
 * Key registration fields: fee, firstValid, lastValid, voteKey, selectionKey, voteFirst,
 * voteLast, voteKeyDilution, genesisHash, note(optional), GenesisID(optional)
 *
 * If flatFee is not set and the final calculated fee is lower than the protocol minimum fee, the fee will be increased to match the minimum.
 * @param txn - object with either payment or key registration fields
 * @param sk - Algorand Secret Key
 * @returns object contains the binary signed transaction and its txID
 */
export function signTransaction(txn: Transaction, sk: Uint8Array) {
  return {
    txID: txn.txID(),
    blob: txn.signTxn(sk),
  };
}

/**
 * signBytes takes arbitrary bytes and a secret key, prepends the bytes with "MX" for domain separation, signs the bytes
 * with the private key, and returns the signature.
 * @param bytes - Uint8array
 * @param sk - Algorand secret key
 * @returns binary signature
 */
export function signBytes(bytes: Uint8Array, sk: Uint8Array) {
  const toBeSigned = utils.concatArrays(SIGN_BYTES_PREFIX, bytes);
  const sig = nacl.sign(toBeSigned, sk);
  return sig;
}

/**
 * verifyBytes takes array of bytes, an address, and a signature and verifies if the signature is correct for the public
 * key and the bytes (the bytes should have been signed with "MX" prepended for domain separation).
 * @param bytes - Uint8Array
 * @param signature - binary signature
 * @param addr - string address
 * @returns bool
 */
export function verifyBytes(
  bytes: Uint8Array,
  signature: Uint8Array,
  addr: string | Address
) {
  const toBeVerified = utils.concatArrays(SIGN_BYTES_PREFIX, bytes);
  const addrObj = typeof addr === 'string' ? Address.fromString(addr) : addr;
  return nacl.verify(toBeVerified, signature, addrObj.publicKey);
}

export const ERROR_MULTISIG_BAD_SENDER = new Error(
  MULTISIG_BAD_SENDER_ERROR_MSG
);
export const ERROR_INVALID_MICROALGOS = new Error(
  convert.INVALID_MICROALGOS_ERROR_MSG
);

export { AlgodClient as Algodv2 } from './client/v2/algod/algod.js';
export { KmdClient as Kmd } from './client/kmd.js';
export { default as IntDecoding } from './types/intDecoding.js';
export { default as Account } from './types/account.js';
export { IndexerClient as Indexer } from './client/v2/indexer/indexer.js';
export {
  BaseHTTPClient,
  BaseHTTPClientResponse,
  BaseHTTPClientError,
} from './client/baseHTTPClient.js';
export {
  AlgodTokenHeader,
  IndexerTokenHeader,
  KMDTokenHeader,
  CustomTokenHeader,
  TokenHeader,
} from './client/urlTokenBaseHTTPClient.js';
export { waitForConfirmation } from './wait.js';
export {
  MsgpackEncodingData,
  JSONEncodingData,
  Encodable,
  EncodableClass,
  encodeObj,
  decodeObj,
  msgpackRawEncode,
  msgpackRawDecode,
  msgpackRawDecodeAsMap,
  encodeMsgpack,
  decodeMsgpack,
  encodeJSON,
  decodeJSON,
} from './encoding/encoding.js';
export {
  Address,
  isValidAddress,
  encodeAddress,
  decodeAddress,
  getApplicationAddress,
  ALGORAND_ZERO_ADDRESS_STRING,
} from './encoding/address.js';
export { bytesToBigInt, bigIntToBytes } from './encoding/bigint.js';
export {
  base64ToBytes,
  bytesToBase64,
  bytesToString,
  coerceToBytes,
  bytesToHex,
  hexToBytes,
} from './encoding/binarydata.js';
export { encodeUint64, decodeUint64 } from './encoding/uint64.js';
export { parseJSON, ParseJSONOptions, stringifyJSON } from './utils/utils.js';
export { default as generateAccount } from './account.js';
export * from './types/block.js';
export * from './types/statedelta.js';
export * from './stateproof.js';
export { UntypedValue } from './client/v2/untypedmodel.js';
export * as modelsv2 from './client/v2/algod/models/types.js';
export * as indexerModels from './client/v2/indexer/models/types.js';
export {
  mnemonicToMasterDerivationKey,
  masterDerivationKeyToMnemonic,
  secretKeyToMnemonic,
  mnemonicToSecretKey,
  seedFromMnemonic,
  mnemonicFromSeed,
} from './mnemonic/mnemonic.js';
export {
  microalgosToAlgos,
  algosToMicroalgos,
  INVALID_MICROALGOS_ERROR_MSG,
} from './convert.js';
export { computeGroupID, assignGroupID } from './group.js';
export {
  SignedTransaction,
  decodeSignedTransaction,
  encodeUnsignedSimulateTransaction,
} from './signedTransaction.js';
export {
  signLogicSigTransaction,
  signLogicSigTransactionObject,
} from './signing.js';
export {
  LogicSig,
  LogicSigAccount,
  logicSigFromByte,
  tealSign,
  tealSignFromProgram,
  verifyTealSign,
} from './logicsig.js';
export {
  MultisigMetadata,
  verifyMultisig,
  multisigAddress,
} from './multisig.js';
export {
  signMultisigTransaction,
  mergeMultisigTransactions,
  appendSignMultisigTransaction,
  createMultisigTransaction,
  appendSignRawMultisigSignature,
} from './multisigSigning.js';
export {
  ProgramSourceMap,
  SourceLocation,
  PcLineLocation,
} from './logic/sourcemap.js';

export * from './dryrun.js';
export * from './makeTxn.js';
export * from './transaction.js';
export * from './signer.js';
export * from './composer.js';
export * from './types/transactions/index.js';
export * from './abi/index.js';
