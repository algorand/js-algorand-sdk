let assert = require('assert');
let address = require("../src/encoding/address");
let logicsig = require("../src/logicsig");
let logic = require("../src/logic/logic");
let utils = require("../src/utils/utils");

describe('LogicSig functionality', function () {
    describe('Basic logic sig', function () {
        it('should work on valid program', function () {
            let program = Uint8Array.from([1, 32, 1, 1, 34]);
            let programHash = "6Z3C3LDVWGMX23BMSYMANACQOSINPFIRF77H7N3AWJZYV6OH6GWTJKVMXY";
            let pk = address.decode(programHash).publicKey;
            let lsig = new logicsig.LogicSig(program);
            assert.equal(lsig.logic, program);
            assert.equal(lsig.args, undefined);
            assert.equal(lsig.sig, undefined);
            assert.equal(lsig.msig, undefined);
            assert.equal(lsig.address(), programHash);

            let verified = lsig.verify(pk);
            assert.equal(verified, true);

            let args = [
                Uint8Array.from([1, 2, 3]),
                Uint8Array.from([4, 5, 6])
            ];
            lsig = new logicsig.LogicSig(program, args);
            assert.equal(lsig.logic, program);
            assert.equal(lsig.args, args);
            assert.equal(lsig.sig, undefined);
            assert.equal(lsig.msig, undefined);

            verified = lsig.verify(pk);
            assert.equal(verified, true);

            // check serialization
            let encoded = lsig.toByte();
            let decoded = logicsig.LogicSig.fromByte(encoded);
            assert.deepStrictEqual(decoded, lsig);

        });
        it('should fail on tampered program', function () {
            let program = Uint8Array.from([1, 32, 1, 1, 34]);
            let programHash = "6Z3C3LDVWGMX23BMSYMANACQOSINPFIRF77H7N3AWJZYV6OH6GWTJKVMXY";
            let pk = address.decode(programHash).publicKey;

            program[3] = 2;
            let lsig = new logicsig.LogicSig(program);
            let verified = lsig.verify(pk);
            assert.equal(verified, false);
        });
        it('should fail on invalid program', function () {
            let program = Uint8Array.from([1, 32, 1, 1, 34]);
            program[0] = 2;
            assert.throws(
                () => logicsig.LogicSig(program)
            );
        });
    });
});

describe('Logic validation', function () {
    describe('Variant', function () {
        it('should parse binary data correctly', function () {
            let data = Uint8Array.from([1]);
            let [value, length] = logic.parseUvariant(data);
            assert.equal(length, 1);
            assert.equal(value, 1);

            data = Uint8Array.from([123]);
            [value, length] = logic.parseUvariant(data);
            assert.equal(length, 1);
            assert.equal(value, 123);

            data = Uint8Array.from([200, 3]);
            [value, length] = logic.parseUvariant(data);
            assert.equal(length, 2);
            assert.equal(value, 456);
        });
    });
    describe('Const blocks', function () {
        it('should parse int const block correctly', function () {
            let data = Uint8Array.from([32, 5, 0, 1, 200, 3, 123, 2]);
            let size = logic.checkIntConstBlock(data, 0);
            assert.equal(size, data.length);
        });
        it('should parse bytes const block correctly', function () {
            let data = Uint8Array.from([38, 2, 13, 49, 50, 51, 52, 53, 54, 55, 56, 57, 48, 49, 50, 51, 2, 1, 2]);
            let size = logic.checkByteConstBlock(data, 0);
            assert.equal(size, data.length);
        });
    });
    describe('Program checker', function () {
        it('should assess correct programs right', function () {
            let program = Uint8Array.from([1, 32, 1, 1, 34]);
            let result = logic.checkProgram(program);
            assert.equal(result, true);

            result = logic.checkProgram(program, [Uint8Array.from("a" * 10)]);
            assert.equal(result, true);

            program = utils.concatArrays(program, Uint8Array.from("\x22" * 10));
            assert.equal(result, true);
        });
        it('should fail on long input', function () {
            assert.throws(
                () => logic.checkProgram(),
                new Error("empty program")
            );
            let program = Uint8Array.from([1, 32, 1, 1, 34]);
            assert.throws(
                () => logic.checkProgram(program, [new Uint8Array(1000).fill(55)]),
                new Error("program too long")
            );

            program = utils.concatArrays(program, new Uint8Array(1000).fill(34));
            assert.throws(
                () => logic.checkProgram(program),
                new Error("program too long")
            );
        });
        it('should fail on invalid program', function () {
            let program = Uint8Array.from([1, 32, 1, 1, 34, 128]);
            assert.throws(
                () => logic.checkProgram(program),
                new Error("invalid instruction")
            );
        });
        it('should fail on invalid args', function () {
            let program = Uint8Array.from([1, 32, 1, 1, 34]);
            assert.throws(
                () => logic.checkProgram(program, "123"),
                new Error("invalid arguments")
            );
        });
        it('should fail on costly program', function () {
            let program = Uint8Array.from([1, 38, 1, 1, 1, 40, 2]);  // byte 0x01 + keccak256
            let result = logic.checkProgram(program);
            assert.equal(result, true);

            // 10x keccak256 more is fine
            program = utils.concatArrays(program, new Uint8Array(10).fill(2));
            result = logic.checkProgram(program);
            assert.equal(result, true);

            // 800x keccak256 more is to costly
            program = utils.concatArrays(program, new Uint8Array(800).fill(2));
            assert.throws(
                () => logic.checkProgram(program),
                new Error("program too costly to run")
            );
        });
    });
});