import js from '@eslint/js';
import globals from 'globals';

import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  js.configs.recommended,
  eslintPluginPrettierRecommended,
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
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Program > ExpressionStatement > AwaitExpression',
          message: 'Global await in module body is not allowed.',
        },
      ],
    },
  },
  {
    files: ['scripts/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
  {
    files: ['tests/**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.mocha,
      },
    },
  },
  {
    ignores: [
      'dist/*',
      'xcode/*',
      'src/rule_resources*',
      'web-ext-artifacts/*',
    ],
  },
];
