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

# SecurityAgent password prompts (e.g. the one "Allow unsigned extensions"
# triggers on macOS 15+) need an actual password. Set one we control so the
# AppleScript toggler can type it. Safe on ephemeral GitHub Actions runners.
if [ -n "${GITHUB_ACTIONS:-}" ] && [ "$(id -un)" = "runner" ]; then
  echo "==> setting runner password for SecurityAgent prompts"
  # `sysadminctl` is the modern Directory Services CLI. The old value is empty
  # on GitHub runners; pass -oldPassword "" so we don't get rejected.
  sudo sysadminctl -resetPasswordFor runner -newPassword wdio-safari -adminUser runner -adminPassword "" 2>/dev/null || \
    sudo dscl . -passwd /Users/runner wdio-safari 2>/dev/null || true
  export SAFARI_ADMIN_PASSWORD=wdio-safari
fi

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
# Stop Safari + cfprefsd so writes aren't overwritten in memory.
killall Safari 2>/dev/null || true
killall cfprefsd 2>/dev/null || true
sleep 1

for domain in com.apple.Safari com.apple.SafariTechnologyPreview com.apple.Safari.SandboxBroker; do
  defaults write "$domain" IncludeDevelopMenu -bool true 2>/dev/null || true
  defaults write "$domain" IncludeInternalDebugMenu -bool true 2>/dev/null || true
  defaults write "$domain" ShowDevelopMenu -bool true 2>/dev/null || true
  defaults write "$domain" WebKitDeveloperExtras -bool true 2>/dev/null || true
  defaults write "$domain" WebKitDeveloperExtrasEnabledPreferenceKey -bool true 2>/dev/null || true
  defaults write "$domain" AllowRemoteAutomation -bool true 2>/dev/null || true
  defaults write "$domain" AllowUnsignedWebExtensions -bool true 2>/dev/null || true
  defaults write "$domain" AllowUnsignedExtensions -bool true 2>/dev/null || true
done

# Also poke Safari's sandboxed preferences via plutil, in case `defaults` is
# writing to the non-sandboxed plist that Safari doesn't actually read.
for plist in \
  "$HOME/Library/Preferences/com.apple.Safari.plist" \
  "$HOME/Library/Containers/com.apple.Safari/Data/Library/Preferences/com.apple.Safari.plist"; do
  [ -f "$plist" ] || continue
  plutil -replace AllowUnsignedExtensions -bool true "$plist" 2>/dev/null || true
  plutil -replace AllowUnsignedWebExtensions -bool true "$plist" 2>/dev/null || true
  plutil -replace AllowRemoteAutomation -bool true "$plist" 2>/dev/null || true
done

echo "==> opening Safari to attach settings toggles"
open -a Safari
sleep 3

echo "==> enabling Show Develop menu"
osascript 2>&1 <<'APPLESCRIPT'
on findAndClickCheckbox(root, needles)
  using terms from application "System Events"
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
      repeat with child in (UI elements of root)
        if my findAndClickCheckbox(child, needles) then return true
      end repeat
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

echo "==> diagnosing Safari state after restart"
osascript 2>&1 <<'APPLESCRIPT'
tell application "Safari"
  activate
  try
    make new document
  end try
end tell
delay 2
tell application "System Events"
  tell process "Safari"
    set frontmost to true
    delay 0.5
    log "menu bar items: " & (name of every menu bar item of menu bar 1)
    log "window count: " & (count of windows)
    repeat with w in windows
      try
        log "window: " & (name of w)
      end try
    end repeat
  end tell
end tell
APPLESCRIPT

echo "==> enabling Allow Remote Automation + Allow unsigned extensions (Developer tab)"
# On macOS Sequoia+ these moved from the Develop menu into Safari Settings →
# Developer. Open that pane and toggle the checkboxes there.
osascript 2>&1 <<'APPLESCRIPT'
on confirmAnyConfirmationSheet()
  using terms from application "System Events"
    -- Some checkboxes (Allow unsigned extensions) pop a confirmation sheet
    -- after click. Approve anything that looks like "Allow"/"Enable"/"OK".
    tell process "Safari"
      repeat 10 times
        try
          if (count of sheets of window 1) > 0 then
            set s to sheet 1 of window 1
            set clicked to false
            repeat with btn in (buttons of s)
              try
                set bn to name of btn as text
                if bn is in {"Allow", "Enable", "Continue", "OK"} then
                  click btn
                  set clicked to true
                  exit repeat
                end if
              end try
            end repeat
            if clicked then exit repeat
          end if
        end try
        delay 0.3
      end repeat
    end tell
  end using terms from
