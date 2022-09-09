**Choice Connect Overview**

Choice Connect allows a user to:

1. Click a connect address button to recieve a QR code to scan and connect their address.
2. Click a send asset button to send an asset to a specified address.
3. Click a disconnect address button to disconnect their address.

*Requirements*

1. React
2. Algorand JavaScript-SDK
3. HTML

**Problem**

A major problem on the Algorand blockchain is the lack of scalable and secure open source code for connecting the Algorand Wallet to decentralized applications. The problem with the existing solutions is that they use too much unnecessary code, which creates security vulnerabilities. Additionally, the existing convoluted solutions are difficult to use for open source development because the complexities create difficulty for developers.

**Solution**

Choice Connect provides a minimum example to allow developers to easily create applications with wallet connect, wallet disconnect, and asset send functionality. This solution is for React applications and the Algorand JavaScript-SDK. The purpose for this project is to develop a simplified and scalable methodology for developing wallet connection mechanisms with Algorand applications.


# 1. Imports

Start with importing necessary dependencies.

`import './App.css';
import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect } from 'react';`
# 2. Network Connections 
Initiate a new PeraWallet instance.
`const perawallet = new PeraWalletConnect()`
Add minimum network connection requirements.
`const algod_token = {
  "X-API-Key": "" 
}
const algod_address = "";
const headers = "";
const algodClient = new algosdk.Algodv2(algod_token, algod_address, headers);`
# 3. Set application storage and parameters. 
Here, the solution allows for the defining of a receiver address and asset ID.
`const address = localStorage.getItem('address');
const receiverAddress = ''
const ASSET_ID = '';`
# 4. Transaction Function
This function defines the transaction.
`const  transaction = async () => {
  const suggestedParams = await algodClient.getTransactionParams().do();
  const newAddress = document.getElementById('reciever').value
  const enc = new TextEncoder();
  const note = enc.encode('Transaction with perawallet:'+ ethAddress);
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: receiverAddress,
    amount: 1,
    assetIndex: ASSET_ID,
    note : note,
    suggestedParams,
  });
  const optInTxn = [{txn : txn, signers: [address]}]
  const signedTxn = await perawallet.signTransaction([optInTxn])
    await algodClient.sendRawTransaction(signedTxn).do();
}`
# 5. Wallet Connect and Disconnect
This is the wallet connect function.
`async function walletConnect() {
  const newAccounts= await perawallet.connect()
  localStorage.setItem("address", newAccounts[0]);
  window.location.reload()
  console.log('Connect')
  }`
This is the wallet disconnect function.
`const disconnect = () => {
  perawallet.disconnect()
  localStorage.removeItem("address");
  window.location.reload()
}`
#6. The React App
This is the React App.
`function App() {
  useEffect(() => {
    perawallet.reconnectSession().then((accounts) => {
      if (accounts.length) {
        localStorage.setItem("address", accounts[0]);
      }
      perawallet.connector?.on("disconnect", () => {
        localStorage.removeItem("address");
      });
    })
    .catch((e) => console.log(e));
  }, [])
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          Choice Coin Connect
        </h1>
        <div>
          <button id='button1' onClick={walletConnect}> Connect</button>
        </div>
        <p></p>
        <div>
          <button id='button1' onClick={transaction}> Send</button>
        </div>
        <p></p>
        <div>
          <button id='button1' onClick={disconnect}> Disconnect</button>
        </div>
      </header>
    </div>
  );
}`
Export the application.
`export default App;`