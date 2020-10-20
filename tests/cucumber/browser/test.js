const assert = require('assert');
const sha256 = require('js-sha256');
const nacl = require('tweetnacl');

window.assert = assert;
window.sha256 = sha256;
window.Buffer = Buffer;

window.keyPairFromSecretKey = function keyPairFromSecretKey(sk) {
    return nacl.sign.keyPair.fromSecretKey(sk);
}

window.keyPairFromSeed = function keyPairFromSeed(seed) {
    return nacl.sign.keyPair.fromSeed(seed);
}

window.loadResource = async function loadResource(resource) {
    const res = await fetch('/features/resources/' + resource);
    if (!res.ok) {
        throw new Error(`Failed to load resource (${res.status}): ${resource}`);
    }

    return Buffer.from(await res.arrayBuffer());
}

window.steps = {
    given: {},
    when: {},
    then: {}
};

window.getStep = function getStep(type, name) {
    if (window.steps[type] == null || window.steps[type][name] == null) {
        throw new Error(`Unrecognized test: ${type} ${name}`);
    }
    return window.steps[type][name];
}

window.testWorld = {};
