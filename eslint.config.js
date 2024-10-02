import js from '@eslint/js';
import globals from 'globals';

import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.serviceworker,
        ...globals.webextensions,
        __PLATFORM__: 'readonly',
      },

      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    files: ['scripts/**/*.js', 'tests/**/*.js'],
  },
  {
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
    files: ['tests/**/*.spec.js'],
  },
  {
    ignores: ['dist/*', 'xcode/*', 'src/rule_resources*'],
  },
];
