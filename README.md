# Homeroom

Homeroom is an open-source, local-first desktop dashboard for projects, tasks, notes, documents, media, app shortcuts, activity, and service health.

## Privacy

- No accounts, telemetry, analytics, advertising, or cloud sync.
- Organizer data stays in the app's local storage.
- Local files stay on the device and are limited to folders selected by the user.
- The app makes a network request only when the user opens a link or manually checks a configured service URL. Service checks send no request body.
- Backups are exported and imported manually from **Settings**.

## Requirements

- Node.js 20+ and npm
- Rust stable toolchain
- Linux Tauri dependencies; on Fedora:

```bash
sudo dnf install webkit2gtk4.1-devel libsoup3-devel
```

## Setup

```bash
git clone <repository-url>
cd home-lab
npm install
npm run tauri dev
```

Browser-only development is available with `npm run dev`, but local-folder features require Tauri.

## Build and install

```bash
./build.sh
```

This builds the frontend and desktop app, then installs `homeroom` to `~/.local/bin`.

For distributable system packages, run:

```bash
npm run tauri build
```

## Verify

```bash
npm run check
```

## Project layout

- `src/features/` — feature pages and UI
- `src/providers/` — local data providers
- `src/shared/` — shared models, storage, and components
- `src-tauri/` — native commands and filesystem validation
- `docs/` — architecture and extension notes

See [Architecture](docs/ARCHITECTURE.md) and [Adding a feature](docs/ADDING_A_FEATURE.md).

## License

[MIT](LICENSE) © 2026 Alamin
