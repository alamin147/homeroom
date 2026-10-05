# Development and release workflow

## After adding a feature

1. Check tests and the production frontend build:

   ```bash
   npm run check
   ```

2. Build and install the desktop app for your current Linux user:

   ```bash
   ./build.sh
   ```

3. Open Homeroom and test the new feature.
4. Add a short entry under `CHANGELOG.md` → `[Unreleased]` in the appropriate section:
   - `Added` for new features.
   - `Changed` for behavior or UI changes.
   - `Deprecated` for features planned for removal.
   - `Fixed` for bug fixes.
   - `Removed` for removed features.
   - `Security` for security fixes.

Write one past-tense bullet per user-visible change. Describe the outcome, not implementation details or commit messages. Example:

```markdown
### Added

- Added keyboard navigation to the project board.
```

## Create a release

1. Choose the next `MAJOR.MINOR.PATCH` version: increment `PATCH` for compatible fixes, `MINOR` for compatible features, or `MAJOR` for breaking changes.
2. Move the relevant `[Unreleased]` entries under a new heading using an exact ISO date, then leave an empty `[Unreleased]` section for future work:

   ```markdown
   ## [1.1.0] - 2026-10-05
   ```

3. Copy a shorter version of user-facing notes into the newest entry in `src/features/about/AboutPage.tsx`. Keep developer tooling and documentation changes only in `CHANGELOG.md`.
4. Update the same version in:
   - `package.json`
   - `src-tauri/tauri.conf.json`
   - `src-tauri/Cargo.toml`
5. Run `npm run check`, then commit and push the changes.
6. Choose how to build the installers:
   - Linux locally: run `./release.sh`. Files are saved under `release/v<version>/`.
   - Cross-platform: open **GitHub → Actions → Release desktop installers → Run workflow**, then choose `all`, `linux`, `windows`, or `macos`.
7. Test the generated installers, review the draft GitHub Release, and publish it.
