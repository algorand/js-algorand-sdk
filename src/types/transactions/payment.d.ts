import { TransactionType, AvailableTransactionParams } from './base';
import { ConstructTransaction } from './builder';

type SpecificParameters = Pick<
  AvailableTransactionParams,
  'to' | 'amount' | 'closeRemainderTo'
>;

interface Overwrites {
  type?: TransactionType.pay;
}

type PaymentTransaction = ConstructTransaction<SpecificParameters, Overwrites>;
export default PaymentTransaction;
