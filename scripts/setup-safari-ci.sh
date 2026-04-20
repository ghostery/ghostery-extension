#!/bin/bash
# One-time setup for running Safari WebDriver e2e tests on CI (or locally).
# Idempotent: safe to re-run.

set -euo pipefail

if [[ "$(uname)" != "Darwin" ]]; then
  echo "setup-safari-ci.sh is macOS-only" >&2
  exit 1
fi

echo "==> enabling Safari dev menu + remote automation defaults"
defaults write com.apple.Safari IncludeDevelopMenu -bool true
defaults write com.apple.Safari.SandboxBroker ShowDevelopMenu -bool true
defaults write com.apple.Safari WebKitDeveloperExtrasEnabledPreferenceKey -bool true
defaults write -g WebKitDeveloperExtras -bool true
sudo safaridriver --enable

echo "==> granting Accessibility to /usr/bin/osascript via system TCC db"
sudo sqlite3 "/Library/Application Support/com.apple.TCC/TCC.db" \
  "INSERT OR REPLACE INTO access \
   VALUES('kTCCServiceAccessibility','/usr/bin/osascript',1,2,4,1,NULL,NULL,0,'UNUSED',NULL,0,NULL,NULL,NULL,'UNUSED',NULL);"
sudo killall tccd 2>/dev/null || true
killall tccd 2>/dev/null || true

echo "==> verifying osascript Accessibility grant"
osascript -e 'tell application "System Events" to get name of every process' >/dev/null || {
  echo "osascript cannot drive System Events — Accessibility grant did not take effect" >&2
  exit 1
}

echo "==> toggling 'Allow Unsigned Extensions' via Develop menu"
osascript 2>&1 <<'APPLESCRIPT'
tell application "Safari" to activate
delay 1
tell application "System Events"
  tell process "Safari"
    set frontmost to true
    click menu item "Allow Unsigned Extensions" of menu "Develop" of menu bar 1
    delay 1
    -- Admin auth sheet appears
    keystroke "runner"
    delay 0.3
    keystroke return
  end tell
end tell
APPLESCRIPT

echo "==> done"
