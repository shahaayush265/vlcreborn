#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASE_DIR="$SCRIPT_DIR/release/v1.0.0"

mkdir -p "$RELEASE_DIR"

echo "=== Staging Linux Release Artifacts (v1.0.0) ==="

# 1. Debian Package
if [ -f "$SCRIPT_DIR/src-tauri/target/release/bundle/deb/vlcreborn_1.0.0_amd64.deb" ]; then
    cp "$SCRIPT_DIR/src-tauri/target/release/bundle/deb/vlcreborn_1.0.0_amd64.deb" "$RELEASE_DIR/"
    echo "✓ Staged: vlcreborn_1.0.0_amd64.deb"
fi

# 2. AppImage
if [ -f "$SCRIPT_DIR/src-tauri/target/release/bundle/appimage/vlcreborn_1.0.0_amd64.AppImage" ]; then
    cp "$SCRIPT_DIR/src-tauri/target/release/bundle/appimage/vlcreborn_1.0.0_amd64.AppImage" "$RELEASE_DIR/"
    chmod +x "$RELEASE_DIR/vlcreborn_1.0.0_amd64.AppImage"
    echo "✓ Staged: vlcreborn_1.0.0_amd64.AppImage"
fi

# 3. RPM Package
if [ -f "$SCRIPT_DIR/src-tauri/target/release/bundle/rpm/vlcreborn-1.0.0-1.x86_64.rpm" ]; then
    cp "$SCRIPT_DIR/src-tauri/target/release/bundle/rpm/vlcreborn-1.0.0-1.x86_64.rpm" "$RELEASE_DIR/"
    echo "✓ Staged: vlcreborn-1.0.0-1.x86_64.rpm"
fi

# 4. Standalone Linux Binary Tarball
if [ -f "$SCRIPT_DIR/src-tauri/target/release/vlcreborn" ]; then
    TAR_TMP="$(mktemp -d)"
    mkdir -p "$TAR_TMP/vlcreborn-1.0.0"
    cp "$SCRIPT_DIR/src-tauri/target/release/vlcreborn" "$TAR_TMP/vlcreborn-1.0.0/"
    cp "$SCRIPT_DIR/src-tauri/icons/icon.png" "$TAR_TMP/vlcreborn-1.0.0/"
    cp "$SCRIPT_DIR/public/vlc-cone.svg" "$TAR_TMP/vlcreborn-1.0.0/"
    
    cat << 'EOF' > "$TAR_TMP/vlcreborn-1.0.0/vlcreborn.desktop"
[Desktop Entry]
Name=VLC Reborn
Comment=The iconic open-source media player, reimagined
Exec=vlcreborn
Icon=icon
Terminal=false
Type=Application
Categories=AudioVideo;Player;Video;Audio;
EOF

    tar -czf "$RELEASE_DIR/vlcreborn-1.0.0-linux-x86_64.tar.gz" -C "$TAR_TMP" vlcreborn-1.0.0
    rm -rf "$TAR_TMP"
    echo "✓ Staged: vlcreborn-1.0.0-linux-x86_64.tar.gz"
fi

# 5. Windows Binary (if compiled)
if [ -f "$SCRIPT_DIR/src-tauri/target/x86_64-pc-windows-gnu/release/vlcreborn.exe" ]; then
    cp "$SCRIPT_DIR/src-tauri/target/x86_64-pc-windows-gnu/release/vlcreborn.exe" "$RELEASE_DIR/vlcreborn-1.0.0-windows-x64.exe"
    echo "✓ Staged: vlcreborn-1.0.0-windows-x64.exe"
fi

# 6. Generate SHA256 Checksums
cd "$RELEASE_DIR"
rm -f SHA256SUMS.txt
sha256sum vlcreborn* > SHA256SUMS.txt
echo "✓ Generated: SHA256SUMS.txt"

echo "=== Release staging complete for v1.0.0 ==="
ls -lh "$RELEASE_DIR"
