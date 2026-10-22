#!/usr/bin/env bash

# Exports the strings of the Xcode project with their translations,
# and pushes the strings to Transifex
#
# Usage:
# * npm run xcode-export-locales
# * npm run xcode-export-locales -- --translation (push the translations too,
#   replacing the ones on Transifex)

set -e

# Languages of the Xcode project, as Xcode names them
LANGUAGES=(en de es fr it ja ko pl pt-BR ru vi zh-Hans zh-Hant)

EXPORT_LANGUAGES=()
for language in "${LANGUAGES[@]}"; do
  EXPORT_LANGUAGES+=(-exportLanguage "$language")
done

rm -rf ./xcode/*.xcloc
xcodebuild -exportLocalizations -project ./xcode/Ghostery.xcodeproj -localizationPath ./xcode "${EXPORT_LANGUAGES[@]}"

# Transifex reads the language of a translation from its file, so the
# languages named differently there, as in lang_map of .tx/config, get
# the codes of Transifex
set_transifex_language() {
  sed -i '' "s/ target-language=\"$1\"/ target-language=\"$2\"/g" "./xcode/$1.xcloc/Localized Contents/$1.xliff"
}
set_transifex_language pt-BR pt_BR
set_transifex_language zh-Hans zh_CN
set_transifex_language zh-Hant zh_TW

tx push --source "$@" ghostery-dnr-extension.xcode
