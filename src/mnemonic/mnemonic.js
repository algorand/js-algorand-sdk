const english = require("./wordlists/english");
const nacl = require("../nacl/naclWrappers");

const ERROR_FAIL_TO_DECODE_MNEMONIC = Error('failed to decode mnemonic');
const ERROR_NOT_IN_WORDS_LIST = Error('the mnemonic contains a word that is not in the wordlist');

/**
 * mnemonicFromSeed converts a 32-byte key into a 25 word mnemonic. The generated mnemonic includes a checksum.
 * Each word in the mnemonic represents 11 bits of data, and the last 11 bits are reserved for the checksum.
 * @param seed 32 bytes long seed
 * @returns {string} 25 words mnemonic
 */
function mnemonicFromSeed(seed) {
    // Sanity length check
    if (seed.length !== nacl.SEED_BTYES_LENGTH) {throw new RangeError("Seed length must be " +
        nacl.SEED_BTYES_LENGTH);}

    const uint11Array = toUint11Array(seed);
    const words = applyWords(uint11Array);
    const checksumWord = computeChecksum(seed);

    return words.join(' ') + ' ' + checksumWord;
}

/**
 * seedFromMnemonic converts a mnemonic generated using this library into the source key used to create it.
 * It returns an error if the passed mnemonic has an incorrect checksum, if the number of words is unexpected, or if one
 * of the passed words is not found in the words list.
 * @param mnemonic 25 words mnemonic
 * @returns {Uint8Array} 32 bytes long seed
 */
function seedFromMnemonic(mnemonic) {
    const words = mnemonic.split(' ');
    const key = words.slice(0, 24);

    //Check that all words are in list
    for (let w of key) {
        if (english.indexOf(w) === -1) throw ERROR_NOT_IN_WORDS_LIST;
    }

    const checksum = words[words.length - 1];
    const uint11Array = key.map(word => english.indexOf(word));

    // Convert the key to uint8Array
    let uint8Array = toUint8Array(uint11Array);

    // We need to chop the last byte -
    // the short explanation - Since 256 is not divisible by 11, we have an extra 0x0 byte.
    // The longer explanation - When splitting the 256 bits to chunks of 11, we get 23 words and a left over of 3 bits.
    // This left gets padded with another 8 bits to the create the 24th word.
    // While converting back to byte array, our new 264 bits array is divisible by 8 but the last byte is just the padding.

    // check that we have 33 bytes long array as expected
    if (uint8Array.length !== 33) throw ERROR_FAIL_TO_DECODE_MNEMONIC;

    // check that the last byte is actually 0x0
    if (uint8Array[uint8Array.length - 1] !== 0x0) throw ERROR_FAIL_TO_DECODE_MNEMONIC;

    // chop it !
    uint8Array = uint8Array.slice(0, uint8Array.length - 1);


    // compute checksum
    const cs = computeChecksum(uint8Array);

    // success!
    if (cs === checksum) return uint8Array;

    throw ERROR_FAIL_TO_DECODE_MNEMONIC;
}

function computeChecksum(seed) {
    const hashBuffer = nacl.genericHash(seed);
    const uint11Hash = toUint11Array(hashBuffer);
    const words = applyWords(uint11Hash);

    return words[0];
}

function applyWords(nums) {
    return nums.map(n => english[n]);
}


// https://stackoverflow.com/a/51452614
function toUint11Array(buffer8) {
    let buffer11 = [];
    let acc = 0;
    let accBits = 0;
    function add(octet) {
        acc = (octet << accBits) | acc;
        accBits += 8;
        if (accBits >=11) {
            buffer11.push( acc & 0x7ff);
            acc >>= 11;
            accBits -= 11;
        }
    }
    function flush() {
        if (accBits) {
            buffer11.push( acc);
        }
    }

    buffer8.forEach( add);
    flush();
    return buffer11;
}

// from Uint11Array
// https://stackoverflow.com/a/51452614
function toUint8Array(buffer11) {
    let buffer8 = [];
    let acc = 0;
    let accBits = 0;
    function add(ui11) {
        acc = (ui11 << accBits) | acc;
        accBits += 11;
        while (accBits >= 8) {
            buffer8.push( acc & 0xff);
            acc >>= 8;
            accBits -= 8;
        }
    }
    function flush() {
        if (accBits) {
            buffer8.push( acc);
        }
    }

    buffer11.forEach( add);
    flush();
    return new Uint8Array(buffer8);
}

module.exports = {mnemonicFromSeed, seedFromMnemonic, ERROR_FAIL_TO_DECODE_MNEMONIC, ERROR_NOT_IN_WORDS_LIST};