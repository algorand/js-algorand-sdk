/* eslint-disable no-bitwise */
/**
 * Utilities for working with program bytes.
 */

import langspec from './langspec.json';

/**
 * Langspec Op Structure
 */
interface OpStructure {
  Opcode: number;
  Name: string;
  Args?: string;
  Returns?: string;
  Cost: number;
  Size: number;
  ArgEnum?: string[];
  ArgEnumTypes?: string;
  Doc: string;
  DocExtra?: string;
  ImmediateNote?: string;
  Groups: string[];
}

let opcodes: {
  [key: number]: OpStructure;
};

const maxCost = 20000;
const maxLength = 1000;

export function parseUvarint(
  array: Uint8Array
): [numberFound: number, size: number] {
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

function readIntConstBlock(
  program: Uint8Array,
  pc: number
): [size: number, ints: number[]] {
  let size = 1;
  const parsed = parseUvarint(program.slice(pc + size));
  const numInts = parsed[0];
  let bytesUsed = parsed[1];
  if (bytesUsed <= 0) {
    throw new Error(`could not decode int const block size at pc=${pc + size}`);
  }
  const ints: number[] = [];
  size += bytesUsed;
  for (let i = 0; i < numInts; i++) {
    if (pc + size >= program.length) {
      throw new Error('intcblock ran past end of program');
    }
    let numberFound: number;
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

function readByteConstBlock(
  program: Uint8Array,
  pc: number
): [size: number, byteArrays: Uint8Array[]] {
  let size = 1;
  const parsed = parseUvarint(program.slice(pc + size));
  const numInts = parsed[0];
  let bytesUsed = parsed[1];
  if (bytesUsed <= 0) {
    throw new Error(
      `could not decode []byte const block size at pc=${pc + size}`
    );
  }
  const byteArrays: Uint8Array[] = [];
  size += bytesUsed;
  for (let i = 0; i < numInts; i++) {
    if (pc + size >= program.length) {
      throw new Error('bytecblock ran past end of program');
    }
    let itemLen: number;
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

function readPushIntOp(
  program: Uint8Array,
  pc: number
): [size: number, numberFound: number] {
  let size = 1;
  const [numberFound, bytesUsed] = parseUvarint(program.slice(pc + size));
  if (bytesUsed <= 0) {
    throw new Error(`could not decode push int const at pc=${pc + size}`);
  }
  size += bytesUsed;
  return [size, numberFound];
}

function readPushByteOp(
  program: Uint8Array,
  pc: number
): [size: number, byteArray: Uint8Array] {
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
 * @param program - Program to check
 * @param args - Program arguments as array of Uint8Array arrays
 * @throws
 * @returns
 */
export function readProgram(
  program: Uint8Array,
  args?: Uint8Array[]
): [ints: number[], byteArrays: Uint8Array[], valid: boolean] {
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
  let ints: number[] = [];
  let byteArrays: Uint8Array[] = [];
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
          let foundInts: number[];
          [size, foundInts] = readIntConstBlock(program, pc);
          ints = ints.concat(foundInts);
          break;
        }
        case bytecblockOpcode: {
          let foundByteArrays: Uint8Array[];
          [size, foundByteArrays] = readByteConstBlock(program, pc);
          byteArrays = byteArrays.concat(foundByteArrays);
          break;
        }
        case pushintOpcode: {
          let foundInt: number;
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
 * @param program - Program to check
 * @param args - Program arguments as array of Uint8Array arrays
 * @throws
 * @returns true if success
 */
export function checkProgram(program: Uint8Array, args: Uint8Array[]) {
  const [, , success] = readProgram(program, args);
  return success;
}

export function checkIntConstBlock(program: Uint8Array, pc: number) {
  const [size] = readIntConstBlock(program, pc);
  return size;
}

export function checkByteConstBlock(program: Uint8Array, pc: number) {
  const [size] = readByteConstBlock(program, pc);
  return size;
}

export function checkPushIntOp(program: Uint8Array, pc: number) {
  const [size] = readPushIntOp(program, pc);
  return size;
}

export function checkPushByteOp(program: Uint8Array, pc: number) {
  const [size] = readPushByteOp(program, pc);
  return size;
}

export const langspecEvalMaxVersion = langspec.EvalMaxVersion;
export const langspecLogicSigVersion = langspec.LogicSigVersion;
