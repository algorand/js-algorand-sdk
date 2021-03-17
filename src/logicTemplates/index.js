import dynamicFeeTemplate from './dynamicfee';
import htlcTemplate from './htlc';
import limitOrderTemplate from './limitorder';
import splitTemplate from './split';
import periodicPayTemplate from './periodicpayment';

module.exports = {
  DynamicFee: dynamicFeeTemplate.DynamicFee,
  getDynamicFeeTransactions: dynamicFeeTemplate.getDynamicFeeTransactions,
  signDynamicFee: dynamicFeeTemplate.signDynamicFee,
  HTLC: htlcTemplate.HTLC,
  signTransactionWithHTLCUnlock: htlcTemplate.signTransactionWithHTLCUnlock,
  LimitOrder: limitOrderTemplate.LimitOrder,
  getSwapAssetsTransaction: limitOrderTemplate.getSwapAssetsTransaction,
  Split: splitTemplate.Split,
  getSplitFundsTransaction: splitTemplate.getSplitFundsTransaction,
  PeriodicPayment: periodicPayTemplate.PeriodicPayment,
  getPeriodicPaymentWithdrawalTransaction:
    periodicPayTemplate.getPeriodicPaymentWithdrawalTransaction,
};
