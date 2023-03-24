#!/bin/bash

export ALGOD_PORT="60000"
export INDEXER_PORT="59999"
export KMD_PORT="60001"

npm install ts-node

echo "Running accounts.ts"
node_modules/.bin/ts-node accounts.ts
echo "Running app.ts"
node_modules/.bin/ts-node app.ts
echo "Running asa.ts"
node_modules/.bin/ts-node asa.ts
echo "Running atc.ts"
node_modules/.bin/ts-node atc.ts
echo "Running atomics.ts"
node_modules/.bin/ts-node atomics.ts
echo "Running codec.ts"
node_modules/.bin/ts-node codec.ts
echo "Running debug.ts"
node_modules/.bin/ts-node debug.ts
echo "Running indexer.ts"
node_modules/.bin/ts-node indexer.ts
echo "Running kmd.ts"
node_modules/.bin/ts-node kmd.ts
echo "Running lsig.ts"
node_modules/.bin/ts-node lsig.ts
echo "Running overview.ts"
node_modules/.bin/ts-node overview.ts
echo "Running participation.ts"
node_modules/.bin/ts-node participation.ts
