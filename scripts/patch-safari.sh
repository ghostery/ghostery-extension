#!/bin/sh

set -e

node -e '
const fs = require("fs");
const p = "dist/manifest.json";
if (!fs.existsSync(p)) {
  console.error("patch-safari: " + p + " not found - run: npm run build -- chromium");
  process.exit(1);
}
const m = JSON.parse(fs.readFileSync(p, "utf8"));
if (m.manifest_version !== 3) {
  console.error("patch-safari: expected manifest_version 3, got " + m.manifest_version);
  process.exit(1);
}
'

node scripts/filter-invalid-dnr-rules.js

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
