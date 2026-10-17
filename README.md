<div align="center">

# 🎬 VLC Reborn

**The iconic open-source media player, reimagined with modern aesthetics, hardware-accelerated fluid playback, and pro-grade audio/video controls.**

[![Release](https://img.shields.io/badge/Release-v1.0.0-orange.svg?style=for-the-badge&logo=vlc)](https://github.com/vlcreborn/vlcreborn/releases/tag/v1.0.0)
[![Platforms](https://img.shields.io/badge/Platforms-Linux%20%7C%20Windows%20%7C%20macOS%20%7C%20Android-blue.svg?style=for-the-badge)](https://github.com/vlcreborn/vlcreborn/releases)
[![Tauri](https://img.shields.io/badge/Tauri-v2.2-24C8D8.svg?style=for-the-badge&logo=tauri)](https://tauri.app)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg?style=for-the-badge&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Rust](https://img.shields.io/badge/Rust-2024-DEA584.svg?style=for-the-badge&logo=rust)](https://www.rust-lang.org)

<p align="center">
  <img src="public/vlc-cone.svg" alt="VLC Reborn Cone Logo" width="120" height="120" />
</p>

[Key Features](#-key-features) •
[Downloads & Installation](#-downloads--installation) •
[Cross-Platform Support](#-cross-platform-architecture) •
[Building from Source](#-building-from-source) •
[Keyboard Shortcuts](#-keyboard-shortcuts) •
[Roadmap & Future Steps](#-roadmap--future-steps)

---

</div>

## 🌟 Overview

**VLC Reborn** brings the beloved VideoLAN media player into the next generation. Built on **Tauri v2**, **Rust**, and **React 19**, VLC Reborn blends the unmatched versatility of the classic VLC cone with a cutting-edge **acrylic frosted glass Canvas HUD**, studio-grade **10-band graphic equalizer**, frame-accurate scrubbing with dynamic hover thumbnails, and intelligent multi-track subtitle synchronization.

---

## ✨ Key Features

### 🎨 Acrylic Frosted Glass Canvas HUD
- **Context-Aware Auto-Hiding Controls**: The interface gently sleeps during idle playback and wakes up smoothly on mouse activity, touch gestures, or keyboard events.
- **Thick Fluid Seekbar**: Visual chapter flags, real-time timecode displays, and instantaneous scrubbing without snap-back stuttering.
- **Dynamic Hover Thumbnail Preview**: Live frame previews rendered at the cursor's scrub location with millisecond-precision timestamps.
- **Frameless Modern Window**: Integrated custom acrylic titlebar with native OS window snapping, minimize/maximize/close buttons, and clean drag regions.

### 🎚️ Studio 10-Band Graphic Equalizer
- **Precision Frequency Bands**: Tailored adjustment across 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, and 16kHz.
- **Curated Audio Presets**: Flat, Rock, Pop, Jazz, Classical, Bass Boost, Club, and Vocal modes.
- **Stereo Balance & 200% Super-Volume**: Boost quiet dialog up to 200% volume with built-in soft clipping protection and stereo pan adjustment.

### 💬 Visual Subtitle & Audio Deck
- **Multi-Track Switching**: Seamlessly toggle between embedded or external `.srt`, `.vtt`, and `.sub` tracks.
- **Real-Time Sync Offset**: Adjust subtitle delay/advance by ±5000ms with a single click or slider.
- **Customizable Typographic Styling**: Tune subtitle font size, color, background pill opacity, and text drop-shadow to match any video brightness.

### 📚 Intelligent Playback Queue & Media Library
- **Drag-and-Drop Local Files**: Open any video or audio file directly from your file manager or drag it into the player.
- **Network Streams**: Instant streaming support for HLS (`.m3u8`), MP4, WebM, and audio feeds via direct URL input.
- **Persistent Playback Resume**: Automatically remembers your playback timestamp and volume levels across sessions.
- **Native Hardware-Accelerated Thumbnails**: Rust backend scans directories and extracts native video thumbnails using system codecs and FFmpeg.

### 🌈 Themes & Accents
- Choose between curated visual accents:
  - 🟠 **VLC Classic Orange**
  - ⚡ **Electric Cyan**
  - 💜 **Neon Violet**
  - 🌿 **Emerald Green**
  - 🌆 **Cyberpunk Amber**
- Switch between **Deep Dark** and **Frosted Glass Acrylic** themes.

---

## 📦 Downloads & Installation

Pre-built binaries for release **v1.0.0** are available on the [Releases page](https://github.com/vlcreborn/vlcreborn/releases/tag/v1.0.0).

### 🐧 Linux

| Package Format | Target Distribution | Installation Command |
|---|---|---|
| **Debian / Ubuntu (`.deb`)** | Ubuntu 20.04+, Debian 11+, Linux Mint, Pop!_OS | `sudo dpkg -i vlcreborn_1.0.0_amd64.deb` |
| **AppImage (`.AppImage`)** | Universal Linux (Arch, Fedora, Ubuntu, openSUSE) | `chmod +x vlcreborn_1.0.0_amd64.AppImage && ./vlcreborn_1.0.0_amd64.AppImage` |
| **Red Hat / Fedora (`.rpm`)** | Fedora 38+, RHEL 9+, openSUSE Leap/Tumbleweed | `sudo rpm -i vlcreborn-1.0.0-1.x86_64.rpm` |
| **Portable Tarball (`.tar.gz`)** | Any x86_64 Linux Distribution | `tar -xzf vlcreborn-1.0.0-linux-x86_64.tar.gz && ./vlcreborn-1.0.0/vlcreborn` |

### 🪟 Windows

| Package Format | Target Operating System | Details |
|---|---|---|
| **NSIS Installer (`.exe`)** | Windows 10 / Windows 11 (64-bit) | Standard installer with desktop shortcut and file associations |
| **Windows MSI (`.msi`)** | Enterprise / Active Directory Deployments | Microsoft Windows Installer package |
| **Portable (`.exe`)** | Windows 10 / Windows 11 | Standalone executable requiring no installation |

> **Note**: Requires the Microsoft Edge WebView2 Runtime (pre-installed on Windows 10/11).

### 🍏 macOS

| Package Format | Architecture | Details |
|---|---|---|
| **Apple Silicon (`.dmg`)** | Apple M1, M2, M3, M4 Macs | Native ARM64 `.dmg` drag-and-drop installer |
| **Intel (`.dmg`)** | Intel 64-bit Macs | Native x86_64 `.dmg` drag-and-drop installer |

> **macOS Security Note**: If macOS displays an unidentified developer warning on first launch, run:
> ```bash
> xattr -cr "/Applications/VLC Reborn.app"
> ```

### 📱 Android

| Package Format | Target | Details |
|---|---|---|
| **Android APK (`.apk`)** | Android 8.0+ (Oreo to Android 15) | Universal ARM64 & x86_64 package with touch seekbar and gesture controls |

---

## 🔒 Verification & Integrity

All release assets include SHA-256 checksums to verify package authenticity:

```bash
# Verify downloaded files against the release checksums:
sha256sum -c SHA256SUMS.txt
```

---

## 🏗️ Cross-Platform Architecture

```
┌────────────────────────────────────────────────────────┐
│                   React 19 Frontend                    │
│      Canvas HUD • Audio Deck • Playback Queue • Subtitles│
│        Framer Motion • Lucide Icons • Tailwind CSS     │
└───────────────────────────┬────────────────────────────┘
                            │  Tauri IPC (JSON-RPC)
┌───────────────────────────▼────────────────────────────┐
│                  Tauri v2 Rust Core                    │
│   Window Vibrancy • File Scanner • Native Thumbnails   │
│       System Dialogs • Audio Buffer • Global Hotkeys   │
└─────────────┬───────────────────────────┬──────────────┘
              │                           │
  ┌───────────▼──────────┐    ┌───────────▼──────────────┐
  │   Desktop Platform   │    │     Mobile Platform      │
  │ WebKitGTK (Linux)    │    │ Android WebView (Android)│
  │ WebView2 (Windows)   │    │                          │
  │ WKWebView (macOS)    │    │                          │
  └──────────────────────┘    └──────────────────────────┘
```

VLC Reborn uses Tauri v2's native multi-platform engine to ensure consistent behavior:
- **Linux**: Interacts through WebKitGTK with native Wayland and X11 window decorations disabled in favor of our custom titlebar.
- **Windows**: Utilizes the modern Evergreen WebView2 engine with Direct3D video presentation.
- **macOS**: Leverages WKWebView with native macOS vibrancy and blurred backdrop glass.
- **Android**: Powered by the Android System WebView with touch-optimized scrubbing and full-screen gesture navigation.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>Space</kbd> / <kbd>K</kbd> | Play / Pause |
| <kbd>→</kbd> / <kbd>L</kbd> | Seek forward 10 seconds |
| <kbd>←</kbd> / <kbd>J</kbd> | Seek backward 10 seconds |
| <kbd>Shift</kbd> + <kbd>→</kbd> | Seek forward 30 seconds |
| <kbd>Shift</kbd> + <kbd>←</kbd> | Seek backward 30 seconds |
| <kbd>↑</kbd> | Volume Up (+5%) |
| <kbd>↓</kbd> | Volume Down (-5%) |
| <kbd>M</kbd> | Toggle Mute |
| <kbd>F</kbd> | Toggle Fullscreen |
| <kbd>Esc</kbd> | Exit Fullscreen / Close active deck |
| <kbd>Q</kbd> | Toggle Playback Queue |
| <kbd>E</kbd> | Toggle Graphic Equalizer |
| <kbd>C</kbd> | Toggle Chapter Selector |
| <kbd>S</kbd> | Toggle Subtitle Settings |
| <kbd>,</kbd> / <kbd>.</kbd> | Frame step backward / forward |

---

## 🛠️ Building from Source

### Prerequisites
- **Node.js**: v20 or higher (`node -v`)
- **Rust**: 1.85 or higher (`rustc --version`)
- **System Dependencies**:
  - **Ubuntu / Debian**:
    ```bash
    sudo apt-get install -y libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libayatana-appindicator3-dev librsvg2-dev
    ```
  - **Fedora / RHEL**:
    ```bash
    sudo dnf install -y webkit2gtk4.1-devel openssl-devel libappindicator-gtk3-devel librsvg2-devel
    ```
  - **Arch Linux**:
    ```bash
    sudo pacman -S --needed webkit2gtk-4.1 base-devel openssl libappindicator-gtk3 librsvg
    ```

### Step-by-Step Compilation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/vlcreborn/vlcreborn.git
   cd vlcreborn
   ```

2. **Install frontend dependencies**:
   ```bash
   npm install
   ```

3. **Run development mode with hot-reloading**:
   ```bash
   npm run tauri dev
   ```

4. **Compile optimized production packages**:
   ```bash
   # Build frontend and desktop binary:
   npm run tauri build

   # Or build using Docker for Ubuntu (.deb, .AppImage, .rpm):
   npm run build:ubuntu
   ```

---

## 🗺️ Roadmap & Future Steps

VLC Reborn is actively expanding. Here is our roadmap for upcoming releases:

### 🚀 Phase 5: Direct LibVLC & FFmpeg Core Integration (v1.1.0)
- [ ] Direct FFI bindings to `libvlc` and native FFmpeg demuxers in Rust.
- [ ] 10-bit HDR tone mapping and AV1 / HEVC hardware decoding.
- [ ] Dedicated audio passthrough (Dolby Atmos, DTS:X, and bitstream output).

### 📡 Phase 6: Network Streaming & Remote Casting (v1.2.0)
- [ ] **Google Cast / Chromecast** audio & video projection from the HUD.
- [ ] **Apple AirPlay 2** screen and audio mirroring.
- [ ] **DLNA / UPnP Media Server Browser** to access local home media servers (Synology, Plex, Jellyfin).

### 👥 Phase 7: P2P Watch Party (v1.3.0)
- [ ] Real-time WebRTC room synchronization for remote group watching.
- [ ] Integrated text chat and voice commentary overlay.
- [ ] Synchronized play/pause, seek, and chapter navigation across all connected peers.

### ☁️ Phase 8: Cloud Sync & Metadata Enrichment (v2.0.0)
- [ ] OpenSubtitles.org API integration for one-click subtitle downloads.
- [ ] TMDB / TVDb integration for poster art, episode guides, and cast metadata.
- [ ] End-to-end encrypted playlist and watch history sync across desktop and mobile devices.

---

## 🤝 Contributing

We welcome community contributions, bug reports, and pull requests!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

VLC Reborn is distributed under the **GPL-3.0 License** in the spirit of the VideoLAN open-source ecosystem. See `LICENSE` for more information.

---

<div align="center">
  <sub>Crafted with passion for the open-source media community.</sub>
</div>
