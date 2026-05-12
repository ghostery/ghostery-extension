#!/bin/sh

set -e

# go to the repo root (xcode/ci_scripts -> repo root)
cd "$(dirname "$0")/../.."

# Xcode runs build phases in a clean non-login shell, so recreate the toolchain PATH.
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/share/mise/shims:$HOME/.mise/shims:$HOME/.asdf/shims:$HOME/.asdf/bin:$PATH"
command -v npm >/dev/null 2>&1 || {
  echo "npm: command not found after initializing asdf from .tool-versions" >&2
  exit 127
}

# run build script
npm run build -- --clean

# apply Safari-specific patches to dist/
sh scripts/patch-safari.sh
