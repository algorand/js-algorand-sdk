/* eslint-disable no-bitwise */
/**
 * Utilities for working with program bytes.
 */

const langspec = require('./langspec.json');

let opcodes;

const maxCost = 20000;
const maxLength = 1000;

function parseUvarint(array) {
  let x = 0;
  let s = 0;
  for (let i = 0; i < array.length; i++) {
    const b = array[i];
    if (b < 0x80) {
      if (i > 9 || (i === 9 && b > 1)) {
        return [0, -(i + 1)];
      }
      return [x | (b << s), i + 1];
    }
    x += (b & 0x7f) << s;
    s += 7;
  }
  return [0, 0];
}

function readIntConstBlock(program, pc) {
  let size = 1;
  const parsed = parseUvarint(program.slice(pc + size));
  const numInts = parsed[0];
  let bytesUsed = parsed[1];
  if (bytesUsed <= 0) {
    throw new Error(`could not decode int const block size at pc=${pc + size}`);
  }
  const ints = [];
  size += bytesUsed;
  for (let i = 0; i < numInts; i++) {
    if (pc + size >= program.length) {
      throw new Error('intcblock ran past end of program');
    }
    let numberFound;
    [numberFound, bytesUsed] = parseUvarint(program.slice(pc + size));
    if (bytesUsed <= 0) {
      throw new Error(
        `could not decode int const[${i}] block size at pc=${pc + size}`
      );
    }
    ints.push(numberFound);
    size += bytesUsed;
  }
  return [size, ints];
}

function readByteConstBlock(program, pc) {
  let size = 1;
  const parsed = parseUvarint(program.slice(pc + size));
  const numInts = parsed[0];
  let bytesUsed = parsed[1];
  if (bytesUsed <= 0) {
    throw new Error(
      `could not decode []byte const block size at pc=${pc + size}`
    );
  }
  const byteArrays = [];
  size += bytesUsed;
  for (let i = 0; i < numInts; i++) {
    if (pc + size >= program.length) {
      throw new Error('bytecblock ran past end of program');
    }
    let itemLen;
    [itemLen, bytesUsed] = parseUvarint(program.slice(pc + size));
    if (bytesUsed <= 0) {
      throw new Error(
        `could not decode []byte] const[${i}] block size at pc=${pc + size}`
      );
    }
    size += bytesUsed;
    if (pc + size + itemLen > program.length) {
      throw new Error('bytecblock ran past end of program');
    }
    const byteArray = program.slice(pc + size, pc + size + itemLen);
    byteArrays.push(byteArray);
    size += itemLen;
  }
  return [size, byteArrays];
}

function readPushIntOp(program, pc) {
  let size = 1;
  const [numberFound, bytesUsed] = parseUvarint(program.slice(pc + size));
  if (bytesUsed <= 0) {
    throw new Error(`could not decode push int const at pc=${pc + size}`);
  }
  size += bytesUsed;
  return [size, numberFound];
}

function readPushByteOp(program, pc) {
  let size = 1;
  const [itemLen, bytesUsed] = parseUvarint(program.slice(pc + size));
  if (bytesUsed <= 0) {
    throw new Error(
      `could not decode push []byte const size at pc=${pc + size}`
    );
  }
  size += bytesUsed;
  if (pc + size + itemLen > program.length) {
    throw new Error('pushbytes ran past end of program');
  }
  const byteArray = program.slice(pc + size, pc + size + itemLen);
  size += itemLen;
  return [size, byteArray];
}

/** readProgram validates program for length and running cost,
 * and additionally provides the found int variables and byte blocks
 * @param {Uint8Array} program Program to check
 * @param {[Uint8Array]} args Program arguments as array of Uint8Array arrays
 * @throws {Error}
 * @returns {[Uint8Array, [Uint8Array], boolean]}
 */
function readProgram(program, args) {
  const intcblockOpcode = 32;
  const bytecblockOpcode = 38;
  const pushbytesOpcode = 128;
  const pushintOpcode = 129;

  if (!program) {
    throw new Error('empty program');
  }

  if (typeof args === 'undefined') {
    // eslint-disable-next-line no-param-reassign
    args = [];
  }
  if (!Array.isArray(args)) {
    throw new Error('invalid arguments');
  }

  const [version, vlen] = parseUvarint(program);
  if (vlen <= 0) {
    throw new Error('version parsing error');
  }
  if (version > langspec.EvalMaxVersion) {
    throw new Error('unsupported version');
  }

  let cost = 0;
  let { length } = program;
  for (const arg of args) {
    length += arg.length;
  }
  if (length > maxLength) {
    throw new Error('program too long');
  }

  if (!opcodes) {
    opcodes = {};
    for (const op of langspec.Ops) {
      opcodes[op.Opcode] = op;
    }
  }

  let pc = vlen;
  let ints = [];
  let byteArrays = [];
  while (pc < program.length) {
    const op = opcodes[program[pc]];
    if (op === undefined) {
      throw new Error('invalid instruction');
    }

    cost += op.Cost;
    let size = op.Size;
    if (size === 0) {
      switch (op.Opcode) {
        case intcblockOpcode: {
          let foundInts;
          [size, foundInts] = readIntConstBlock(program, pc);
          ints = ints.concat(foundInts);
          break;
        }
        case bytecblockOpcode: {
          let foundByteArrays;
          [size, foundByteArrays] = readByteConstBlock(program, pc);
          byteArrays = byteArrays.concat(foundByteArrays);
          break;
        }
        case pushintOpcode: {
          let foundInt;
          [size, foundInt] = readPushIntOp(program, pc);
          ints.push(foundInt);
          break;
        }
        case pushbytesOpcode: {
          let foundByteArray;
          [size, foundByteArray] = readPushByteOp(program, pc);
          byteArrays.push(foundByteArray);
          break;
        }
        default: {
          throw new Error('invalid instruction');
        }
      }
    }
    pc += size;
  }

  if (cost > maxCost) {
    throw new Error('program too costly to run');
  }

  return [ints, byteArrays, true];
}

/**
 * checkProgram validates program for length and running cost
 * @param {Uint8Array} program Program to check
 * @param {[Uint8Array]} args Program arguments as array of Uint8Array arrays
 * @throws {Error}
 * @returns {boolean} true if success
 */
function checkProgram(program, args) {
  const [, , success] = readProgram(program, args);
  return success;
}

function checkIntConstBlock(program, pc) {
  const [size] = readIntConstBlock(program, pc);
  return size;
}

function checkByteConstBlock(program, pc) {
  const [size] = readByteConstBlock(program, pc);
  return size;
}

function checkPushIntOp(program, pc) {
  const [size] = readPushIntOp(program, pc);
  return size;
}

function checkPushByteOp(program, pc) {
  const [size] = readPushByteOp(program, pc);
  return size;
}

module.exports = {
  checkProgram,
  readProgram,
  parseUvarint,
  checkIntConstBlock,
  checkByteConstBlock,
  checkPushIntOp,
  checkPushByteOp,
  langspecEvalMaxVersion: langspec.EvalMaxVersion,
  langspecLogicSigVersion: langspec.LogicSigVersion,
};
