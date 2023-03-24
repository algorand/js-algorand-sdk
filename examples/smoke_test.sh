#!/usr/bin/env bash

export ALGOD_PORT="60000"
export INDEXER_PORT="59999"
export KMD_PORT="60001"

# Loop over all files in the directory
for file in *; do
    # Check if the file ends with ".ts"
    if [[ $file == *.ts ]]; then
        # Check if the filename is not "utils.ts"
        if [[ $file != "utils.ts" ]]; then
            # Call the file using `ts-node`
            ../node_modules/.bin/ts-node "$file"
        fi
    fi
done
