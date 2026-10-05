# Architecture

Homeroom is a local-first personal dashboard. The product covers projects, tasks, notes, documents, saved resources, media, app shortcuts, service checks, activity, home widgets, global search/actions, and feature-owned settings. The browser preview remains usable, while the Tauri build provides controlled local-file integration.

## Dependency direction

```text
React page/widget
  → feature hook
    → provider contract
      → local storage records / Tauri filesystem commands
        → validated native service
```

Dependencies point down this list. Providers never import UI, and Rust never knows about React components.

## Feature modules

Each feature lives in `src/features/<name>` and exports its public API from `index.ts`. Components internal to a feature should not be imported elsewhere unless the feature index explicitly exposes them.

Current features:

- `home`: generic widget rendering and the dashboard composition
- `projects`: outcomes, status, progress, areas, and tags
- `tasks`: project-linked actions, priority, due dates, and completion
- `notes`: lightweight capture with pinning, colors, and tags
- `documents`: notes, references, and checklists connected to projects
- `library`: contextual bookmarks, categories, and favorites
- `media`: a cross-media backlog with progress and ratings
- `apps`: categorized launch shortcuts and favorites
- `services`: explicit on-demand URL health checks and latency
- `activity`: a persistent event-driven history of meaningful changes
- `settings`: namespaced feature preferences

Reusable entities, errors, events, and storage primitives live in `src/shared`. Feature-specific code stays with its feature.

## Providers

Provider contracts separate data acquisition from presentation. Organizer metadata uses `LocalStorageRepository`; `localFileProvider` invokes Tauri to select and scan folders, read supported note files, and open local paths with the OS default application.

Providers normalize failures to `AppError`. UI receives safe messages and can retry without exposing native errors.

## Registries

Four small registries avoid central rendering switches:

- `routeRegistry`: enabled sidebar pages and lazy-loaded route components
- `widgetRegistry`: dashboard widgets and default sizes
- `searchRegistry`: isolated global-search providers; one failure does not stop others
- `actionRegistry`: actions selected by entity capability

`registerFeatures.ts` is the composition root. It is the only expected central edit for a statically bundled feature. Dynamic plugin loading is intentionally out of scope.

Home renders widgets generically from `widgetRegistry`. The user's visible widget IDs are stored in `home.widgets`; the dashboard customizer changes this list without adding widget-specific conditions to Home. Quick Capture writes through the task/note providers, and repository change events refresh mounted consumers immediately.

## State, events, and background work

Local UI behavior uses component state. Shared feature data is loaded through feature hooks. There is no global domain store.

`appEvents` is a typed, synchronous event bus for cross-feature facts such as `entity:changed`. Activity records those events without domain features importing Activity.

`subscribeToJob` deduplicates periodic work by job ID. Components must not create independent polling loops for the same provider.

## Native boundary

The frontend treats Tauri as privileged. Native commands accept structured arguments, canonicalize requested paths, and require them to be under configured roots. Arbitrary shell strings are not accepted.

Folders enter the native allowlist only through the directory picker. Canonical roots are persisted in the app configuration directory, and every scan, read, or open request is checked against those roots. Scans are bounded, do not follow symlinks, and apply category-specific extension allowlists. Text reads are limited to Markdown/plain text and 2 MB; binary reads are limited to PDFs and 64 MB. Markdown and PDF rendering are lazy-loaded so normal dashboard startup does not include either reader bundle.

`src-tauri/src/lib.rs` only initializes commands. Native logic belongs in:

- `commands/`: typed Tauri command surfaces
- `services/`: filesystem and system implementation
- `security/`: permission and path validation

The browser version remains functional when native providers are unavailable.

## Persistence and migrations

Phase 1 uses versionable local-storage keys. When SQLite is introduced, repositories remain the only database callers and migrations belong in `src-tauri/src/database/migrations`. Raw SQL must not enter React or Tauri commands.

## Extension constraints

Features must be independently removable, lazy-loaded at page boundaries, and protected by an error boundary. Prefer one concrete provider until a real replacement is likely; do not add abstract factories or dependency-injection frameworks.