end confirmAnyConfirmationSheet

on findAndClickCheckbox(root, needles)
  using terms from application "System Events"
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
            -- Try click, AXPress, focus+space, and setting value. Different
            -- Safari controls accept different mechanisms on recent macOS.
            try
              click root
              delay 0.3
              my confirmAnyConfirmationSheet()
              delay 0.5
            end try
            if value of root is 0 then
              try
                perform action "AXPress" of root
                delay 0.3
                my confirmAnyConfirmationSheet()
                delay 0.5
              end try
            end if
            if value of root is 0 then
              try
                set focused of root to true
                delay 0.2
                keystroke space
                delay 0.3
                my confirmAnyConfirmationSheet()
                delay 0.5
              end try
            end if
            if value of root is 0 then
              try
                set value of root to 1
                delay 0.3
                my confirmAnyConfirmationSheet()
                delay 0.5
              end try
            end if
            if value of root is 0 then
              error ("Failed to toggle checkbox '" & elementName & "' after click + AXPress + space + set value")
            end if
          end if
          return true
        end if
      end repeat
    end if
    try
      repeat with child in (UI elements of root)
        if my findAndClickCheckbox(child, needles) then return true
      end repeat
    end try
    return false
  end using terms from
end findAndClickCheckbox

on dumpCheckboxes(root, indent)
  using terms from application "System Events"
    set output to ""
    try
      set elementRole to ""
      try
        set elementRole to role of root as text
      end try
      if elementRole is "AXCheckBox" then
        set n to ""
        try
          set n to name of root as text
        end try
        set v to ""
        try
          set v to value of root as text
        end try
        set output to output & indent & "checkbox name=" & n & " value=" & v & linefeed
      end if
      try
        repeat with child in (UI elements of root)
          set output to output & my dumpCheckboxes(child, indent & "  ")
        end repeat
      end try
    end try
    return output
  end using terms from
end dumpCheckboxes

tell application "Safari"
  activate
  try
    make new document
  end try
end tell
delay 1
tell application "System Events"
  tell process "Safari"
    set frontmost to true
    click menu item "Settings…" of menu 1 of menu bar item "Safari" of menu bar 1
    delay 1.5
    -- Developer tab only appears after "Show features for web developers"
    -- was enabled in the Advanced pane (done in the previous step).
    try
      click button "Developer" of toolbar 1 of window 1
    on error
      try
        click radio button "Developer" of toolbar 1 of window 1
      on error
        error "No Developer tab in Safari Settings toolbar — 'Show features for web developers' was not persisted"
      end try
    end try
    delay 1
    log "Developer pane checkboxes:" & linefeed & my dumpCheckboxes(window 1, "")
    set ok1 to my findAndClickCheckbox(window 1, {"Remote Automation"})
    if not ok1 then error "Could not find 'Allow Remote Automation' in Developer pane"
    -- Click "Allow unsigned extensions" and answer the SecurityAgent password
    -- prompt it triggers on macOS 15+.
    set pw to ""
    try
      set pw to system attribute "SAFARI_ADMIN_PASSWORD"
    end try
    try
      my findAndClickCheckbox(window 1, {"unsigned"})
    end try
    if pw is not "" then
      delay 1
      repeat 30 times
        try
          tell process "SecurityAgent"
            if exists window 1 then
              set frontmost to true
              keystroke pw
              delay 0.3
              keystroke return
              exit repeat
            end if
          end tell
        end try
        delay 0.3
      end repeat
      delay 1
    end if
    keystroke "w" using command down
  end tell
end tell
APPLESCRIPT

echo "==> done"
