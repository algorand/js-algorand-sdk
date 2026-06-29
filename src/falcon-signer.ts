import { PROGRAM_TAG } from './logicsig';
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

/**
 * The 2-byte ASCII identifier of the Falcon-1024 post-quantum signature scheme.
 */
export const FALCON1024_SCHEME = 'f1';

export interface Falcon1024SigningKey {
  falcon1024PublicKey: Uint8Array;
  falcon1024Signer: (bytesToSign: Uint8Array) => Promise<Uint8Array>;
}

export function addressWithSignersFromRawFalcon1024Signer(
  falconSigningKey: Falcon1024SigningKey,
  sendingAddress?: Address
): AddressWithTransactionSigner & AddressWithDelegatedLsigSigner {
  const { falcon1024PublicKey, falcon1024Signer: rawSigner } = falconSigningKey;
  const { address: authAddress, salt } = Address.canonicalPQAddress(
    FALCON1024_SCHEME,
    falcon1024PublicKey
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
        sch: FALCON1024_SCHEME,
        slt: salt,
        pk: falcon1024PublicKey,
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
      genericHash(concatArrays(authAddress.publicKey, PROGRAM_TAG, lsig.logic))
    );

    const sig = await rawSigner(toBeSigned);

    const pqsig: EncodedPQSig = {
      sch: FALCON1024_SCHEME,
      slt: salt,
      pk: falcon1024PublicKey,
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
