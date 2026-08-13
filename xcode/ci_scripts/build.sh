#!/bin/sh

set -e

cd "$(dirname "$0")/../.."

# Xcode runs build phases in a clean non-login shell, so recreate the toolchain PATH.
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.local/share/mise/shims:$HOME/.mise/shims:$HOME/.asdf/shims:$HOME/.asdf/bin:$PATH"
command -v npm >/dev/null 2>&1 || {
  echo "npm: command not found after initializing asdf from .tool-versions" >&2
  exit 127
}

# GHOSTERY_DEBUG is a build setting defined by the "Debug (Extension)" configuration.
BUILD_ARGS="--clean"
if [ "${GHOSTERY_DEBUG:-0}" = "1" ]; then
  BUILD_ARGS="$BUILD_ARGS --debug"
fi

echo "Building extension: npm run build -- $BUILD_ARGS"

npm run build -- $BUILD_ARGS

sh scripts/patch-safari.sh
