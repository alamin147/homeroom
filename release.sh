#!/usr/bin/env bash

set -euo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$project_dir"

command -v npm >/dev/null || { echo "npm is required." >&2; exit 1; }
command -v sha256sum >/dev/null || { echo "sha256sum is required." >&2; exit 1; }

if [[ ! -d node_modules ]]; then
  echo "Installing locked dependencies…"
  npm ci
fi

version="$(node -p "JSON.parse(require('node:fs').readFileSync('package.json', 'utf8')).version")"
bundle_root="$project_dir/src-tauri/target/release/bundle"
output_dir="$project_dir/release/v$version"

echo "Validating Homeroom v$version…"
npm run check

echo "Building AppImage, DEB, and RPM bundles…"
npm run tauri -- build --ci --bundles appimage,deb,rpm

mkdir -p "$output_dir"
find "$output_dir" -maxdepth 1 -type f \( -name '*.AppImage' -o -name '*.deb' -o -name '*.rpm' -o -name 'SHA256SUMS' \) -delete
for format in appimage deb rpm; do
  case "$format" in
    appimage) pattern="*_${version}_*.AppImage" ;;
    deb) pattern="*_${version}_*.deb" ;;
    rpm) pattern="*-${version}-*.rpm" ;;
  esac

  mapfile -d '' artifacts < <(find "$bundle_root/$format" -maxdepth 1 -type f -name "$pattern" -print0)
  if (( ${#artifacts[@]} == 0 )); then
    echo "No $format bundle was generated in $bundle_root/$format." >&2
    exit 1
  fi
  cp -p -- "${artifacts[@]}" "$output_dir/"
done

(
  cd "$output_dir"
  shopt -s nullglob
  artifacts=(*.AppImage *.deb *.rpm)
  sha256sum "${artifacts[@]}" > SHA256SUMS
)

echo
echo "Release v$version is ready in $output_dir:"
find "$output_dir" -maxdepth 1 -type f -printf '  %f\n' | sort
