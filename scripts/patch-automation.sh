#!/usr/bin/env bash
#
# Patch a freshly built dist/ for use by automation harnesses
# (research/, end-to-end tests). Renames the extension to make it
# distinguishable from the released build, and flips the
# `disableOnboarding` managed-config default to `true` so the
# extension skips first-run UI, auto-accepts terms, and suppresses
# notifications (incl. the "pin Ghostery" popup) without touching
# `src/`. See `src/store/managed-config.js` and `src/store/options.js`
# (`manage()`) for the flag's semantics.
#
# Usage: scripts/patch-automation.sh [dist-dir]
# Default dist-dir is ./dist relative to the repo root.

set -euo pipefail

DIST="${1:-dist}"

if [[ ! -f "$DIST/manifest.json" ]]; then
  echo "error: $DIST/manifest.json not found — did you run 'npm run build chromium' first?" >&2
  exit 1
fi

if [[ ! -f "$DIST/store/managed-config.js" ]]; then
  echo "error: $DIST/store/managed-config.js not found — unexpected build layout" >&2
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

# Flip the disableOnboarding managed-config default from false → true.
# This triggers options.js `manage()` to set options.terms = true and
# options.onboarding = true on every load, which:
#   - lets autoconsent initialize (gated on options.terms),
#   - flips the computed `disableNotifications` to true (suppresses pin-it),
#   - short-circuits the onboarding view's redirect guard.
python3 - "$DIST/store/managed-config.js" <<'PY'
import re, sys
path = sys.argv[1]
with open(path) as f:
    src = f.read()
new, n = re.subn(r'(disableOnboarding:\s*)false', r'\1true', src, count=1)
if n == 0:
    sys.stderr.write(f'error: did not find `disableOnboarding: false` to patch in {path}\n')
    sys.exit(1)
with open(path, 'w') as f:
    f.write(new)
PY

echo "patched $DIST for automation use (managed-config disableOnboarding → true)"
