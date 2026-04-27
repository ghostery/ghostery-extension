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

# strip DNR rules that WebKit's URL filter parser cannot compile
node scripts/filter-invalid-dnr-rules.js

# rewrite manifest background.service_worker into background.scripts/persistent
node -e '
const fs = require("fs");
const p = "dist/manifest.json";
const m = JSON.parse(fs.readFileSync(p, "utf8"));
if (m.background && m.background.service_worker) {
  m.background = { scripts: [m.background.service_worker], type: "module", persistent: false };
  fs.writeFileSync(p, JSON.stringify(m, null, 2));
  console.log("Patched manifest: background.service_worker -> background.scripts");
}
'
