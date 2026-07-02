#!/bin/bash

# To see how this data is generated: https://github.com/algorandfoundation/algokit-polytest/blob/pq/resources/data-factory/main.go
# This data is generated and validated directly via go-algorand

BASE=https://raw.githubusercontent.com/algorandfoundation/algokit-polytest/pq/resources/data-factory/data

curl -sL -o pqPayment.json "$BASE/pqPayment.json"
curl -sL -o pqDelegatedPayment.json "$BASE/pqDelegatedPayment.json"
curl -sL -o pqRekeyedPayment.json "$BASE/pqRekeyedPayment.json"
curl -sL -o pqRekeyedDelegatedPayment.json "$BASE/pqRekeyedDelegatedPayment.json"
