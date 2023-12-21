#!/usr/bin/env sh

if [ -z "$SKIP_COMPILE" ]; then
    ./scripts/compile.sh
fi

DEBUG='token,aztec:cheat_codes:*' NODE_NO_WARNINGS=1 node --experimental-vm-modules node_modules/.bin/jest --verbose --runInBand --forceExit src/tests/zkpassport_token.test.ts
