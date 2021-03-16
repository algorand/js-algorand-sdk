import { TransactionType, TransactionParams } from './base';
import { ConstructTransaction } from './builder';

// ------------------------------
// > Asset Create Transaction
// ------------------------------

type SpecificParametersForCreate = Pick<
  TransactionParams,
  | 'assetTotal'
  | 'assetDecimals'
  | 'assetDefaultFrozen'
  | 'assetUnitName'
  | 'assetName'
  | 'assetURL'
  | 'assetMetadataHash'
  | 'assetManager'
  | 'assetReserve'
  | 'assetFreeze'
  | 'assetClawback'
>;

interface OverwritesForCreate {
  type?: TransactionType.acfg;
}

export type AssetCreateTransaction = ConstructTransaction<
  SpecificParametersForCreate,
  OverwritesForCreate
>;

// ------------------------------
// > Asset Config Transaction
// ------------------------------

type SpecificParametersForConfig = Pick<
  TransactionParams,
  | 'assetIndex'
  | 'assetManager'
  | 'assetReserve'
  | 'assetFreeze'
  | 'assetClawback'
>;

interface OverwritesForConfig {
  type?: TransactionType.acfg;
}

export type AssetConfigurationTransaction = ConstructTransaction<
  SpecificParametersForConfig,
  OverwritesForConfig
>;
