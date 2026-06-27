import * as algosdk from './main.js';
import * as ed25519Signer from './ed25519-signer.js';

export * from './main.js';
export * from './ed25519-signer.js';
export default { ...algosdk, ...ed25519Signer };
