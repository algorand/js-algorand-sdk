import { TransactionType, TransactionParams } from './base';
import { ConstructTransaction } from './builder';

type SpecificParameters = Pick<TransactionParams, 'heartbeatFields'>;

interface Overwrites {
  type?: TransactionType.hb;
}

type HeartbeatTransaction = ConstructTransaction<
  SpecificParameters,
  Overwrites
>;
export default HeartbeatTransaction;
