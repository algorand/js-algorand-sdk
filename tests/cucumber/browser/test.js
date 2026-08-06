/* eslint-env browser */
const assert = require('assert');
const sha512 = require('js-sha512');
const nacl = require('tweetnacl');
// eslint-disable-next-line import/no-extraneous-dependencies
const { falcon1024 } = require('falcon-1024');

window.assert = assert;

// Build a Falcon-1024 account (address + signers) from a raw PQ seed. This
// mirrors the same-named helper in tests/cucumber/steps/steps.js so the browser
// step context has it available as a global.
window.falconAccountFromSeed = function falconAccountFromSeed(seed) {
  const { publicKey, privateKey } = falcon1024.generateKey(seed);
  const signingKey = {
    falcon1024PublicKey: publicKey,
    falcon1024Signer: async (bytesToSign) =>
      falcon1024.signCompressed(privateKey, bytesToSign),
  };
  return {
    publicKey,
    privateKey,
    ...window.algosdk.addressWithSignersFromRawFalcon1024Signer(signingKey),
  };
};

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

  return new Uint8Array(await res.arrayBuffer());
};

window.loadResourceAsJson = async function loadResourceAsJson(resource) {
  const res = await fetch(`/features/resources/${resource}`);
  if (!res.ok) {
    throw new Error(`Failed to load resource (${res.status}): ${resource}`);
  }

  return res.json();
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

window.makeMap = function makeMap(m) {
  return new Map(m);
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
