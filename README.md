# zkPassport on Aztec Sandbox

[![Aztec Sandbox](https://img.shields.io/badge/Aztec_Sandbox-0.16.9-darkviolet)](https://github.com/AztecProtocol/aztec-packages)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-green)](https://opensource.org/license/apache-2-0)
[![Tests](https://github.com/michaelelliot/zkpassport-aztec-sandbox/actions/workflows/test.yml/badge.svg)](https://github.com/michaelelliot/zkpassport-aztec-sandbox/actions/workflows/test.yml)

A prototype for private token transfers on Aztec Network featuring integrated
compliance mechanisms like per transaction send limits, transaction send
limits over a given time period (e.g. monthly), and country whitelisting.

## Usage

### Install dependencies

```bash
npm install
```

### Ensure Aztec Sandbox version `0.16.9` is running

In a separate terminal:

```bash
cd ~/.aztec && DEBUG=aztec:simulator:oracle SANDBOX_VERSION=0.16.9 docker compose up
```

### Run tests

Compile contracts and run integration tests:

```bash
npm run test
```

Run integration tests without (re)compiling contracts:

```bash
SKIP_COMPILE=1 npm run test
```

### Compile contracts

```bash
npm run compile
```

### Clear cache

The cache contains compiled contract artifacts, deployed contract addresses, and the Slow Update Tree database.

If you are encountering issues you may need to clear the cache.

```bash
npm run clear_cache
```

## Reference

### DG1 TD3 Data Structure

#### ASN.1 Header

```
61      0x40 (Application class) + 0x20 (constructed structure indicates inner components) + 0x01 (Tag ID)
5B      The length of the data to follow is 91 bytes (indicates TD3)
5F 1F   MRZ Data Tag
58      The length of the data to follow is 88 bytes (indicates TD3)
```

#### TD3 Data Structure

```
    Name of Data Element            Length
-------------------------------------------
A   Document code                   2
B   Issuing State or organization   3
C   Name of holder                  39
D   Document number                 9
E   Check digit — Document number   1
F   Nationality                     3
G   Date of birth                   6
H   Check digit — Date of birth     1
I   Sex                             1
J   Date of expiry                  6
K   Check digit — Date of expiry    1
L   Optional data                   14
M   Check digit                     1
N   Composite check digit           1
-------------------------------------------
TD3 length is always 88 bytes
TD3 looks like this: AABBBCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCDDDDDDDDDEFFFGGGGGGHIJJJJJJKLLLLLLLLLLLLLLMN
```

## Authors

- [Michael Elliot](https://x.com/michaelelliot)

## License

Licensed under the Apache-2.0 License. See [LICENSE](./LICENSE) for more information.
