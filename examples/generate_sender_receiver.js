/** 
 * Example: generating sender and receiver accounts
 * This example demonstrates generating multiple accounts. Please
 * feel free to use this example to generate test accounts needed
 * for some of the other examples.
 */

const algosdk = require('../');

// generate accounts
const { sk: senderSk, addr: senderAddr } = algosdk.generateAccount();
const { sk: receiverSk, addr: receiverAddr } = algosdk.generateAccount();

// log the mnemonics and addresses
const senderMnemonic = algosdk.secretKeyToMnemonic(senderSk);
const receiverMnemonic = algosdk.secretKeyToMnemonic(receiverSk);

const fmt = {
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  reset: "\x1b[0m",
};

console.log(`
${fmt.bold}Sender:${fmt.reset}
${fmt.dim}Mnemonic:${fmt.reset} ${senderMnemonic}
${fmt.dim}Address:${fmt.reset} ${senderAddr}

${fmt.dim}--------------------${fmt.reset}

${fmt.bold}Receiver:${fmt.reset}
${fmt.dim}Mnemonic:${fmt.reset} ${receiverMnemonic}
${fmt.dim}Address:${fmt.reset} ${receiverAddr}

${fmt.dim}--------------------${fmt.reset}

${fmt.bold}TIP:${fmt.reset} You can send funds to your accounts using the testnet and betanet dispensers listed below:
* https://bank.testnet.algorand.network
* https://bank.betanet.algodev.network/
`);
