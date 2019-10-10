let assert = require('assert');
let nacl = require("../src/nacl/naclWrappers");
let address = require("../src/encoding/address");
let passphrase = require("../src/mnemonic/mnemonic");
let encoding = require('../src/encoding/encoding');
let logicsig = require("../src/logicsig");
let logic = require("../src/logic/logic");
let utils = require("../src/utils/utils");

describe('LogicSig functionality', function () {
    describe('Basic logic sig', function () {
        it('should work on valid program', function () {
            let program = Uint8Array.from("\x01\x20\x01\x01\x22");
            let programHash = "6Z3C3LDVWGMX23BMSYMANACQOSINPFIRF77H7N3AWJZYV6OH6GWTJKVMXY";
            let pk = address.decode(programHash).publicKey;
            let lsig = new logic.LogicSig(program);
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
            lsig = new logic.LogicSig(program, args);
            assert.equal(lsig.logic, program);
            assert.equal(lsig.args, args);
            assert.equal(lsig.sig, undefined);
            assert.equal(lsig.msig, undefined);

            verified = lsig.verify(pk);
            assert.equal(verified, true);

            // check serialization
            let encoded = lsig.toByte();
            let decoded = logic.LogicSig.from_obj_for_encoding(encoded);
            assert.deepStrictEqual(decoded, lsig);

        });
        it('should fail on tampered program', function () {
            let program = Uint8Array.from("\x01\x20\x01\x01\x22");
            let programHash = "6Z3C3LDVWGMX23BMSYMANACQOSINPFIRF77H7N3AWJZYV6OH6GWTJKVMXY";
            let pk = address.decode(programHash).publicKey;

            program[3] = 2;
            let lsig = new logic.LogicSig(program);
            let verified = lsig.verify(pk);
            assert.equal(verified, false);
        });
        it('should fail on invalid program', function () {
            let program = Uint8Array.from("\x01\x20\x01\x01\x22");
            program[0] = 2;
            assert.throws(
                () => logic.LogicSig(program)
            );
        });
    });
});

describe('Logic validation', function () {
    describe('Variant', function () {
        it('should parse binary data correctly', function () {
            let data = Uint8Array.from("\x01");
            let [value, length] = logic.parseUvariant(data);
            assert.equal(length, 1);
            assert.equal(value, 1);

            data = Uint8Array.from("\x7b");
            [value, length] = logic.parseUvariant(data);
            assert.equal(length, 1);
            assert.equal(value, 123);

            data = Uint8Array.from("\xc8\x03");
            [value, length] = logic.parseUvariant(data);
            assert.equal(length, 2);
            assert.equal(value, 456);
        });
    });
    describe('Const blocks', function () {
        it('should parse int const block correctly', function () {
            let data = Uint8Array.from("\x20\x05\x00\x01\xc8\x03\x7b\x02");
            let size = logic.checkIntConstBlock(data, 0);
            assert.equal(size, data.length);
        });
        it('should parse bytes const block correctly', function () {
            let data = Uint8Array.from("\x26\x02\x0d\x31\x32\x33\x34\x35\x36\x37\x38\x39\x30\x31\x32\x33\x02\x01\x02");
            let size = logic.checkByteConstBlock(data, 0);
            assert.equal(size, data.length);
        });
    });
    describe('Program checker', function () {
        it('should assess correct programs right', function () {
            let program = Uint8Array.from("\x01\x20\x01\x01\x22");
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
                "empty program"
            );
            let program = Uint8Array.from("\x01\x20\x01\x01\x22");
            assert.throws(
                () => logic.checkProgram(program, [Uint8Array.from("a" * 1000)]),
                "program too long"
            );

            program = utils.concatArrays(program, Uint8Array.from("\x22" * 1000));
            assert.throws(
                () => logic.checkProgram(program),
                "program too long"
            );
        });
        it('should fail on invalid program', function () {
            let program = Uint8Array.from("\x01\x20\x01\x01\x22\x80");
            assert.throws(
                () => logic.checkProgram(program),
                "invalid instruction"
            );
        });
        it('should fail on costly program', function () {
            let program = Uint8Array.from("\x01\x26\x01\x01\x01\x28\x22");  // byte 0x01 + keccak256
            let result = logic.checkProgram(program);
            assert.equal(result, true);

            // 10x keccak256 more is fine
            program = utils.concatArrays(program, Uint8Array.from("\x02" * 10));
            result = logic.checkProgram(program);
            assert.equal(result, true);

            // 800x keccak256 more is to costly
            program = utils.concatArrays(program, Uint8Array.from("\x02" * 800));
            assert.throws(
                () => logic.checkProgram(program),
                "program too costly to run"
            );
        });
    });
});