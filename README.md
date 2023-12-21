# zkPassport on Aztec Sandbox

## Usage

### Install dependencies

```bash
npm install
```

### Ensure Aztec Sandbox is running

In a separate terminal:

```bash
cd ~/.aztec && docker-compose up
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
