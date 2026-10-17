#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$SCRIPT_DIR"

# Ensure builder image exists
if ! docker image inspect vlcreborn-builder >/dev/null 2>&1; then
    echo "Creating vlcreborn-builder container..."
    docker build -t vlcreborn-builder -f Dockerfile.ubuntu-builder .
fi

NODE_DIR="$(dirname "$(dirname "$(readlink -f "$(which node)")")")"
CARGO_DIR="${CARGO_HOME:-$HOME/.cargo}"
RUSTUP_DIR="${RUSTUP_HOME:-$HOME/.rustup}"

mkdir -p /tmp/vlcreborn-home /tmp/vlcreborn-cache

echo "Compiling VLC Reborn binaries for Ubuntu..."
docker run --rm \
  --user "$(id -u):$(id -g)" \
  -e CARGO_HOME="$CARGO_DIR" \
  -e RUSTUP_HOME="$RUSTUP_DIR" \
  -e HOME=/tmp/vlcreborn-home \
  -e XDG_CACHE_HOME=/tmp/vlcreborn-cache \
  -e APPIMAGE_EXTRACT_AND_RUN=1 \
  -v "$RUSTUP_DIR":"$RUSTUP_DIR":ro \
  -v "$CARGO_DIR":"$CARGO_DIR" \
  -v "$NODE_DIR":/opt/node:ro \
  -v /tmp/vlcreborn-home:/tmp/vlcreborn-home \
  -v /tmp/vlcreborn-cache:/tmp/vlcreborn-cache \
  -v /tmp:/tmp \
  -v "$SCRIPT_DIR":/workspace \
  -w /workspace \
  -e PATH="/opt/node/bin:$CARGO_DIR/bin:$PATH" \
  vlcreborn-builder npm run tauri build

echo "Compilation complete! Artifacts are located in:"
echo "  - Raw Binary:  src-tauri/target/release/vlcreborn"
echo "  - Debian (.deb): src-tauri/target/release/bundle/deb/vlcreborn_1.0.0_amd64.deb"
echo "  - AppImage:    src-tauri/target/release/bundle/appimage/vlcreborn_1.0.0_amd64.AppImage"
