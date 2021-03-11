const MICROALGOS_TO_ALGOS_RATIO = 1e6;
const INVALID_MICROALGOS_ERROR_MSG =
  'Microalgos should be positive and less than 2^53 - 1.';

/**
 * microalgosToAlgos converts microalgos to algos
 * @param microalgos number
 * @returns number
 */
function microalgosToAlgos(microalgos) {
  if (microalgos < 0 || !Number.isSafeInteger(microalgos)) {
    throw new Error(INVALID_MICROALGOS_ERROR_MSG);
  }
  return microalgos / MICROALGOS_TO_ALGOS_RATIO;
}

/**
 * algosToMicroalgos converts algos to microalgos
 * @param algos number
 * @returns number
 */
function algosToMicroalgos(algos) {
  const microalgos = algos * MICROALGOS_TO_ALGOS_RATIO;
  return Math.round(microalgos);
}

module.exports = {
  microalgosToAlgos,
  algosToMicroalgos,
  INVALID_MICROALGOS_ERROR_MSG,
};
