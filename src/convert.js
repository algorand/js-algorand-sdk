const MICROALGOS_TO_ALGOS_RATIO = 1e6;
const ERROR_INVALID_MICROALGOS = new Error("Microalgos should be positive and less than 2^53 - 1.");

/**
 * microalgosToAlgos converts microalgos to algos
 * @param microalgos number
 * @returns number
 */
function microalgosToAlgos(microalgos) {
    if (microalgos < 0 || !Number.isSafeInteger(microalgos)){
        throw ERROR_INVALID_MICROALGOS;
    }
    return microalgos/MICROALGOS_TO_ALGOS_RATIO
}

/**
 * algosToMicroalgos converts algos to microalgos
 * @param algos number
 * @returns number
 */
function algosToMicroalgos(algos) {
    let microalgos = algos*MICROALGOS_TO_ALGOS_RATIO;
    return Math.round(microalgos);
}

module.exports = {
    microalgosToAlgos,
    algosToMicroalgos,
    ERROR_INVALID_MICROALGOS,
};
