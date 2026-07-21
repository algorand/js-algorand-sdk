#!/bin/bash

# To see how this data is generated: https://github.com/algorandfoundation/algokit-polytest/blob/pq/resources/data-factory/main.go
# This data is generated and validated directly via go-algorand

BASE=https://raw.githubusercontent.com/algorandfoundation/algokit-polytest/pq/resources/data-factory/data

curl -L -O "$BASE/pqPayment.json"
curl -L -O "$BASE/pqDelegatedPayment.json"
curl -L -O "$BASE/pqRekeyedPayment.json"
curl -L -O "$BASE/pqRekeyedDelegatedPayment.json"
curl -L -O "$BASE/pqMnemonic.json"
curl -L -O "https://raw.githubusercontent.com/algorandfoundation/falcon-signatures/refs/heads/main/algorand/testdata/lsig_address_kat.json"
