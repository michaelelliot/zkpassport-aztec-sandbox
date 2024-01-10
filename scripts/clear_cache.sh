#!/usr/bin/env sh

set -e

if [ -d "./cache" ]; then
    rm -r ./cache
    echo "Cache cleared."
fi

mkdir -p ./cache
