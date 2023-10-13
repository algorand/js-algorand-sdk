import { TransactionType, TransactionParams } from './base.js';
import { ConstructTransaction } from './builder.js';

type SpecificParameters = Pick<
  TransactionParams,
  'stateProofType' | 'stateProof' | 'stateProofMessage'
>;

interface Overwrites {
  type?: TransactionType.stpf;
}

type StateProofTransaction = ConstructTransaction<
  SpecificParameters,
  Overwrites
>;
export default StateProofTransaction;
