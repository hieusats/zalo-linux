# Zalo Linux Port

Linux `.deb` build tooling for Zalo PC v26.3.20. Ports the macOS Electron application to Linux using the same Electron 22.3.9 runtime.

## Quick Start

```bash
npm install
make extract-all          # Extract DMG and app.asar
bash scripts/download-electron.sh  # Download Linux Electron
bash scripts/build-deb.sh           # Build .deb package
```

## Project Structure

```
linux-port/
  build/
    app-extracted/         # Extracted app.asar contents
    app-extracted/native/  # Native modules (sqlite3, db-cross-v4)
  packaging/
    debian/                # .deb control files
    icons/                 # App icons (256x256, 512x512)
    zalo.desktop           # XDG desktop entry
  patches/                 # Linux-specific patches
  scripts/                 # Build and test scripts
  test/
    native/                # Native module tests
    smoke/                 # Package structure validation
    integration/           # Cross-module integration tests
    helpers/               # Test utilities
  docs/                    # Documentation
```

## Running Tests

```bash
npm test                   # Run bash smoke tests
npx mocha test/native/     # Native module tests (41+ tests)
npx mocha test/smoke/      # Package structure tests (72 tests)
npx mocha test/integration/ # Integration tests (31 tests)
npx mocha test/            # All mocha tests
```

## Building

See [docs/BUILD.md](docs/BUILD.md) for detailed build instructions.

## Installing

See [docs/INSTALL.md](docs/INSTALL.md) for installation instructions.

## Troubleshooting

See [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) for common issues.

## Feature Status

See [docs/FEATURES.md](docs/FEATURES.md) for what works on Linux.

## Cross-Distribution Testing

```bash
bash scripts/test-docker.sh build/zalo_26.3.20-1_amd64.deb
```

Tests on Ubuntu 22.04, 24.04, Debian 12, and Fedora 39.

## License

This is a port of the Zalo PC application. Zalo is developed by VNG Corporation.
