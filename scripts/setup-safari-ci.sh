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

echo "==> toggling Safari settings via AppleScript"
# Open Safari once so the settings toggles have a window to attach to.
open -a Safari
sleep 2

osascript <<'APPLESCRIPT' || true
tell application "Safari" to activate
delay 1

tell application "System Events"
  tell process "Safari"
    set frontmost to true

    -- Show Develop menu (Settings > Advanced > "Show features for web developers")
    try
      click menu item "Settings…" of menu 1 of menu bar item "Safari" of menu bar 1
      delay 1
      tell window 1
        try
          click button "Advanced" of toolbar 1
        end try
        delay 0.5
        try
          set cb to checkbox "Show features for web developers"
          if value of cb is 0 then click cb
        end try
        try
          set cb to checkbox "Show Develop menu in menu bar"
          if value of cb is 0 then click cb
        end try
      end tell
      keystroke "w" using command down
      delay 0.5
    end try

    -- Develop > Allow Remote Automation
    try
      set automationItem to menu item "Allow Remote Automation" of menu 1 of menu bar item "Develop" of menu bar 1
      if value of attribute "AXMenuItemMarkChar" of automationItem is not "✓" then
        click automationItem
      end if
    end try

    -- Develop > Developer Settings... > Allow unsigned extensions
    try
      click menu item "Developer Settings…" of menu 1 of menu bar item "Develop" of menu bar 1
      delay 1
      tell window 1
        try
          set cb to checkbox "Allow unsigned extensions"
          if value of cb is 0 then click cb
        end try
      end tell
      keystroke "w" using command down
    end try

  end tell
end tell
APPLESCRIPT

echo "==> done"
