#!/usr/bin/env bash

# Pulls the translations of the Xcode project from Transifex,
# and imports them to the project
#
# Usage:
# * npm run xcode-import-locales

set -eo pipefail

# Only the translated strings, so the untranslated ones aren't imported in
# English. Forced, as the files of an export are newer than the translations.
tx pull --translations --force --mode onlytranslated "$@" ghostery-dnr-extension.xcode

for path in ./xcode/*.xcloc; do
  language=$(basename "$path" .xcloc)
  file="$path/Localized Contents/$language.xliff"
  if [ "$language" == "en" ] || [ ! -f "$file" ]; then
    continue
  fi

  # Xcode imports the translations to the language set in the file, which
  # Transifex can set with its own codes, like pt_BR for pt-BR
  sed -E -i '' \
    -e 's/ target-language="[^"]*"//g' \
    -e "s/<file([ >])/<file target-language=\"$language\"\1/g" \
    "$file"

  # Transifex keeps the state of the translations from the source file,
  # where Xcode exports them as new, and Xcode doesn't import the new ones.
  # So the translations are marked as translated, but not the empty ones,
  # which are the untranslated strings.
  perl -0pi -e 's{<target state="new">(?!</target>)}{<target state="translated">}g' "$file"

  echo "Importing translations for $language"
  # Without the warnings about the InfoPlist.xcstrings, which the export
  # leaves out, as their strings aren't translated
  xcodebuild -importLocalizations -project ./xcode/Ghostery.xcodeproj -localizationPath "$file" -quiet 2>&1 |
    sed '/InfoPlist\.xcstrings: File not found in the XLIFF/d'
done
