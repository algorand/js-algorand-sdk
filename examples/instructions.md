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
