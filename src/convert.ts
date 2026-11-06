const MICROALGOS_TO_ALGOS_RATIO = 1e6;
const MICROALGOS_TO_ALGOS_RATIO_BIGINT = 1_000_000n;

export const INVALID_MICROALGOS_ERROR_MSG =
  'Microalgos should be positive and less than 2^53 - 1.';

/**
 * microalgosToAlgos converts microalgos to algos
 * @param microalgos - number or bigint
 * @returns number
 */
export function microalgosToAlgos(microalgos: number | bigint): number {
  if (typeof microalgos === 'bigint') {
    if (microalgos < 0n) {
      throw new Error(INVALID_MICROALGOS_ERROR_MSG);
    }
    return Number(microalgos) / MICROALGOS_TO_ALGOS_RATIO;
  }
  if (typeof microalgos === 'number') {
    if (microalgos < 0 || !Number.isSafeInteger(microalgos)) {
      throw new Error(INVALID_MICROALGOS_ERROR_MSG);
    }
    return microalgos / MICROALGOS_TO_ALGOS_RATIO;
  }
  throw new Error(INVALID_MICROALGOS_ERROR_MSG);
}

/**
 * algosToMicroalgos converts algos to microalgos
 * @param algos - number or bigint
 * @param returnBigInt - whether to return a bigint instead of a number
 * @returns number or bigint
 */
export function algosToMicroalgos(
  algos: number | bigint,
  returnBigInt: true
): bigint;
export function algosToMicroalgos(
  algos: number | bigint,
  returnBigInt?: false
): number;
export function algosToMicroalgos(
  algos: number | bigint,
  returnBigInt?: boolean
): number | bigint;
export function algosToMicroalgos(
  algos: number | bigint,
  returnBigInt = false
): number | bigint {
  if (typeof algos === 'bigint') {
    const microalgos = algos * MICROALGOS_TO_ALGOS_RATIO_BIGINT;
    return returnBigInt ? microalgos : Number(microalgos);
  }
  const microalgos = Math.round(algos * MICROALGOS_TO_ALGOS_RATIO);
  return returnBigInt ? BigInt(microalgos) : microalgos;
}
