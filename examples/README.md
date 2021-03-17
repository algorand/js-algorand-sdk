# Instructions for running examples

## Configuration

Many of the examples in this folder require configuration information such as:

- Algod Instance
- Sender Account
- Receiving Account

We use environment variables inside the examples to read the configuration information.

You could set the environment variables manually, but we recommend sourcing it from a `.env` file like so:

```bash
# examples/.env
# This file contains sensitive information and is therefore ignored using .gitignore

# Algod Instance
export ALGOD_TOKEN="<algod instance auth token>"
export ALGOD_SERVER="http://localhost"
export ALGOD_PORT="4180" # Leave blank if no port

# Sender Account
export SENDER_MNEMONIC="<generate this with examples/generate_sender_receiver.js>"

# Receiver
export RECEIVER_MNEMONIC="<generate this with examples/generate_sender_receiver.js>"
```

Make sure to source the file before running the examples:

```sh
$ source examples/.env
```

## Generating test accounts

You can generate sender and receiver accounts using `examples/generate_sender_receiver.js`:

```sh
$ node examples/generate_sender_receiver.js

Sender:
Mnemonic: skate purse kit glare divert valley stage network ribbon such venue forward trial web scorpion fix damp order myth wait truck cousin dilemma about chalk
Address: D2RMK2MGUJSN6PAB6HNFBY4JXTIGSXOZW7GXSCDPYLKTLG4P2BV2GSIV4E

--------------------

Receiver:
Mnemonic: yellow tiny hungry useful outer universe sausage layer rare rich flower security hour print walnut bamboo essence annual shell street enhance exhibit aware able deliver
Address: JMVEVWOU3EAOUFXZ3TXFGS44AGE5VINMXTFM446XSS7RNC4KOPR5HR537U

--------------------

TIP: You can send funds to your accounts using the testnet and betanet dispensers listed below:
* https://bank.testnet.algorand.network
* https://bank.betanet.algodev.network/

```
