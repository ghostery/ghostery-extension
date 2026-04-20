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

echo "==> shotgunning Safari defaults (some keys silently ignored on newer macOS)"
for domain in com.apple.Safari com.apple.SafariTechnologyPreview; do
  defaults write "$domain" IncludeDevelopMenu -bool true 2>/dev/null || true
  defaults write "$domain" IncludeInternalDebugMenu -bool true 2>/dev/null || true
  defaults write "$domain" ShowDevelopMenu -bool true 2>/dev/null || true
  defaults write "$domain" WebKitDeveloperExtras -bool true 2>/dev/null || true
  defaults write "$domain" WebKitDeveloperExtrasEnabledPreferenceKey -bool true 2>/dev/null || true
  defaults write "$domain" AllowRemoteAutomation -bool true 2>/dev/null || true
  defaults write "$domain" AllowUnsignedWebExtensions -bool true 2>/dev/null || true
done

echo "==> opening Safari to attach settings toggles"
open -a Safari
sleep 3

echo "==> enabling Show Develop menu"
osascript 2>&1 <<'APPLESCRIPT'
on findAndClickCheckbox(root, needles)
  using terms from application "System Events"
    try
      set elementName to ""
      try
        set elementName to name of root as text
      end try
      set elementRole to ""
      try
        set elementRole to role of root as text
      end try
      if elementRole is "AXCheckBox" then
        repeat with n in needles
          if elementName contains n then
            if value of root is 0 then
              click root
              delay 0.5
              if value of root is 0 then
                -- `click` sometimes no-ops on recent macOS; fall back to AXPress.
                try
                  perform action "AXPress" of root
                  delay 0.5
                end try
              end if
              if value of root is 0 then
                error ("Failed to toggle checkbox '" & elementName & "' (still 0 after click + AXPress)")
              end if
            end if
            return true
          end if
        end repeat
      end if
      try
        set children to UI elements of root
        repeat with child in children
          if my findAndClickCheckbox(child, needles) then return true
        end repeat
      end try
    end try
    return false
  end using terms from
end findAndClickCheckbox

on dumpTree(root, indent)
  using terms from application "System Events"
    set output to ""
    try
      set r to ""
      try
        set r to role of root as text
      end try
      set n to ""
      try
        set n to name of root as text
      end try
      set v to ""
      try
        set v to value of root as text
      end try
      set output to output & indent & r & " name=" & n & " value=" & v & linefeed
      try
        repeat with child in (UI elements of root)
          set output to output & my dumpTree(child, indent & "  ")
        end repeat
      end try
    end try
    return output
  end using terms from
end dumpTree

tell application "Safari" to activate
delay 1
tell application "System Events"
  tell process "Safari"
    set frontmost to true
    click menu item "Settings…" of menu 1 of menu bar item "Safari" of menu bar 1
    delay 1.5
    try
      click button "Advanced" of toolbar 1 of window 1
    on error
      try
        click radio button "Advanced" of toolbar 1 of window 1
      end try
    end try
    delay 1
  end tell
end tell

tell application "System Events"
  tell process "Safari"
    set ok to my findAndClickCheckbox(window 1, {"features for web developers", "Show Develop"})
    if not ok then error "No matching checkbox found for 'Show Develop' in Advanced pane"
    keystroke "w" using command down
    delay 0.5
  end tell
end tell
APPLESCRIPT

echo "==> restarting Safari so the new menu bar takes effect"
osascript -e 'tell application "Safari" to quit' 2>/dev/null || true
killall Safari 2>/dev/null || true
sleep 2
open -a Safari
sleep 3

echo "==> enabling Allow Remote Automation"
osascript 2>&1 <<'APPLESCRIPT'
tell application "Safari" to activate
delay 2
tell application "System Events"
  tell process "Safari"
    -- Poll for the Develop menu to appear (toggling the Settings checkbox is
    -- not instantaneous).
    repeat 25 times
      try
        set _ to menu bar item "Develop" of menu bar 1
        exit repeat
      on error
        delay 0.4
      end try
    end repeat
    set automationItem to menu item "Allow Remote Automation" of menu 1 of menu bar item "Develop" of menu bar 1
    if value of attribute "AXMenuItemMarkChar" of automationItem is not "✓" then
      click automationItem
    end if
  end tell
end tell
APPLESCRIPT

echo "==> enabling Allow unsigned extensions"
osascript 2>&1 <<'APPLESCRIPT'
on findAndClickCheckbox(root, needles)
  using terms from application "System Events"
    try
      set elementName to ""
      try
        set elementName to name of root as text
      end try
      set elementRole to ""
      try
        set elementRole to role of root as text
      end try
      if elementRole is "AXCheckBox" then
        repeat with n in needles
          if elementName contains n then
            if value of root is 0 then
              click root
              delay 0.5
              if value of root is 0 then
                try
                  perform action "AXPress" of root
                  delay 0.5
                end try
              end if
              if value of root is 0 then
                error ("Failed to toggle checkbox '" & elementName & "' (still 0 after click + AXPress)")
              end if
            end if
            return true
          end if
        end repeat
      end if
      try
        set children to UI elements of root
        repeat with child in children
          if my findAndClickCheckbox(child, needles) then return true
        end repeat
      end try
    end try
    return false
  end using terms from
end findAndClickCheckbox

tell application "Safari" to activate
delay 1
tell application "System Events"
  tell process "Safari"
    click menu item "Developer Settings…" of menu 1 of menu bar item "Develop" of menu bar 1
    delay 1.5
    set ok to my findAndClickCheckbox(window 1, {"unsigned"})
    if not ok then error "No 'Allow unsigned extensions' checkbox found"
    keystroke "w" using command down
  end tell
end tell
APPLESCRIPT

echo "==> done"
