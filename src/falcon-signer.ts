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

export interface FalconSigningKey {
  falconPublicKey: Uint8Array;
  falconSigner: (bytesToSign: Uint8Array) => Promise<Uint8Array>;
}

export function addressWithSignersFromRawFalcon1024Signer(
  falconSigningKey: FalconSigningKey,
  sendingAddress?: Address
): AddressWithTransactionSigner & AddressWithDelegatedLsigSigner {
  const { falconPublicKey, falconSigner: rawSigner } = falconSigningKey;
  const { address: authAddress, salt } = Address.canonicalPQAddress(
    FALCON1024_SCHEME,
    falconPublicKey
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
        pk: falconPublicKey,
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
      pk: falconPublicKey,
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
