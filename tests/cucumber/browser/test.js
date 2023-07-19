/* eslint-env browser */
const assert = require('assert');
const sha512 = require('js-sha512');
const nacl = require('tweetnacl');

window.assert = assert;

window.keyPairFromSecretKey = function keyPairFromSecretKey(sk) {
  return nacl.sign.keyPair.fromSecretKey(sk);
};

window.keyPairFromSeed = function keyPairFromSeed(seed) {
  return nacl.sign.keyPair.fromSeed(seed);
};

window.genericHash = function genericHash(toHash) {
  return sha512.sha512_256.array(toHash);
};

window.loadResource = async function loadResource(resource) {
  const res = await fetch(`/features/resources/${resource}`);
  if (!res.ok) {
    throw new Error(`Failed to load resource (${res.status}): ${resource}`);
  }

  return res.arrayBuffer();
};

window.steps = {
  given: {},
  when: {},
  then: {},
};

window.getStep = function getStep(type, name) {
  if (window.steps[type] == null || window.steps[type][name] == null) {
    throw new Error(`Unrecognized test: ${type} ${name}`);
  }
  return window.steps[type][name];
};

window.testWorld = {};

window.makeUint8Array = function makeUint8Array(arg) {
  return new Uint8Array(arg);
};

window.makeABIMethod = function makeABIMethod(arg) {
  return new window.algosdk.ABIMethod(arg);
};

window.makeABIContract = function makeABIContract(arg) {
  return new window.algosdk.ABIContract(arg);
};

window.makeArray = function makeArray(...args) {
  return args;
};

window.makeObject = function makeObject(obj) {
  return { ...obj };
};

window.parseJSON = function parseJSON(json) {
  return JSON.parse(json);
};

window.formatIncludeAll = function formatIncludeAll(includeAll) {
  if (!['true', 'false'].includes(includeAll)) {
    throw new Error(`Unknown value for includeAll: ${includeAll}`);
  }

  return includeAll === 'true';
};
