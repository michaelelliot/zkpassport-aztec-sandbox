#!/usr/bin/env bash

set -e

function compile_contract() {
    echo "Compiling $1..."
    mkdir -p cache
    mkdir -p "$HOME/.aztec/cache"
    mkdir -p src/interfaces
    docker run --rm --user 1001:127 \
     --network=aztec_network \
     --workdir $PWD \
     -e PXE_URL=$PXE_URL \
     -e XDG_CACHE_HOME=/cache \
     -v $PWD/src/contracts/$1:$PWD/src/contracts/$1 \
     -v $HOME/.aztec/cache:/cache \
     -v $PWD:$PWD aztecprotocol/cli:$CLI_VERSION \
     compile -ts target src/contracts/$1 --compiler wasm
    mv src/contracts/$1/target/*.{json,ts} src/interfaces/
    rm -d src/contracts/$1/target
}

compile_contract slow_tree
compile_contract zkpassport_token
