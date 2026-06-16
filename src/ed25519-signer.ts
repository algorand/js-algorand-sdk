import { MSIG_PROGRAM_TAG, PROGRAM_TAG } from './logicsig';
import {
  Address,
  AddressWithSigners,
  DelegatedLsigSigner,
  EncodedMultisig,
  EncodedSubsig,
  encodeMsgpack,
  MxBytesSigner,
  SIGN_BYTES_PREFIX,
  SignedTransaction,
  Transaction,
  TransactionSigner,
} from './main';
import { addressFromMultisigPreImg } from './multisig';
import { arrayEqual, concatArrays } from './utils/utils';

export interface Ed25519SigningKey {
  ed25519PublicKey: Uint8Array;
  ed25519Signer: (bytesToSign: Uint8Array) => Promise<Uint8Array>;
}

export function addressWithSignersFromRawEd25519Signer(
  ed25519SigningKey: Ed25519SigningKey,
  sendingAddress: Address = new Address(ed25519SigningKey.ed25519PublicKey)
): AddressWithSigners {
  const authAddress = new Address(ed25519SigningKey.ed25519PublicKey);
  const { ed25519Signer: rawSigner } = ed25519SigningKey;

  const txnSigner: TransactionSigner = async (
    txnGroup: Transaction[],
    indexesToSign: number[]
  ) => {
    const stxns: SignedTransaction[] = [];
    for (const index of indexesToSign) {
      const txn = txnGroup[index];
      // eslint-disable-next-line no-await-in-loop
      const sig = await rawSigner(txn.bytesToSign());
      const stxn = new SignedTransaction({
        txn,
        sig,
        sgnr: txn.sender.equals(sendingAddress) ? undefined : authAddress,
      });

      stxns.push(stxn);
    }

    return stxns.map((stxn) => encodeMsgpack(stxn));
  };

  const delegatedLsigSigner: DelegatedLsigSigner = async (lsig, msig) => {
    if (msig) {
      const pks = msig.addrs.map(
        (a) => Address.fromString(a.toString()).publicKey
      );

      const multisigAddr = addressFromMultisigPreImg({
        version: msig.version,
        threshold: msig.threshold,
        pks,
      });

      const toBeSigned = concatArrays(
        MSIG_PROGRAM_TAG,
        multisigAddr.publicKey,
        lsig.logic
      );

      const subsigs: EncodedSubsig[] = pks.map((pk) => ({ pk }));
      const ourSubsig = subsigs.find((subsig) =>
        arrayEqual(subsig.pk, authAddress.publicKey)
      );
      if (ourSubsig === undefined) {
        throw Error(
          `DelegatedLsigSigner could not find ${authAddress} as a signer in the multisig`
        );
      }

      const sig = await rawSigner(toBeSigned);
      ourSubsig.s = sig;
      return {
        address: authAddress,
        lmsig: {
          v: msig.version,
          thr: msig.threshold,
          subsig: subsigs,
        } satisfies EncodedMultisig,
      };
    }

    const toBeSigned = concatArrays(PROGRAM_TAG, lsig.logic);
    const sig = await rawSigner(toBeSigned);
    return { address: authAddress, sig };
  };

  const mxBytesSigner: MxBytesSigner = async (bytes: Uint8Array) => {
    const bytesToSign = concatArrays(SIGN_BYTES_PREFIX, bytes);
    return rawSigner(bytesToSign);
  };

  return {
    address: sendingAddress,
    txnSigner,
    delegatedLsigSigner,
    mxBytesSigner,
  };
}
