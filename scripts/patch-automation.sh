#!/bin/sh

set -e

INPUT="$1"
OUTPUT="$2"

if [ -z "$INPUT" ] || [ -z "$OUTPUT" ]; then
  echo "Usage: patch-automation.sh <input.zip> <output.zip>" >&2
  exit 1
fi

if [ ! -f "$INPUT" ]; then
  echo "patch-automation: $INPUT not found" >&2
  exit 1
fi

INPUT_ABS=$(cd "$(dirname "$INPUT")" && pwd)/$(basename "$INPUT")
OUTPUT_ABS=$(cd "$(dirname "$OUTPUT")" && pwd)/$(basename "$OUTPUT")

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT

unzip -q -o "$INPUT_ABS" -d "$TMP"

node -e '
const fs = require("fs");
const path = require("path");
const dir = process.argv[1];

const optionsPath = path.join(dir, "store/options.js");
let content = fs.readFileSync(optionsPath, "utf8");
const updates = [
  ["terms: false,", "terms: true,"],
  ["onboarding: false,", "onboarding: true,"],
];
for (const [from, to] of updates) {
  if (!content.includes(from)) {
    console.error("patch-automation: pattern not found in store/options.js: " + from);
    process.exit(1);
  }
  content = content.replace(from, to);
}
fs.writeFileSync(optionsPath, content);

const manifestPath = path.join(dir, "manifest.json");
const m = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
m.name = "Ghostery (Automation)";
m.short_name = "Ghostery Automation";
fs.writeFileSync(manifestPath, JSON.stringify(m, null, 2));
' "$TMP"

rm -f "$OUTPUT_ABS"
(cd "$TMP" && zip -rq "$OUTPUT_ABS" .)

echo "patch-automation: wrote $OUTPUT_ABS"
