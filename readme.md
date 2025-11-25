# Local Text Compare

Fully offline, private, browser-based diffing for sensitive text.

<div align="center">

![Privacy](https://img.shields.io/badge/Privacy-Guaranteed-blue)
![Frameworks](https://img.shields.io/badge/Frameworks-None-success)
![Network Requests](https://img.shields.io/badge/Network%20Requests-0-critical)
![License](https://img.shields.io/badge/License-MIT-green)

<em>Compare text safely. No uploads. No servers. No leaks.</em>

</div>

## Overview

Local Text Compare is a static, zero-dependency web application for secure text comparison. All data stays inside your browser session—nothing is sent anywhere and nothing is stored. The tool offers both line-level and word-level diffing without any external libraries, network requests, or build pipeline.

Ideal for developers, auditors, analysts, lawyers, IT staff, and anyone who needs complete confidence that sensitive text never leaves their machine.

## Features

- **Local execution**: Runs entirely in the browser, no backend, no analytics; works from the file system, USB, archive, or any static host.
- **Powerful inline diffing**: Line-based LCS diff, modified-line detection, word-level highlighting for added and removed segments, structured color-coded rendering.
- **Simple, stable tech**: Pure HTML, CSS, and JavaScript; no frameworks, build tools, compilers, or CDNs.
- **Privacy by design**: No persistent storage, no tracking, no third-party scripts; state clears when the tab closes.
- **Drop-in static app**: No build step, no dependencies, runs offline, extremely portable.

## Screenshot

![alt text](Imgs\screenshot-for-readme.png)

## Quick Start

```sh
git clone https://github.com/your repo here/local text compare.git
cd local text compare
```

Open `index.html` in any modern browser. No build process is necessary.

## Architecture

```
/
├─ index.html   # Main application structure
├─ style.css    # UI styles and diff highlight classes
└─ app.js       # Diff logic, DOM updates, word-level highlighting
```

Everything is intentionally simple, readable, and easy to audit.

## Why This Tool Exists

Many online diffing tools silently upload text for processing. For engineers handling private code, legal teams reviewing documents, security staff reviewing logs, or anyone dealing with sensitive text, that is unacceptable.

Local Text Compare protects users by ensuring:

- All processing is done client side.
- No communication leaves your browser.
- No third parties are involved.

This is the safest form of diffing available.

## Roadmap

- Dark mode
- Export to file
- Drag-and-drop support
- Session-based state retention in memory only
- Local OCR to enable image-based text comparison
- Optional PWA wrapper for offline installation

## Security Notes

- No external script tags
- No CDN-loaded fonts
- No analytics
- No network requests
- No storage APIs

Your text stays where it belongs, always.

## Contributing

Contributions are welcome. Please keep commits aligned with the project goals:

- No frameworks
- No dependencies
- No tracking
- No network calls
- No build systems
- Keep everything local and minimal

Pull requests should be focused, documented, and easy to test. Issues are welcome for bugs, feature suggestions, security concerns, and UX improvements.

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Maintainer Notes

Local Text Compare is intentionally designed to be audit-friendly. A quick read through the three files is enough to understand the complete behavior of the tool. This simplicity is deliberate to support trust, longevity, and transparency.