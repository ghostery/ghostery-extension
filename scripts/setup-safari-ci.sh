#!/bin/bash
# One-time setup for running Safari WebDriver e2e tests on CI (or locally).
#
# - Enables safaridriver.
# - Grants Accessibility to /usr/bin/osascript so System Events clicks work.
# - Toggles Safari's Develop menu, Allow Remote Automation, and Allow Unsigned
#   Extensions via AppleScript.
#
# Idempotent: safe to re-run.

set -euo pipefail

if [[ "$(uname)" != "Darwin" ]]; then
  echo "setup-safari-ci.sh is macOS-only" >&2
  exit 1
fi

echo "==> enabling safaridriver"
sudo safaridriver --enable

echo "==> granting Accessibility to /usr/bin/osascript via user TCC db"
TCC_USER_DB="$HOME/Library/Application Support/com.apple.TCC/TCC.db"
TCC_SYSTEM_DB="/Library/Application Support/com.apple.TCC/TCC.db"
NOW=$(date +%s)
# Column order per macOS 13+ schema; auth_value=2 (allowed), client_type=1 (path)
TCC_SQL="INSERT OR REPLACE INTO access (service, client, client_type, auth_value, auth_reason, auth_version, indirect_object_identifier, flags, last_modified) VALUES ('kTCCServiceAccessibility', '/usr/bin/osascript', 1, 2, 4, 1, 'UNUSED', 0, ${NOW});"

mkdir -p "$(dirname "$TCC_USER_DB")"
sqlite3 "$TCC_USER_DB" "$TCC_SQL" 2>/dev/null || true
sudo sqlite3 "$TCC_SYSTEM_DB" "$TCC_SQL" 2>/dev/null || true

# Re-load tccd so the new grant takes effect without reboot.
sudo killall tccd 2>/dev/null || true
killall tccd 2>/dev/null || true

echo "==> verifying osascript Accessibility grant"
osascript -e 'tell application "System Events" to get name of every process' >/dev/null || {
  echo "osascript cannot drive System Events — Accessibility grant did not take effect" >&2
  exit 1
}

echo "==> opening Safari to attach settings toggles"
open -a Safari
sleep 3

echo "==> enabling Show Develop menu"
osascript <<'APPLESCRIPT'
tell application "Safari" to activate
delay 1
tell application "System Events"
  tell process "Safari"
    set frontmost to true
    click menu item "Settings…" of menu 1 of menu bar item "Safari" of menu bar 1
    delay 1
    tell window 1
      try
        click button "Advanced" of toolbar 1
      on error
        click radio button "Advanced" of toolbar 1
      end try
      delay 0.5
      repeat with cb in (checkboxes of group 1 whose name contains "Develop" or name contains "features for web developers")
        if value of cb is 0 then click cb
      end repeat
    end tell
    keystroke "w" using command down
    delay 0.5
  end tell
end tell
APPLESCRIPT

echo "==> enabling Allow Remote Automation"
osascript <<'APPLESCRIPT'
tell application "Safari" to activate
delay 0.5
tell application "System Events"
  tell process "Safari"
    set automationItem to menu item "Allow Remote Automation" of menu 1 of menu bar item "Develop" of menu bar 1
    if value of attribute "AXMenuItemMarkChar" of automationItem is not "✓" then
      click automationItem
    end if
  end tell
end tell
APPLESCRIPT

echo "==> enabling Allow unsigned extensions"
osascript <<'APPLESCRIPT'
tell application "Safari" to activate
delay 0.5
tell application "System Events"
  tell process "Safari"
    click menu item "Developer Settings…" of menu 1 of menu bar item "Develop" of menu bar 1
    delay 1
    tell window 1
      repeat with cb in (checkboxes whose name contains "unsigned")
        if value of cb is 0 then click cb
      end repeat
    end tell
    keystroke "w" using command down
  end tell
end tell
APPLESCRIPT

echo "==> done"
