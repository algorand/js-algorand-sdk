/**
 Utilities for working with program bytes.
 */

const langspec = require("./langspec.json")

let opcodes;

const maxCost = 20000;
const maxLength = 1000;

/**
 * checkProgram validates program for length and running cost
 * @param {Uint8Array} program Program to check
 * @param {[Uint8Array]} args Program arguments as array of Uint8Array arrays
 * @throws {Error}
 * @returns {bool} true if success
 */
function checkProgram(program, args) {
    const intcblockOpcode = 32;
    const bytecblockOpcode = 38;
    if (!program) {
        throw new Error("empty program");
    }

    if (args == undefined) {
        args = []
    }
    if (!Array.isArray(args)) {
        throw new Error("invalid arguments");
    }

    let [version, vlen] = parseUvarint(program);
    if (vlen <= 0) {
        throw new Error("version parsing error");
    }
    if (version > langspec.EvalMaxVersion) {
        throw new Error("unsupported version");
    }

    let cost = 0;
    let length =program.length;
    for (let arg of args) {
        length += arg.length;
    }
    if (length > maxLength) {
        throw new Error("program too long");
    }

    if (!opcodes) {
        opcodes = {}
        for (let op of langspec.Ops) {
            opcodes[op.Opcode] = op;
        }
    }

    let pc = vlen;
    while (pc < program.length) {
        let op = opcodes[program[pc]];
        if (op === undefined) {
            throw new Error("invalid instruction");
        }

        cost += op.Cost;
        let size = op.Size;
        if (size == 0) {
            switch (op.Opcode) {
                case intcblockOpcode: {
                    size = checkIntConstBlock(program, pc);
                    break;
                }
                case bytecblockOpcode: {
                    size = checkByteConstBlock(program, pc);
                    break;
                }
                default: {
                    throw new Error("invalid instruction");
                }
            }
        }
        pc += size;
    }

    if (cost > maxCost) {
        throw new Error("program too costly to run");
    }

    return true;
}

function checkIntConstBlock(program, pc) {
    let size = 1;
    let [numInts, bytesUsed] = parseUvarint(program.slice(pc + size));
    if (bytesUsed <= 0) {
        throw new Error(`could not decode int const block size at pc=${pc + size}`);
    }

    size += bytesUsed;
    for (let i = 0; i < numInts; i++) {
        if (pc + size >= program.length) {
            throw new Error("intcblock ran past end of program");
        }
        [_, bytesUsed] = parseUvarint(program.slice(pc + size));
        if (bytesUsed <= 0) {
            throw new Error(`could not decode int const[${i}] block size at pc=${pc + size}`);
        }
        size += bytesUsed;
    }
    return size;
}

function checkByteConstBlock(program, pc) {
    let size = 1;
    let [numInts, bytesUsed] = parseUvarint(program.slice(pc + size));
    if (bytesUsed <= 0) {
        throw new Error(`could not decode []byte const block size at pc=${pc + size}`);
    }

    size += bytesUsed;
    for (let i = 0; i < numInts; i++) {
        if (pc + size >= program.length) {
            throw new Error("bytecblock ran past end of program");
        }
        let [itemLen, bytesUsed] = parseUvarint(program.slice(pc + size));
        if (bytesUsed <= 0) {
            throw new Error(`could not decode []byte] const[${i}] block size at pc=${pc + size}`);
        }
        size += bytesUsed;
        if (pc + size >= program.length) {
            throw new Error("bytecblock ran past end of program");
        }
        size += itemLen;
    }
    return size;
}

function parseUvarint(array) {
    let x = 0;
    let s = 0;
    for (let i = 0; i < array.length; i++) {
        b = array[i];
        if (b < 0x80) {
            if (i > 9 || i == 9 && b > 1) {
                return [0, -(i + 1)];
            }
            return [x | b << s, i + 1];
        }
        x += (b & 0x7f) << s;
        s += 7;
    }
    return [0, 0];
}

module.exports = {
    checkProgram,
    parseUvarint,
    checkIntConstBlock,
    checkByteConstBlock
};
