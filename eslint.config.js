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
        ...globals.node,
        ...globals.serviceworker,
        ...globals.webextensions,
        __PLATFORM__: 'readonly',
      },

      ecmaVersion: 'latest',
      sourceType: 'module',
    },
  },
  {
    ignores: ['src/rule_resources*'],
  }
];
