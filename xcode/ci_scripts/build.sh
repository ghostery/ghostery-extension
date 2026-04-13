#!/bin/sh

set -e

# go to the repo root (xcode/ci_scripts -> repo root)
cd "$(dirname "$0")/../.."

# setup tool-versions managers
test -f /opt/homebrew/bin/mise && export PATH="/opt/homebrew/bin:$HOME/.local/share/mise/shims:$PATH"
test -f /usr/local/opt/asdf/libexec/asdf.sh && . /usr/local/opt/asdf/libexec/asdf.sh

# run build script
npm run build -- --clean

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
