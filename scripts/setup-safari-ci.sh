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

# Shotgun 'allow unsigned extensions' variants — at least one of these reliably
# prevents Safari from rejecting safaridriver's classic install endpoint.
defaults write com.apple.Safari AllowUnsignedExtensions -bool true
defaults write com.apple.Safari AllowUnsignedWebExtensions -bool true
defaults write com.apple.Safari WebKitAllowUnsignedExtensions -bool true
defaults write com.apple.Safari.SandboxBroker AllowUnsignedExtensions -bool true
defaults write com.apple.Safari.SandboxBroker AllowUnsignedWebExtensions -bool true

sudo safaridriver --enable

# Set a known password on the runner user so the SecurityAgent prompt
# triggered by 'Allow Unsigned Extensions' can be answered via AppleScript.
# GitHub's hosted macOS runners are ephemeral so this is safe.
if [ "$(id -un)" = "runner" ]; then
  echo "==> setting known password on runner user"
  # Try the two common ways; sysadminctl is the preferred Apple CLI.
  sudo sysadminctl -resetPasswordFor runner -newPassword wdio-safari -adminUser runner -adminPassword "" \
    || sudo dscl . -passwd /Users/runner wdio-safari \
    || true
fi

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

echo "==> toggling 'Allow Unsigned Extensions' in Settings > Developer"
# On macOS 15+ this toggle lives in Safari Settings > Developer, not the
# Develop menu. Clicking it triggers a SecurityAgent password prompt; we
# try typing "runner" (the GitHub Actions macOS runner user's password).
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
          if value of root is 0 then click root
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
    try
      click button "Developer" of toolbar 1 of window 1
    on error
      try
        click radio button "Developer" of toolbar 1 of window 1
      end try
    end try
    delay 1
    my findAndClickCheckbox(window 1, {"Remote Automation"})
    my findAndClickCheckbox(window 1, {"unsigned"})
    delay 1
    -- Answer the SecurityAgent password sheet, if any.
    repeat 20 times
      try
        tell process "SecurityAgent"
          if exists window 1 then
            set frontmost to true
            keystroke "wdio-safari"
            delay 0.3
            keystroke return
            exit repeat
          end if
        end tell
      end try
      delay 0.3
    end repeat
    delay 1
    keystroke "w" using command down
  end tell
end tell
APPLESCRIPT

echo "==> done"
