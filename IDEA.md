## SCALABILITY / EXTENSIBILITY REQUIREMENT

The entire project must be structured so new features can be added later with minimal modification to existing code.

This is a long-term personal dashboard. I will continuously add features such as:

- new widgets
- new data providers
- new file sources
- new project actions
- new integrations
- new media types
- new system information
- new commands
- new search sources
- new settings
- new sidebar pages

Do NOT tightly couple features together.

The architecture should favor adding a new module rather than modifying large central files.

---

# FEATURE-BASED ARCHITECTURE

Organize frontend code primarily by feature.

Example:

src/
  app/
    router/
    layout/
    providers/

  features/
    home/
      components/
      hooks/
      services/
      types/
      index.ts

    projects/
      components/
      hooks/
      services/
      types/
      index.ts

    tasks/
    library/
    media/
    apps/
    services/
    notes/
    activity/
    settings/

  shared/
    components/
    hooks/
    utils/
    types/
    constants/

  providers/
    projects/
    files/
    apps/
    media/
    github/
    system/

  registry/
    featureRegistry.ts
    widgetRegistry.ts
    searchRegistry.ts
    actionRegistry.ts

Avoid giant folders such as:

components/
utils/
services/

containing hundreds of unrelated files.

Feature-specific code should stay inside its feature.

Only truly reusable code belongs in shared/.

---

# TAURI / RUST STRUCTURE

Keep native functionality similarly modular.

Example:

src-tauri/src/

  commands/
    files/
    projects/
    apps/
    system/
    launcher/
    git/

  services/
    filesystem/
    git/
    system/
    launcher/

  providers/

  database/
    migrations/
    repositories/
    models/

  security/
    permissions.rs
    paths.rs

  state/

  errors/

  utils/

Do not put all Tauri commands inside main.rs or lib.rs.

main.rs/lib.rs should mostly initialize the application and register modules.

---

# FEATURE MODULE CONTRACT

Each significant feature should expose a small public interface.

For example:

features/projects/index.ts

should expose only what other parts of the app need.

Internal components/services should not be imported directly by unrelated features.

Prefer:

import { ProjectCard, useProjects } from "@/features/projects"

instead of:

import ProjectCard from "@/features/projects/components/cards/internal/ProjectCard"

This keeps modules easier to refactor later.

---

# REGISTRY-BASED SYSTEM

Avoid large switch statements such as:

if widget === "projects"
if widget === "github"
if widget === "system"

Instead use registries.

Example conceptual structure:

widgetRegistry.register({
  type: "projects",
  component: ProjectsWidget,
  defaultSize: "medium"
})

Adding another widget later:

widgetRegistry.register({
  type: "weather",
  component: WeatherWidget
})

should not require changing the dashboard rendering engine.

Use this same approach for:

- widgets
- global search providers
- quick actions
- project actions
- settings sections where practical

---

# SEARCH PROVIDERS

Global search must be plugin-like.

Create a common interface such as:

interface SearchProvider {
  id: string
  search(query: string): Promise<SearchResult[]>
}

Possible providers:

ProjectSearchProvider
FileSearchProvider
AppSearchProvider
TaskSearchProvider
MediaSearchProvider
BookmarkSearchProvider

Global search simply calls enabled providers.

Adding GitHub later should only require:

GitHubSearchProvider

rather than rewriting global search.

---

# ACTION SYSTEM

Create a reusable action model.

Conceptually:

interface Action {
  id: string
  label: string
  icon?: string
  execute(context: ActionContext): Promise<void>
}

Example actions:

open
open-with
open-terminal
open-editor
open-github
copy-path
favorite
pin

Entities can expose supported actions.

For example:

Project:
- open editor
- terminal
- folder
- GitHub

Movie:
- play
- reveal in folder

File:
- open
- reveal
- copy path

The UI should not contain large entity-specific action logic.

---

# ENTITY MODEL

Use common lightweight entity conventions where practical.

Example:

BaseEntity:

