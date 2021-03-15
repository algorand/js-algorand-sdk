import { TransactionType, AvailableTransactionParams } from './base';
import { ConstructTransaction } from './builder';

type SpecificParameters = Pick<
  AvailableTransactionParams,
  | 'voteKey'
  | 'selectionKey'
  | 'voteFirst'
  | 'voteLast'
  | 'voteKeyDilution'
  | 'nonParticipation'
>;

interface Overwrites {
  type?: TransactionType.keyreg;
}

type KeyRegistrationTransaction = ConstructTransaction<
  SpecificParameters,
  Overwrites
>;
export default KeyRegistrationTransaction;
