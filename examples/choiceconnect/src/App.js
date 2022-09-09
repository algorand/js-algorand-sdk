import './App.css';
import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect } from 'react';
const algod_token = {
  "X-API-Key": "" 
}
const algod_address = "";
const headers = "";
const algodClient = new algosdk.Algodv2(algod_token, algod_address, headers);
const perawallet = new PeraWalletConnect()
const address = localStorage.getItem('address');
const receiverAddress = ''
const ASSET_ID = ''
const  transaction = async () => {
  const suggestedParams = await algodClient.getTransactionParams().do();
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: address,
    to: receiverAddress,
    amount: 1,
    assetIndex: ASSET_ID,
    suggestedParams,
  });
  const optInTxn = [{txn : txn, signers: [address]}]
  const signedTxn = await perawallet.signTransaction([optInTxn])
    await algodClient.sendRawTransaction(signedTxn).do();
}
async function walletConnect() {
  const newAccounts= await perawallet.connect()
  localStorage.setItem("address", newAccounts[0]);
  window.location.reload()
  console.log('Connect')
  }
const disconnect = () => {
  perawallet.disconnect()
  localStorage.removeItem("address");
  window.location.reload()
}
function App() {
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
}
export default App;