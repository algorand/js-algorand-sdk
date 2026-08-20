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

/**
 * An ed25519 public key paired with a function that signs raw bytes with the
 * corresponding secret key.
 *
 * @remarks
 * `ed25519Signer` receives the exact bytes to sign, with every
 * domain-separation prefix already applied, so it can be backed by a key that
 * never leaves a wallet, HSM or hardware device.
 */
export interface Ed25519SigningKey {
  /** The 32-byte ed25519 public key. */
  ed25519PublicKey: Uint8Array;
  /** Signs the given bytes verbatim with the corresponding secret key. */
  ed25519Signer: (bytesToSign: Uint8Array) => Promise<Uint8Array>;
}

/**
 * Build the full set of signers for an ed25519 key from a function that signs
 * raw bytes with it.
 *
 * @remarks
 * Each returned signer applies the domain separation its use requires
 * ("Program", "MsigProgram", "ProgData", or the transaction prefix) before
 * calling `ed25519Signer`, so a caller only has to supply the raw signing
 * operation once.
 *
 * @param ed25519SigningKey - The public key and raw signing function to build the signers from
 * @param sendingAddress - The address transactions are sent from. Defaults to
 *   the address of `ed25519PublicKey`; supply it when that key is the auth
 *   address of a rekeyed account, in which case the produced transactions carry
 *   the key's address in their `sgnr` field.
 * @returns An address bundled with transaction, delegated LogicSig, arbitrary
 *   bytes and program data signers
 */
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
