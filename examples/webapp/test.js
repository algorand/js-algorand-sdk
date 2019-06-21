(function() {

    const atoken = "YOUR-ALGOD-API-TOKEN";
    const aserver = "http://ALGOD-ADDRESS";
    const aport = ALGOD-PORT;
    const kmdtoken = "YOUR-KMD-API-TOKEN";
    const kmdserver = "http://KMD-ADDRESS";
    const kmdport = KMD-PORT;
    var from = document.getElementById('from');
    var to = document.getElementById('to');
    to.value = "7ZUECA7HFLZTXENRV24SHLU4AVPUTMTTDUFUBNBD64C73F3UHRTHAIOF6Q"
    var algos = document.getElementById('algos');
    algos.value = 739000;
    var tb = document.getElementById('block');
    var ta = document.getElementById('ta');
    var ga = document.getElementById('account');
    var st = document.getElementById('transaction');
    var bu = document.getElementById('backup');
    var re = document.getElementById('recover');
    var wr = document.getElementById('wrecover');
    var wall = document.getElementById('wallet');
    var fround = document.getElementById('fround');
    var lround = document.getElementById('lround');
    var adetails = document.getElementById('adetails');
    var trans = document.getElementById('trans');
    var txid = document.getElementById('txid');
    var signKey = null;
    var account = null;

    function createWalletName() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 10; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
    //acount information
    if (adetails) {
        adetails.onclick = function () {
            ta.innerHTML = "";
            const algodclient = new algosdk.Algod(atoken, aserver, aport);

            (async () => {
                let tx = (await algodclient.accountInformation(account));
                var textedJson = JSON.stringify(tx, undefined, 4);
                console.log(textedJson);
                ta.innerHTML = textedJson;
            })().catch(e => {
                console.log(e);
            });


        }
    }
    //block status
    if (tb) {
        tb.onclick = function () {
            ta.innerHTML = "";
            const algodclient = new algosdk.Algod(atoken, aserver, aport);

            (async () => {
                let lastround = (await algodclient.status()).lastRound;
                let block = (await algodclient.block(lastround));
                fround.value = lastround;
                lround.value = lastround + 1000;
                var textedJson = JSON.stringify(block, undefined, 4);
                console.log(textedJson);
                ta.innerHTML = textedJson;

                console.log(block);
            })().catch(e => {
                console.log(e);
            });


        }
    }
    //Create account
    if (ga) {
        ga.onclick = function () {
            ta.innerHTML = "";

            var acct = algosdk.generateAccount();
            account = acct.addr;
            console.log(account);
            from.value = account;
            var mnemonic = algosdk.secretKeyToMnemonic(acct.sk);
            bu.value = mnemonic;
            console.log(mnemonic);
            var recovered_account = algosdk.mnemonicToSecretKey(mnemonic);
            console.log(recovered_account.addr);
            var isValid = algosdk.isValidAddress(recovered_account.addr);
            console.log("Is this a valid address: " + isValid);
            ta.innerHTML = "Account created. Save Mnemonic"
            signKey = acct.sk;

        }
    }
    //recover account
    if (re) {
        re.onclick = function () {
            ta.innerHTML = "";

            var recovered_account = algosdk.mnemonicToSecretKey(bu.value);
            console.log(recovered_account.addr);
            from.value = recovered_account.addr;
            var isValid = algosdk.isValidAddress(recovered_account.addr);
            console.log("Is this a valid address: " + isValid);
            ta.innerHTML = "Account created. Set value in the From Input box"
            account = recovered_account.addr;
            signKey = recovered_account.sk;
            let algodclient = new algosdk.Algod(atoken, aserver, aport);
            (async () => {
                let tx = (await algodclient.accountInformation(recovered_account.addr));
                var textedJson = JSON.stringify(tx, undefined, 4);
                console.log(textedJson);
                ta.innerHTML = textedJson;
            })().catch(e => {
                ta.innerHTML = e.text;
                console.log(e);
            });


        }
    }
    //submit transaction
    if (st) {
        st.onclick = function () {
            ta.innerHTML = "";
             var person = { firstName: "John", lastName: "Doe", age: 50, eyeColor: "blue" };
            var note = algosdk.encodeObj(person);
            txn = {
                "from": account,
                "to": to.value.toString(),
                "fee": 1000,
                "amount": parseInt(algos.value),
                "firstRound": parseInt(fround.value),
                "lastRound": parseInt(lround.value),
                "note": algosdk.encodeObj(person),
                "genesisID": "testnet-v1.0",
                "genesisHash": "SGO1GKSzyE7IEPItTxCByw9x8FmnrCDexi9/cOUJOiI="
            };
            var signedTxn = algosdk.signTransaction(txn, signKey);
            console.log(signedTxn.txID);
            let algodclient = new algosdk.Algod(atoken, aserver, aport);
            (async () => {
                let tx = (await algodclient.sendRawTransaction(signedTxn.blob));
                var textedJson = JSON.stringify(tx, undefined, 4);
                console.log(textedJson);
                ta.innerHTML = textedJson;
                console.log(tx);
                console.log(tx.txId);
                txid.value = tx.txId;
            })().catch(e => {
                ta.innerHTML = e.text;
                console.log(e);
            });



        }
    }
    //Get transaction note
    if (trans) {
        trans.onclick = function () {

            ta.innerHTML = "";

            let algodclient = new algosdk.Algod(atoken, aserver, aport);
            (async () => {
                 let tx = (await algodclient.transactionInformation(account, txid.value));
                  var textedJson = JSON.stringify(tx, undefined, 4);
                console.log(textedJson);
 
                var encodednote = algosdk.decodeObj(tx.note);
                 ta.innerHTML = JSON.stringify(encodednote, undefined, 4);

            })().catch(e => {
                ta.innerHTML = e.text;
                if (e.text === undefined) {
                 }
                console.log(e);
            });


        }
    }



})();