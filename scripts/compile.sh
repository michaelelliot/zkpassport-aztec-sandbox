#!/usr/bin/env sh

function compile_contract() {
    mkdir -p src/interfaces
    aztec-cli compile -ts target src/contracts/$1 && \
    mv src/contracts/$1/target/*.{json,ts} src/interfaces/ && \
    rm -d src/contracts/$1/target && \
    mkdir -p cache/compiled && \
    touch "./cache/compiled/$2"
}

function compile_contract_if_changed() {
    local change_hash="$(find src/contracts/$1 -type f \( -name "*.nr" -o -name "*.toml" \) -exec shasum -a 256 {} \; | shasum -a 256 | tr -cd 'a-zA-Z0-9')"
    if [ ! -f "./cache/compiled/$change_hash" ]; then
        echo "Compiling $1..."
        compile_contract "$1" "$change_hash"
    fi
}

mkdir -p cache

compile_contract_if_changed slow_tree
compile_contract_if_changed zkpassport_token
