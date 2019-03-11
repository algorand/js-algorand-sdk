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
    algos.value = 739;

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

    var signKey = null;
    var account = null;

    function createWalletName() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 10; i++)
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }
    if (adetails) {
        adetails.onclick = function() {
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
    if (tb) {
        tb.onclick = function() {
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
    if (ga) {
        ga.onclick = function() {
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
    if (re) {
        re.onclick = function() {
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
    if (st) {
        st.onclick = function() {

            ta.innerHTML = "";


            txn = {
                "from": account,
                "to": to.value.toString(),
                "fee": 10,
                "amount": parseInt(algos.value),
                "firstRound": parseInt(fround.value),
                "lastRound": parseInt(lround.value),
                "note": new Uint8Array(0)
            };

            var signedTxn = algosdk.signTransaction(txn, signKey);
            console.log(signedTxn.txID);
            let algodclient = new algosdk.Algod(atoken, aserver, aport);
            (async () => {
                let tx = (await algodclient.sendRawTransaction(signedTxn.blob));
                var textedJson = JSON.stringify(tx, undefined, 4);
                console.log(textedJson);
                ta.innerHTML = textedJson;
            })().catch(e => {
                ta.innerHTML = e.text;
                console.log(e);
            });


        }
    }

    if (wr) {
        wr.onclick = function() {
            ta.innerHTML = "";
            const kmdclient = new algosdk.Kmd(kmdtoken, kmdserver, kmdport);
            const algodclient = new algosdk.Algod(atoken, aserver, aport);
            // Recover a wallet example
            (async () => {

                let mdk = (await algosdk.mnemonicToMasterDerivationKey(wall.value));
                console.log(mdk);
                var walletname = createWalletName();
                console.log("Created Wallet : " + walletname);
                let walletid = (await kmdclient.createWallet(walletname, "", mdk)).wallet.id;
                let wallethandle = (await kmdclient.initWalletHandle(walletid, "")).wallet_handle_token;
                console.log("Got wallet handle.", wallethandle);
                var acct = (await kmdclient.generateKey(wallethandle));
                signKey = (await kmdclient.exportKey(wallethandle, "", acct.address)).private_key;
                account = acct.address;
                console.log(signKey)




                let tx = (await algodclient.accountInformation(account));
                var textedJson = JSON.stringify(tx, undefined, 4);
                console.log(textedJson);
                ta.innerHTML = textedJson;




            })().catch(e => {
                console.log(e);
            })


        }
    }



})();
