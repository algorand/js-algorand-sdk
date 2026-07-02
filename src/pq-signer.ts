import { addressFromPQKey } from './encoding/address';
import { PQ_PROGRAM_TAG } from './logicsig';
import {
  Address,
  AddressWithDelegatedLsigSigner,
  AddressWithTransactionSigner,
  DelegatedLsigSigner,
  EncodedPQSig,
  encodeMsgpack,
  LogicSig,
  MultisigMetadata,
  SignedTransaction,
  Transaction,
  TransactionSigner,
} from './main';
import { genericHash } from './nacl/naclWrappers';
import { concatArrays } from './utils/utils';

export interface PQSigningKey {
  pqScheme: Uint8Array;
  pqPublicKey: Uint8Array;
  pqSigner: (bytesToSign: Uint8Array) => Promise<Uint8Array>;
}

export function addressWithSignersFromRawPQSigner(
  signingKey: PQSigningKey,
  sendingAddress?: Address
): AddressWithTransactionSigner & AddressWithDelegatedLsigSigner {
  const { pqPublicKey, pqSigner: rawSigner, pqScheme } = signingKey;
  const { address: authAddress, salt } = addressFromPQKey(
    pqScheme,
    pqPublicKey
  );
  const txnSender = sendingAddress ?? authAddress;

  const txnSigner: TransactionSigner = async (
    txnGroup: Transaction[],
    indexesToSign: number[]
  ) => {
    const stxns: SignedTransaction[] = [];
    for (const index of indexesToSign) {
      const txn = txnGroup[index];
      // eslint-disable-next-line no-await-in-loop
      const sig = await rawSigner(
        new Uint8Array(genericHash(txn.bytesToSign()))
      );
      const pqsig: EncodedPQSig = {
        sch: pqScheme,
        slt: salt,
        pk: pqPublicKey,
        sig,
      };
      const stxn = new SignedTransaction({
        txn,
        pqsig,
        sgnr: txn.sender.equals(txnSender) ? undefined : authAddress,
      });

      stxns.push(stxn);
    }

    return stxns.map((stxn) => encodeMsgpack(stxn));
  };

  const delegatedLsigSigner: DelegatedLsigSigner = async (
    lsig: LogicSig,
    msig?: MultisigMetadata
  ) => {
    if (msig) {
      throw Error('FALCON-1024 does not support multisig signing');
    }

    const toBeSigned = new Uint8Array(
      genericHash(
        concatArrays(PQ_PROGRAM_TAG, authAddress.publicKey, lsig.logic)
      )
    );

    const sig = await rawSigner(toBeSigned);

    const pqsig: EncodedPQSig = {
      sch: pqScheme,
      slt: salt,
      pk: pqPublicKey,
      sig,
    };

    return { address: authAddress, pqsig };
  };

  return {
    address: txnSender,
    txnSigner,
    delegatedLsigSigner,
  };
}
