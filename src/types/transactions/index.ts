import PaymentTxn from './payment';
import KeyRegistrationTxn from './keyreg';
import {
  AssetCreateTransaction as AssetCreateTxn,
  AssetConfigurationTransaction as AssetConfigTxn,
  AssetDestroyTransaction as AssetDestroyTxn,
  AssetFreezeTransaction as AssetFreezeTxn,
  AssetTransferTransaction as AssetTransferTxn,
} from './asset';
import {
  ApplicationCreateTransaction as AppCreateTxn,
  ApplicationUpdateTransaction as AppUpdateTxn,
  ApplicationDeleteTransaction as AppDeleteTxn,
  ApplicationOptInTransaction as AppOptInTxn,
  ApplicationCloseOutTransaction as AppCloseOutTxn,
  ApplicationClearStateTransaction as AppClearStateTxn,
  ApplicationNoOpTransaction as AppNoOpTxn,
} from './application';
import Account from '../account';

// Utilities
export {
  TransactionParams,
  TransactionType,
  SuggestedParams,
  OnApplicationComplete,
} from './base';
export {
  MustHaveSuggestedParams,
  MustHaveSuggestedParamsInline,
} from './builder';
export {
  EncodedTransaction,
  EncodedSignedTransaction,
  EncodedAssetParams,
  EncodedGlobalStateSchema,
  EncodedLocalStateSchema,
  EncodedLogicSig,
  EncodedMultisig,
  EncodedMultisigBlob,
  EncodedSubsig,
} from './encoded';
export { MultisigMetadata } from '../multisig';
export { IntDecoding } from '../intDecoding';
export { Address } from '../address';

// Transaction types
export { default as PaymentTxn } from './payment';
export { default as KeyRegistrationTxn } from './keyreg';
export {
  AssetCreateTransaction as AssetCreateTxn,
  AssetConfigurationTransaction as AssetConfigTxn,
  AssetDestroyTransaction as AssetDestroyTxn,
  AssetFreezeTransaction as AssetFreezeTxn,
  AssetTransferTransaction as AssetTransferTxn,
} from './asset';
export {
  ApplicationCreateTransaction as AppCreateTxn,
  ApplicationUpdateTransaction as AppUpdateTxn,
  ApplicationDeleteTransaction as AppDeleteTxn,
  ApplicationOptInTransaction as AppOptInTxn,
  ApplicationCloseOutTransaction as AppCloseOutTxn,
  ApplicationClearStateTransaction as AppClearStateTxn,
  ApplicationNoOpTransaction as AppNoOpTxn,
} from './application';

// All possible transaction types
type AnyTransaction =
  | PaymentTxn
  | KeyRegistrationTxn
  | AssetCreateTxn
  | AssetConfigTxn
  | AssetDestroyTxn
  | AssetFreezeTxn
  | AssetTransferTxn
  | AppCreateTxn
  | AppUpdateTxn
  | AppDeleteTxn
  | AppOptInTxn
  | AppCloseOutTxn
  | AppClearStateTxn
  | AppNoOpTxn;
export { AnyTransaction, Account };
