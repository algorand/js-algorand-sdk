import PaymentTxn from './payment.js';
import KeyRegistrationTxn from './keyreg.js';
import {
  AssetCreateTransaction as AssetCreateTxn,
  AssetConfigurationTransaction as AssetConfigTxn,
  AssetDestroyTransaction as AssetDestroyTxn,
  AssetFreezeTransaction as AssetFreezeTxn,
  AssetTransferTransaction as AssetTransferTxn,
} from './asset.js';
import {
  ApplicationCreateTransaction as AppCreateTxn,
  ApplicationUpdateTransaction as AppUpdateTxn,
  ApplicationDeleteTransaction as AppDeleteTxn,
  ApplicationOptInTransaction as AppOptInTxn,
  ApplicationCloseOutTransaction as AppCloseOutTxn,
  ApplicationClearStateTransaction as AppClearStateTxn,
  ApplicationNoOpTransaction as AppNoOpTxn,
} from './application.js';
import StateProofTxn from './stateproof.js';

export { TransactionType } from './base.js';
// Utilities
export type {
  TransactionParams,
  SuggestedParams,
  BoxReference,
} from './base.js';
export type {
  MustHaveSuggestedParams,
  MustHaveSuggestedParamsInline,
} from './builder.js';
export * from './encoded.js';

// Transaction types
export type { default as PaymentTxn } from './payment.js';
export type { default as KeyRegistrationTxn } from './keyreg.js';
export type {
  AssetCreateTransaction as AssetCreateTxn,
  AssetConfigurationTransaction as AssetConfigTxn,
  AssetDestroyTransaction as AssetDestroyTxn,
  AssetFreezeTransaction as AssetFreezeTxn,
  AssetTransferTransaction as AssetTransferTxn,
} from './asset.js';
export type {
  ApplicationCreateTransaction as AppCreateTxn,
  ApplicationUpdateTransaction as AppUpdateTxn,
  ApplicationDeleteTransaction as AppDeleteTxn,
  ApplicationOptInTransaction as AppOptInTxn,
  ApplicationCloseOutTransaction as AppCloseOutTxn,
  ApplicationClearStateTransaction as AppClearStateTxn,
  ApplicationNoOpTransaction as AppNoOpTxn,
} from './application.js';
export type { default as StateProofTxn } from './stateproof.js';

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
  | AppNoOpTxn
  | StateProofTxn;
export default AnyTransaction;
