import { Address } from './encoding/address.js';
import { encodeMsgpack } from './encoding/encoding.js';
import {
  MSIG_PROGRAM_TAG,
  PROGRAM_TAG,
  SIGN_PROGRAM_DATA_PREFIX,
} from './logicsig.js';
import { addressFromMultisigPreImg, pksFromAddresses } from './multisig.js';
import { SignedTransaction } from './signedTransaction.js';
import {
  AddressWithDelegatedLsigSigner,
  AddressWithMxBytesSigner,
  AddressWithProgramDataSigner,
  AddressWithTransactionSigner,
  DelegatedLsigSigner,
  MxBytesSigner,
  ProgramDataSigner,
  TransactionSigner,
} from './signer.js';
import { SIGN_BYTES_PREFIX } from './signing.js';
import { Transaction } from './transaction.js';
import {
  EncodedMultisig,
  EncodedSubsig,
} from './types/transactions/encoded.js';
import { arrayEqual, concatArrays } from './utils/utils.js';

export interface Ed25519SigningKey {
  ed25519PublicKey: Uint8Array;
  ed25519Signer: (bytesToSign: Uint8Array) => Promise<Uint8Array>;
}

export function addressWithSignersFromRawEd25519Signer(
  ed25519SigningKey: Ed25519SigningKey,
  sendingAddress: Address = new Address(ed25519SigningKey.ed25519PublicKey)
): AddressWithTransactionSigner &
  AddressWithDelegatedLsigSigner &
  AddressWithMxBytesSigner &
  AddressWithProgramDataSigner {
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
        sgnr: txn.sender.equals(authAddress) ? undefined : authAddress,
      });

      stxns.push(stxn);
    }

    return stxns.map((stxn) => encodeMsgpack(stxn));
  };

  const delegatedLsigSigner: DelegatedLsigSigner = async (lsig, msig) => {
    if (msig) {
      const pks = pksFromAddresses(msig.addrs);

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

  const programDataSigner: ProgramDataSigner = async (data, lsig) => {
    const parts = concatArrays(lsig.address().publicKey, data);
    const toBeSigned = concatArrays(SIGN_PROGRAM_DATA_PREFIX, parts);
    return rawSigner(toBeSigned);
  };

  return {
    address: sendingAddress,
    programDataSigner,
    txnSigner,
    delegatedLsigSigner,
    mxBytesSigner,
  };
}
