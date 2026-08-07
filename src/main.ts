import * as convert from './convert.js';

// Errors
export const MULTISIG_BAD_SENDER_ERROR_MSG =
  'The transaction sender address and multisig preimage do not match.';

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
  addressFromPQKey,
  addressFromPQSig,
  PQ_SCHEME_SIZE,
  PQ_SALT_MAX,
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
  pq25WordMnemonicToSeed,
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
  SIGN_BYTES_PREFIX,
  signTransaction,
  signTransactionWithSigner,
  signBytes,
  verifyBytes,
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
  PROGRAM_TAG,
  PQ_PROGRAM_TAG,
  MSIG_PROGRAM_TAG,
  SIGN_PROGRAM_DATA_PREFIX,
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
  signMultisigTransactionWithSigner,
  appendSignMultisigTransactionWithSigner,
} from './multisigSigning.js';
export {
  ProgramSourceMap,
  SourceLocation,
  PcLineLocation,
} from './logic/sourcemap.js';

export {
  Ed25519SigningKey,
  addressWithSignersFromRawEd25519Signer,
} from './ed25519-signer.js';
export {
  FALCON_1024_SCHEME,
  Falcon1024SigningKey,
  addressWithSignersFromRawFalcon1024Signer,
} from './falcon-signer.js';
export {
  PQSigningKey,
  addressWithSignersFromRawPQSigner,
} from './pq-signer.js';

export * from './makeTxn.js';
export * from './transaction.js';
export * from './signer.js';
export * from './composer.js';
export * from './types/transactions/index.js';
export * from './abi/index.js';
