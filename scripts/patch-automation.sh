#!/usr/bin/env bash
#
# Patch a freshly built dist/ for use by automation harnesses
# (research/, end-to-end tests). Renames the extension to make it
# distinguishable from the released build, and accepts terms +
# onboarding so it skips the first-run UI.
#
# Usage: scripts/patch-automation.sh [dist-dir]
# Default dist-dir is ./dist relative to the repo root.

set -euo pipefail

DIST="${1:-dist}"

if [[ ! -f "$DIST/manifest.json" ]]; then
  echo "error: $DIST/manifest.json not found — did you run 'npm run build chromium' first?" >&2
  exit 1
fi

if [[ ! -f "$DIST/store/options.js" ]]; then
  echo "error: $DIST/store/options.js not found — unexpected build layout" >&2
  exit 1
fi

# Use python3 for a deterministic in-place JSON edit (sed on JSON is fragile).
python3 - "$DIST/manifest.json" <<'PY'
import json, sys
path = sys.argv[1]
with open(path) as f:
    m = json.load(f)
m['name'] = 'Ghostery (Automation)'
m['short_name'] = 'Ghostery Automation'
with open(path, 'w') as f:
    json.dump(m, f, indent=2)
    f.write('\n')
PY

# Pre-accept terms + onboarding in the built options defaults so the
# extension does not show first-run UI under automation.
python3 - "$DIST/store/options.js" <<'PY'
import re, sys
path = sys.argv[1]
with open(path) as f:
    src = f.read()
new = re.sub(r'(\bterms:\s*)false', r'\1true', src, count=1)
new = re.sub(r'(\bonboarding:\s*)false', r'\1true', new, count=1)
if new == src:
    sys.stderr.write(f'warning: did not find terms/onboarding defaults to patch in {path}\n')
with open(path, 'w') as f:
    f.write(new)
PY

echo "patched $DIST for automation use"
