# zkPassport on Aztec Sandbox

[![Aztec Sandbox](https://img.shields.io/badge/Aztec_Sandbox-0.16.9-darkviolet)](https://github.com/AztecProtocol/aztec-packages)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-green)](https://opensource.org/license/apache-2-0)

A prototype for private token transfers on Aztec Network featuring integrated
compliance mechanisms like per transaction send limits, transaction send
limits over a given time period (e.g. monthly), and country whitelisting.

## Usage

### Install dependencies

```bash
npm install
```

### Ensure Aztec Sandbox version 0.16.9 is running

In a separate terminal:

```bash
cd ~/.aztec && DEBUG=aztec:simulator:oracle SANDBOX_VERSION=0.16.9 docker compose up
```

### Run tests

This will compile the contracts and run the integration tests.

```bash
npm run test
```

## Other

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
