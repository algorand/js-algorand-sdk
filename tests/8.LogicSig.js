const assert = require('assert');
const address = require("../src/encoding/address");
const encoding = require("../src/encoding/encoding");
const logicsig = require("../src/logicsig");
const logic = require("../src/logic/logic");
const transaction = require("../src/transaction");
const utils = require("../src/utils/utils");
const splitTemplate = require("../src/logicTemplates/split");
const htlcTemplate = require("../src/logicTemplates/htlc");
const limitOrderTemplate = require("../src/logicTemplates/limitorder");
const periodicPaymentTemplate = require("../src/logicTemplates/periodicpayment");
const dynamicFeeTemplate = require("../src/logicTemplates/dynamicfee");

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
    describe('Varint', function () {
        it('should parse binary data correctly', function () {
            let data = Uint8Array.from([1]);
            let [value, length] = logic.parseUvarint(data);
            assert.equal(length, 1);
            assert.equal(value, 1);

            data = Uint8Array.from([123]);
            [value, length] = logic.parseUvarint(data);
            assert.equal(length, 1);
            assert.equal(value, 123);

            data = Uint8Array.from([200, 3]);
            [value, length] = logic.parseUvarint(data);
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
            result = logic.checkProgram(program, [Uint8Array.from("a" * 10)]);
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


describe('Template logic validation', function () {
    describe('Split', function () {
        it('should match the goldens', function () {
            // Inputs
            let owner = "WO3QIJ6T4DZHBX5PWJH26JLHFSRT7W7M2DJOULPXDTUS6TUX7ZRIO4KDFY";
            let receivers = ["W6UUUSEAOGLBHT7VFT4H2SDATKKSG6ZBUIJXTZMSLW36YS44FRP5NVAU7U", "XCIBIN7RT4ZXGBMVAMU3QS6L5EKB7XGROC5EPCNHHYXUIBAA5Q6C5Y7NEU"];
            let ratn = 30;
            let ratd = 100; // receiverOne gets 30/100 of whatever is sent to contract address
            let expiryRound = 123456;
            let minPay = 10000;
            let maxFee = 5000000;
            let split = new splitTemplate.Split(owner, receivers[0], receivers[1], ratn, ratd, expiryRound, minPay, maxFee);
            // Outputs
            let goldenProgram = "ASAIAcCWsQICAMDEBx5kkE4mAyCztwQn0+DycN+vsk+vJWcsoz/b7NDS6i33HOkvTpf+YiC3qUpIgHGWE8/1LPh9SGCalSN7IaITeeWSXbfsS5wsXyC4kBQ38Z8zcwWVAym4S8vpFB/c0XC6R4mnPi9EBADsPDEQIhIxASMMEDIEJBJAABkxCSgSMQcyAxIQMQglEhAxAiEEDRAiQAAuMwAAMwEAEjEJMgMSEDMABykSEDMBByoSEDMACCEFCzMBCCEGCxIQMwAIIQcPEBA=";
            let goldenBytes = Buffer.from(goldenProgram, 'base64');
            let actualBytes = split.getProgram();
            assert.deepStrictEqual(goldenBytes, actualBytes);
            let goldenAddress = "KPYGWKTV7CKMPMTLQRNGMEQRSYTYDHUOFNV4UDSBDLC44CLIJPQWRTCPBU";
            assert.deepStrictEqual(goldenAddress, split.getAddress());
        });
    });
    describe('HTLC', function () {
        it('should match the goldens', function () {
            // Inputs
            let owner = "726KBOYUJJNE5J5UHCSGQGWIBZWKCBN4WYD7YVSTEXEVNFPWUIJ7TAEOPM";
            let receiver = "42NJMHTPFVPXVSDGA6JGKUV6TARV5UZTMPFIREMLXHETRKIVW34QFSDFRE";
            let hashFn = "sha256";
            let hashImg = "f4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGk=";
            let expiryRound = 600000;
            let maxFee = 1000;
            let htlc = new htlcTemplate.HTLC(owner, receiver, hashFn, hashImg, expiryRound, maxFee);
            // Outputs
            let goldenProgram = "ASAE6AcBAMDPJCYDIOaalh5vLV96yGYHkmVSvpgjXtMzY8qIkYu5yTipFbb5IH+DsWV/8fxTuS3BgUih1l38LUsfo9Z3KErd0gASbZBpIP68oLsUSlpOp7Q4pGgayA5soQW8tgf8VlMlyVaV9qITMQEiDjEQIxIQMQcyAxIQMQgkEhAxCSgSLQEpEhAxCSoSMQIlDRAREA==";
            let goldenBytes = Buffer.from(goldenProgram, 'base64');
            let actualBytes = htlc.getProgram();
            assert.deepStrictEqual(goldenBytes, actualBytes);
            let goldenAddress = "KNBD7ATNUVQ4NTLOI72EEUWBVMBNKMPHWVBCETERV2W7T2YO6CVMLJRBM4";
            assert.deepStrictEqual(goldenAddress, htlc.getAddress());
        });
    });
    describe('Limit Order', function () {
        it('should match the goldens', function () {
            // Inputs
            let owner = "726KBOYUJJNE5J5UHCSGQGWIBZWKCBN4WYD7YVSTEXEVNFPWUIJ7TAEOPM";
            let assetid = 12345;
            let ratn = 30;
            let ratd = 100;
            let expiryRound = 123456;
            let minTrade = 10000;
            let maxFee = 5000000;
            let limitOrder = new limitOrderTemplate.LimitOrder(owner, assetid, ratn, ratd, expiryRound, minTrade, maxFee);
            // Outputs
            let goldenProgram = "ASAKAAHAlrECApBOBLlgZB7AxAcmASD+vKC7FEpaTqe0OKRoGsgObKEFvLYH/FZTJclWlfaiEzEWIhIxECMSEDEBJA4QMgQjEkAAVTIEJRIxCCEEDRAxCTIDEhAzARAhBRIQMwERIQYSEDMBFCgSEDMBEzIDEhAzARIhBx01AjUBMQghCB01BDUDNAE0Aw1AACQ0ATQDEjQCNAQPEEAAFgAxCSgSMQIhCQ0QMQcyAxIQMQgiEhAQ";
            let goldenBytes = Buffer.from(goldenProgram, 'base64');
            let actualBytes = limitOrder.getProgram();
            assert.deepStrictEqual(goldenBytes, actualBytes);
            let goldenAddress = "LXQWT2XLIVNFS54VTLR63UY5K6AMIEWI7YTVE6LB4RWZDBZKH22ZO3S36I";
            assert.deepStrictEqual(goldenAddress, limitOrder.getAddress());
        });
    });
    describe('Periodic payment', function () {
        it('should match the goldens', function () {
            // Inputs
            let receiver = "SKXZDBHECM6AS73GVPGJHMIRDMJKEAN5TUGMUPSKJCQ44E6M6TC2H2UJ3I";
            let leaseb64 = "AQIDBAUGBwgBAgMEBQYHCAECAwQFBgcIAQIDBAUGBwg=";
            let amount = 500000;
            let withdrawalWindow = 95;
            let period = 100;
            let expiryRound = 2445756;
            let maxFee = 1000;
            let periodicPayment = new periodicPaymentTemplate.PeriodicPayment(receiver, amount, withdrawalWindow, period, expiryRound, maxFee, leaseb64);
            // Outputs
            let goldenProgram = "ASAHAegHZABfoMIevKOVASYCIAECAwQFBgcIAQIDBAUGBwgBAgMEBQYHCAECAwQFBgcIIJKvkYTkEzwJf2arzJOxERsSogG9nQzKPkpIoc4TzPTFMRAiEjEBIw4QMQIkGCUSEDEEIQQxAggSEDEGKBIQMQkyAxIxBykSEDEIIQUSEDEJKRIxBzIDEhAxAiEGDRAxCCUSEBEQ";
            let goldenBytes = Buffer.from(goldenProgram, 'base64');
            let actualBytes = periodicPayment.getProgram();
            assert.deepStrictEqual(goldenBytes, actualBytes);
            let goldenAddress = "JMS3K4LSHPULANJIVQBTEDP5PZK6HHMDQS4OKHIMHUZZ6OILYO3FVQW7IY";
            assert.deepStrictEqual(goldenAddress, periodicPayment.getAddress());
            let goldenGenesisHash = "f4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGk=";
            let goldenStx = "gqRsc2lngaFsxJkBIAcB6AdkAF+gwh68o5UBJgIgAQIDBAUGBwgBAgMEBQYHCAECAwQFBgcIAQIDBAUGBwggkq+RhOQTPAl/ZqvMk7ERGxKiAb2dDMo+SkihzhPM9MUxECISMQEjDhAxAiQYJRIQMQQhBDECCBIQMQYoEhAxCTIDEjEHKRIQMQghBRIQMQkpEjEHMgMSEDECIQYNEDEIJRIQERCjdHhuiaNhbXTOAAehIKNmZWXOAAQDWKJmds0EsKJnaMQgf4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGmibHbNBQ+ibHjEIAECAwQFBgcIAQIDBAUGBwgBAgMEBQYHCAECAwQFBgcIo3JjdsQgkq+RhOQTPAl/ZqvMk7ERGxKiAb2dDMo+SkihzhPM9MWjc25kxCBLJbVxcjvosDUorAMyDf1+VeOdg4S45R0MPTOfOQvDtqR0eXBlo3BheQ==";
            let goldenStxBlob = Buffer.from(goldenStx, 'base64');
            let stx = periodicPaymentTemplate.getPeriodicPaymentWithdrawalTransaction(actualBytes, 1200, goldenGenesisHash);
            let expectedDict = encoding.decode(goldenStxBlob);
            let actualDict = encoding.decode(stx['blob']);
            assert.deepEqual(expectedDict, actualDict);
        });
    });
    describe('Dynamic Fee', function () {
        it('should match the goldens', function () {
            // Inputs
            let receiver = "726KBOYUJJNE5J5UHCSGQGWIBZWKCBN4WYD7YVSTEXEVNFPWUIJ7TAEOPM";
            let amount = 5000;
            let firstValid = 12345;
            let lastValid = 12346;
            let closeRemainder = "42NJMHTPFVPXVSDGA6JGKUV6TARV5UZTMPFIREMLXHETRKIVW34QFSDFRE";
            let artificialLease = "f4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGk=";
            let leaseBytes = new Uint8Array(Buffer.from(artificialLease, 'base64'));
            let dynamicFee = new dynamicFeeTemplate.DynamicFee(receiver, amount, firstValid, lastValid, closeRemainder, leaseBytes);
            // Outputs
            let goldenProgram = "ASAFAgGIJ7lgumAmAyD+vKC7FEpaTqe0OKRoGsgObKEFvLYH/FZTJclWlfaiEyDmmpYeby1feshmB5JlUr6YI17TM2PKiJGLuck4qRW2+SB/g7Flf/H8U7ktwYFIodZd/C1LH6PWdyhK3dIAEm2QaTIEIhIzABAjEhAzAAcxABIQMwAIMQESEDEWIxIQMRAjEhAxBygSEDEJKRIQMQgkEhAxAiUSEDEEIQQSEDEGKhIQ";
            let goldenBytes = Buffer.from(goldenProgram, 'base64');
            let actualBytes = dynamicFee.getProgram();
            assert.deepStrictEqual(goldenBytes, actualBytes);
            let goldenAddress = "GCI4WWDIWUFATVPOQ372OZYG52EULPUZKI7Y34MXK3ZJKIBZXHD2H5C5TI";
            assert.deepStrictEqual(goldenAddress, dynamicFee.getAddress());
            let privateKeyOneB64 = "cv8E0Ln24FSkwDgGeuXKStOTGcze5u8yldpXxgrBxumFPYdMJymqcGoxdDeyuM8t6Kxixfq0PJCyJP71uhYT7w==";
            let privateKeyOne = Buffer.from(privateKeyOneB64, 'base64');
            let goldenGenesisHash = "f4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGk=";
            let txnAndLsig = dynamicFee.signDynamicFee(privateKeyOne, goldenGenesisHash);
            let txnDict = txnAndLsig['txn'];
            let txnObj = new transaction.Transaction(txnDict);
            let txnBytes = txnObj.toByte();
            let goldenTxn = "iqNhbXTNE4ilY2xvc2XEIOaalh5vLV96yGYHkmVSvpgjXtMzY8qIkYu5yTipFbb5o2ZlZc0D6KJmds0wOaJnaMQgf4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGmibHbNMDqibHjEIH+DsWV/8fxTuS3BgUih1l38LUsfo9Z3KErd0gASbZBpo3JjdsQg/ryguxRKWk6ntDikaBrIDmyhBby2B/xWUyXJVpX2ohOjc25kxCCFPYdMJymqcGoxdDeyuM8t6Kxixfq0PJCyJP71uhYT76R0eXBlo3BheQ==";
            assert.deepStrictEqual(new Uint8Array(Buffer.from(goldenTxn, 'base64')), txnBytes);
            let lsig = txnAndLsig['lsig'];
            let lsigBytes = lsig.toByte();
            let goldenLsig = "gqFsxLEBIAUCAYgnuWC6YCYDIP68oLsUSlpOp7Q4pGgayA5soQW8tgf8VlMlyVaV9qITIOaalh5vLV96yGYHkmVSvpgjXtMzY8qIkYu5yTipFbb5IH+DsWV/8fxTuS3BgUih1l38LUsfo9Z3KErd0gASbZBpMgQiEjMAECMSEDMABzEAEhAzAAgxARIQMRYjEhAxECMSEDEHKBIQMQkpEhAxCCQSEDECJRIQMQQhBBIQMQYqEhCjc2lnxEAhLNdfdDp9Wbi0YwsEQCpP7TVHbHG7y41F4MoESNW/vL1guS+5Wj4f5V9fmM63/VKTSMFidHOSwm5o+pbV5lYH";
            assert.deepStrictEqual(new Uint8Array(Buffer.from(goldenLsig, 'base64')), lsigBytes);
            let privateKeyTwoB64 = "2qjz96Vj9M6YOqtNlfJUOKac13EHCXyDty94ozCjuwwriI+jzFgStFx9E6kEk1l4+lFsW4Te2PY1KV8kNcccRg==";
            let privateKeyTwo = Buffer.from(privateKeyTwoB64, 'base64');
            let stxns = dynamicFeeTemplate.getDynamicFeeTransactions(txnDict, lsig, privateKeyTwo, 1234, firstValid, lastValid);
            let goldenStxns = "gqRsc2lngqFsxLEBIAUCAYgnuWC6YCYDIP68oLsUSlpOp7Q4pGgayA5soQW8tgf8VlMlyVaV9qITIOaalh5vLV96yGYHkmVSvpgjXtMzY8qIkYu5yTipFbb5IH+DsWV/8fxTuS3BgUih1l38LUsfo9Z3KErd0gASbZBpMgQiEjMAECMSEDMABzEAEhAzAAgxARIQMRYjEhAxECMSEDEHKBIQMQkpEhAxCCQSEDECJRIQMQQhBBIQMQYqEhCjc2lnxEAhLNdfdDp9Wbi0YwsEQCpP7TVHbHG7y41F4MoESNW/vL1guS+5Wj4f5V9fmM63/VKTSMFidHOSwm5o+pbV5lYHo3R4boujYW10zROIpWNsb3NlxCDmmpYeby1feshmB5JlUr6YI17TM2PKiJGLuck4qRW2+aNmZWXOAAWq6qJmds0wOaJnaMQgf4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGmjZ3JwxCBRpaRVpA3ImXU4/ENcrzp+jsooLVHC7bF5kCGUK0KORaJsds0wOqJseMQgf4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGmjcmN2xCD+vKC7FEpaTqe0OKRoGsgObKEFvLYH/FZTJclWlfaiE6NzbmTEIIU9h0wnKapwajF0N7K4zy3orGLF+rQ8kLIk/vW6FhPvpHR5cGWjcGF5gqNzaWfEQAilsGaC4M4zfYN5QpvREdHEC0DjI2ZWCXSIwwyUWHg2dzd5gKR2Cqu+iUmiCU1hOTTiOump3PILTgWeG0ZkUAajdHhuiqNhbXTOAAWq6qNmZWXOAATzvqJmds0wOaJnaMQgf4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGmjZ3JwxCBRpaRVpA3ImXU4/ENcrzp+jsooLVHC7bF5kCGUK0KORaJsds0wOqJseMQgf4OxZX/x/FO5LcGBSKHWXfwtSx+j1ncoSt3SABJtkGmjcmN2xCCFPYdMJymqcGoxdDeyuM8t6Kxixfq0PJCyJP71uhYT76NzbmTEICuIj6PMWBK0XH0TqQSTWXj6UWxbhN7Y9jUpXyQ1xxxGpHR5cGWjcGF5";
            let goldenStxnBytes = Buffer.from(goldenStxns, 'base64');
            assert.deepStrictEqual(new Uint8Array(goldenStxnBytes), stxns);
        });
    });
});
