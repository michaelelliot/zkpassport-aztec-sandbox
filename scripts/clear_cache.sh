#!/usr/bin/env sh

if [ -d "./cache" ]; then
    rm -r ./cache
    echo "Cache cleared."
fi

mkdir -p ./cache
