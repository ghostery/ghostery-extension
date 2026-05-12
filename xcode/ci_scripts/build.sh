#!/bin/sh

set -e

cd "$(dirname "$0")/../.."

# Xcode runs build phases in a clean non-login shell, so recreate the toolchain PATH.
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/share/mise/shims:$HOME/.mise/shims:$HOME/.asdf/shims:$HOME/.asdf/bin:$PATH"
command -v npm >/dev/null 2>&1 || {
  echo "npm: command not found after initializing asdf from .tool-versions" >&2
  exit 127
}

npm run build -- --clean

sh scripts/patch-safari.sh