{
  id
  type
  name
  icon?
  subtitle?
}

Extended entities:

ProjectEntity
FileEntity
ApplicationEntity
MediaEntity
TaskEntity
BookmarkEntity

Do NOT force unrelated data into one enormous universal model.

Use shared base fields plus feature-specific models.

---

# PROVIDERS

Separate:

DATA SOURCE

from:

UI

For example:

ProjectsPage
      ↓
ProjectService
      ↓
ProjectProvider
      ↓
Filesystem / Git

The React component should not directly scan folders.

Similarly:

SystemWidget
      ↓
SystemProvider
      ↓
Tauri native command

and:

GitHubWidget
      ↓
GitHubProvider
      ↓
GitHub API

This will allow data sources to be changed later without rewriting the UI.

---

# PROVIDER INTERFACES

Where useful, define provider contracts.

Example:

interface ProjectProvider {
  getProjects(): Promise<Project[]>
  getProject(id: string): Promise<Project | null>
}

interface MediaProvider {
  getMedia(): Promise<MediaItem[]>
}

interface SystemProvider {
  getStats(): Promise<SystemStats>
}

Do not create abstractions just for the sake of abstraction.

Only introduce interfaces where multiple implementations or future replacement is realistic.

---

# EVENT BUS

Create a lightweight internal event system.

Example events:

project:opened
file:opened
app:launched
media:played
task:completed
service:offline

Features should be able to emit events without directly depending on the Activity feature.

Example:

Project module emits:

project:opened

Activity module listens and records it.

Recent Items can listen as well.

This avoids dependencies like:

Projects → Activity → Recent → Home.

Do not create an overly complex enterprise event framework.

A small typed event bus is enough.

---

# DATABASE

Database access must use repository modules.

Do NOT scatter raw SQL across React/Tauri code.

Example:

TaskRepository
SettingsRepository
ActivityRepository
ServiceRepository
BookmarkRepository

Use SQLite migrations.

Example:

database/
  migrations/
    001_initial.sql
    002_add_notes.sql
    003_add_widget_settings.sql

Never assume the database schema will stay fixed.

Future features must be able to add migrations safely.

---

# SETTINGS

Use namespaced settings.

Example:

appearance.theme
projects.directories
projects.defaultEditor
media.directories
media.defaultPlayer
system.refreshInterval
github.enabled

Do not create hundreds of unrelated top-level settings.

Features should own their settings.

---

# WIDGET EXTENSION MODEL

Widgets should have a descriptor.

Conceptually:

{
  type
  title
  component
  defaultSize
  defaultSettings
  refreshPolicy
}

Widget rendering should be generic.

Home should not import every widget manually if a registry can handle it cleanly.

Future goal:

Adding:

src/features/weather/widget.ts

and registering it should be enough to make Weather available as a dashboard widget.

---

# SIDEBAR / ROUTE REGISTRY

Avoid hardcoding every page deeply into the sidebar.

Use route metadata.

Example:

{
  id: "projects",
  title: "Projects",
  icon: FolderIcon,
  path: "/projects",
  order: 20
}

Navigation can be generated from enabled feature definitions.

This will make adding future pages much easier.

Do not overcomplicate React routing for this.

---

# OPTIONAL FEATURES

Design features so they can be disabled.

Examples:

GitHub disabled
Media disabled
System monitoring disabled

The rest of the dashboard must continue working.

One provider failing must not crash the entire application.

Use isolated error handling.

---

# ERROR BOUNDARIES

Each major widget/feature should fail independently.

Example:

GitHub API fails:

GitHub
Unable to load data
[ Retry ]

The Home dashboard itself must remain usable.

---

# LAZY LOADING

Large feature pages should be lazy-loaded.

For example:

Media
Settings
Activity

Do not load every feature at startup.

Initial launch should prioritize:

shell
home
command palette
essential settings

---

# BACKGROUND WORK

Create one centralized mechanism for:

