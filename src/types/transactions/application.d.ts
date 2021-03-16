import { TransactionType, TransactionParams } from './base';
import { ConstructTransaction } from './builder';

// -----------------------------------
// > Application Create Transaction
// -----------------------------------

type SpecificParametersForCreate = Pick<
  TransactionParams,
  | 'appIndex'
  | 'appOnComplete'
  | 'appApprovalProgram'
  | 'appClearProgram'
  | 'appLocalInts'
  | 'appLocalByteSlices'
  | 'appGlobalInts'
  | 'appGlobalByteSlices'
  | 'appArgs'
  | 'appAccounts'
  | 'appForeignApps'
  | 'appForeignAssets'
>;

interface OverwritesForCreate {
  type?: TransactionType.appl;
}

export type ApplicationCreateTransaction = ConstructTransaction<
  SpecificParametersForCreate,
  OverwritesForCreate
>;

// -----------------------------------
// > Application Update Transaction
// -----------------------------------

type SpecificParametersForUpdate = Pick<
  TransactionParams,
  | 'appIndex'
  | 'appOnComplete'
  | 'appApprovalProgram'
  | 'appClearProgram'
  | 'appArgs'
  | 'appAccounts'
  | 'appForeignApps'
  | 'appForeignAssets'
>;

interface OverwritesForUpdate {
  type?: TransactionType.appl;
}

export type ApplicationUpdateTransaction = ConstructTransaction<
  SpecificParametersForUpdate,
  OverwritesForUpdate
>;

// -----------------------------------
// > Application Delete Transaction
// -----------------------------------

type SpecificParametersForDelete = Pick<
  TransactionParams,
  | 'appIndex'
  | 'appOnComplete'
  | 'appArgs'
  | 'appAccounts'
  | 'appForeignApps'
  | 'appForeignAssets'
>;

interface OverwritesForDelete {
  type?: TransactionType.appl;
}

export type ApplicationDeleteTransaction = ConstructTransaction<
  SpecificParametersForDelete,
  OverwritesForDelete
>;

// -----------------------------------
// > Application Opt-In Transaction
// -----------------------------------

// Same structure as the application delete transaction
export type ApplicationOptInTransaction = ApplicationDeleteTransaction;
