#!/usr/bin/env bash

# Pulls the translations of the Xcode project from Transifex,
# and imports them to the project
#
# Usage:
# * npm run xcode-import-locales

set -e

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

  echo "Importing translations for $language"
  xcodebuild -importLocalizations -project ./xcode/Ghostery.xcodeproj -localizationPath "$file" -quiet
done