- refresh intervals
- filesystem refresh
- status checks
- cached provider data

Do NOT let every React component independently create polling timers.

For example:

Service A polling every 10 seconds
Widget A polling every 10 seconds
Home polling every 10 seconds

would be wasteful.

One provider should fetch once and share its state.

---

# CACHING

Data providers may cache expensive results.

Examples:

installed application discovery
project scanning
filesystem indexing
Git repository metadata

Cache should have clear invalidation policies.

Do not cache constantly changing values forever.

---

# FILESYSTEM WATCHERS

If filesystem watchers are introduced later:

Use as few watchers as practical.

Watch configured roots instead of thousands of individual files.

Do not recursively monitor the entire home directory.

---

# DEPENDENCY DIRECTION

Keep dependency direction approximately:

UI
↓
Feature service/store
↓
Provider
↓
Tauri command
↓
Native service/system

Do not allow React UI components to contain native implementation details.

Likewise, native Rust modules should know nothing about React components.

---

# FRONTEND STATE

Do not create one enormous global store.

Use:

local component state

for local UI behavior.

Feature-level stores

for shared feature state.

A small application-level store

only for truly global state such as:

theme
sidebar
active profile
global preferences

Avoid unnecessary Redux-style boilerplate unless complexity genuinely requires it.

---

# TYPE SAFETY

Do not duplicate important models manually between many files.

Maintain clear TypeScript domain models.

Tauri command payloads/results must be typed.

Avoid widespread:

any

unknown casts

unstructured JSON

---

# ERROR MODEL

Create consistent application errors.

Examples:

PermissionDenied
FileNotFound
InvalidPath
ApplicationLaunchFailed
ProviderUnavailable
NetworkError

UI should receive safe error information.

Do not expose raw Rust/system errors unnecessarily.

---

# SECURITY BOUNDARIES

Treat the Tauri native layer as privileged.

Frontend requests actions.

Native layer validates them.

Example:

React:
openProject(projectId)

Native layer:
resolve registered project
validate path
perform allowed operation

Prefer this over sending arbitrary shell strings from React.

This architecture must remain secure even as more features are added.

---

# EXTENSION TEST

While designing architecture, continuously ask:

"If I add a Weather feature tomorrow, what files need modification?"

Ideal answer:

- create weather feature
- create provider
- register feature/widget

NOT:

- edit Home
- edit Search
- edit Sidebar
- edit Settings
- edit App.tsx
- edit five switch statements

Similarly:

"If I add Spotify integration later?"

It should mainly require:

features/spotify/
providers/spotify/
registry entry

Existing features should require little or no modification.

---

# AVOID OVER-ENGINEERING

Scalable does NOT mean enterprise architecture.

Do not add:

- microservices
- dependency injection frameworks
- message brokers
- Redux everywhere
- dozens of abstract base classes
- unnecessary factories
- complicated plugin loaders
- dynamic code loading
- premature generic abstractions

This is still a lightweight personal desktop application.

The desired architecture is:

modular
typed
loosely coupled
easy to understand
easy to extend
easy to delete/refactor

not enterprise complexity.

---

# DOCUMENT ARCHITECTURE

Create:

docs/ARCHITECTURE.md

Explain:

- application layers
- feature structure
- provider architecture
- registry system
- native/Tauri boundary
- database structure
- event system

Also create:

docs/ADDING_A_FEATURE.md

Give a practical example of adding a new feature.

For example:

"Adding a Weather widget"

show:

1. create feature folder
2. define types
3. create provider
4. create widget
5. register provider/widget
6. add settings if necessary

The goal is that six months later I can understand how to extend the project without reverse-engineering the whole codebase.

---

# MOST IMPORTANT RULE

Before implementing major functionality, establish this modular architecture first.

However, do not spend the entire project designing abstractions.

Build the smallest clean architecture that supports the current Phase 1 features while leaving obvious extension points for later.

Every architectural decision should balance:

Simplicity
Performance
Maintainability
Extensibility

in that order.
