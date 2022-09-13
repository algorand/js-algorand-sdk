// Imports
import './App.css';
import algosdk from "algosdk";
import { PeraWalletConnect } from "@perawallet/connect";
import { useEffect } from 'react';
import MyImage from'./flames0.png';


// perawallet instantiating
const perawallet = new PeraWalletConnect()

// algoClient
const algod_token = {
  "X-API-Key": "" 
}
const algod_address = "";
const headers = "";
const algodClient = new algosdk.Algodv2(algod_token, algod_address, headers);

//get address
const address = localStorage.getItem('address');

// prize address
const prizeAddress = ''

//asset id
const ASSET_ID = 22081217;

/// transaction code
const transaction = async () => {
  try{
    const suggestedParams = await algodClient.getTransactionParams().do();
    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      from: address,
      to: prizeAddress,
      amount: 5000000,
      assetIndex: ASSET_ID,
      suggestedParams,
    });
    const optInTxn = [{txn : txn, signers: [address]}]
    const signedTxn = await perawallet.signTransaction([optInTxn])
    const success = await algodClient.sendRawTransaction(signedTxn).do();
    return success
  }
  catch(err){
    console.log(err)
    return false
  }
  }
  
// Wallet Connect
async function walletConnect() {
  const newAccounts= await perawallet.connect()
  localStorage.setItem("address", newAccounts[0]);
  window.location.reload()
  console.log('Connect')
  }

// wallet disconnect
const disconnect = () => {
  perawallet.disconnect()
  localStorage.removeItem("address");
  window.location.reload()
  }

const prizetransaction = async () => {
  const mnemonic = '';
  const recoveblueAccount = algosdk.mnemonicToSecretKey(mnemonic); 
  const suggestedParams = await algodClient.getTransactionParams().do();
  const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
    from: prizeAddress,
    to: address,
    amount: 10066600,
    assetIndex: ASSET_ID,
    suggestedParams,
  });
  // Sign the transaction
  const signedTxn = txn.signTxn(recoveblueAccount.sk);
  const sendTx = algodClient.sendRawTransaction(signedTxn).do();
  const txId = txn.txID().toString();
  console.log("Transaction sent with ID " + sendTx.txId);
  console.log("Signed transaction with txID: %s", txId);
  // Wait for confirmation
  algosdk.waitForConfirmation(algodClient, txId, 4);
  }

  const guess = async () => {
    const transactionSuccess = await transaction()
    if (transactionSuccess){
      const generateNumber = Math.floor(Math.random() * 2);
      console.log(generateNumber)
      // Guess
      const guessNumber = document.getElementById('number').value
      console.log(guessNumber)
      // Winner
      const generateNumber1 = parseInt(generateNumber);
      const guessNumber1 = parseInt(guessNumber);
      if(generateNumber1===guessNumber1){
        document.getElementById('message2').textContent = 'You Won!'
        prizetransaction()
      } else {
        document.getElementById('message2').textContent = 'You Lost!'
      }
    }
    }

// React functions must return a React component
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
          <div id = "displaytext" style={{ color: "blue" }}> Choice Coin Chance </div>
        </h1>
        <p>
        <div>
          <div id = "displaytext" style={{ color: "blue" }}> Algorand Wallet </div>
        </div>
        <p>
          <button id='button1' onClick={walletConnect}> Connect</button>
          <button id='button2' onClick={disconnect}> Disconnect</button>
        </p>
        </p>
        
        <div id='message4'></div>

        <div>
          <div id = "displaytext" style={{ color: "blue" }}> 0 or 1? </div>
        </div>
        <div>
            <input id="number" style={{color: "blue" }} type="text"/>
        </div>
        <div id="message2">
        </div>

        <div>
          <button id='button3' onClick={guess}>Chance</button>
        </div>
        <div>
          <img  src={MyImage} alt="fireSpot"/>
        </div>

      </header>
    </div>
  );

}
export default App




