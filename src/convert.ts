import { encode, decode } from 'bs58';

const MICROALGOS_TO_ALGOS_RATIO = 1e6;
export const INVALID_MICROALGOS_ERROR_MSG =
  'Microalgos should be positive and less than 2^53 - 1.';

/**
 * microalgosToAlgos converts microalgos to algos
 * @param microalgos - number
 * @returns number
 */
export function microalgosToAlgos(microalgos: number) {
  if (microalgos < 0 || !Number.isSafeInteger(microalgos)) {
    throw new Error(INVALID_MICROALGOS_ERROR_MSG);
  }
  return microalgos / MICROALGOS_TO_ALGOS_RATIO;
}

/**
 * algosToMicroalgos converts algos to microalgos
 * @param algos - number
 * @returns number
 */
export function algosToMicroalgos(algos: number) {
  const microalgos = algos * MICROALGOS_TO_ALGOS_RATIO;
  return Math.round(microalgos);
}

/**
 * Converts IPFS CID version 0 (Base58) to a 32 bytes hex string and adds initial 0x.
 * @param cid - The 46 character long IPFS CID V0 string (starts with Qm).
 * @returns string
 */
export function ipfsCidV0ToB32(cid: string) {
  if (cid.length !== 46 || cid.indexOf('Qm') !== 0) {
    throw new Error(
      `The CID: ${cid} is not an IPFS CID version 0 valid address. Version 1 is 46 characters long and starts with Qm.`
    );
  }
  return `0x${decode(cid).slice(2).toString('hex')}`;
}

/**
 * Converts 32 byte hex string (initial 0x is removed) to Base58 IPFS content identifier version 0 address string (starts with Qm)
 * @param str - The 32 byte long hex string to encode to IPFS CID V0 (without initial 0x).
 * @returns string 
 */
export function b32ToIpfsCidV0(str: string) {
  if (str.indexOf('0x') === 0) {
    str = str.slice(2)
  }
  return encode(Buffer.from(`1220${str}`, 'hex'));
}
