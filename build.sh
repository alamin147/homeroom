#!/usr/bin/env bash

npm run tauri -- build --no-bundle
install -Dm755 src-tauri/target/release/homeroom "$HOME/.local/bin/homeroom"
