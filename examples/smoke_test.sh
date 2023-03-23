#!/bin/bash

echo "Running accounts.ts"
ts-node accounts.ts
echo "Running app.ts"
ts-node app.ts
echo "Running asa.ts"
ts-node asa.ts
echo "Running atc.ts"
ts-node atc.ts
echo "Running atomics.ts"
ts-node atomics.ts
echo "Running codec.ts"
ts-node codec.ts
echo "Running debug.ts"
ts-node debug.ts
echo "Running indexer.ts"
ts-node indexer.ts
echo "Running kmd.ts"
ts-node kmd.ts
echo "Running lsig.ts"
ts-node lsig.ts
echo "Running overview.ts"
ts-node overview.ts
# re-enable when its right
# echo "Running participation.ts"
# ts-node participation.ts
