/**
 * ESLint Config
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

module.exports = {
	env: {
		browser: true,
		es6: true,
		commonjs: true,
		jest: true
	},
	extends: 'airbnb',
	globals: {
		chrome: true,
		t: true,
		Atomics: 'readonly',
		SharedArrayBuffer: 'readonly',
	},
	parser: 'babel-eslint',
	parserOptions: {
		ecmaFeatures: {
			jsx: true,
		},
		ecmaVersion: 2018,
		sourceType: 'module',
	},
	plugins: [
		'react',
	],
	// 0 = off, 1 = warn, 2 = error
	rules: {
		'arrow-parens': [2, 'as-needed', { 'requireForBlockBody': true }],
		'camelcase': [0],
		'class-methods-use-this': [1],
		'comma-dangle': [2, {
			'arrays': 'only-multiline',
			'objects': 'only-multiline',
			'functions': 'ignore'
		}],
		'func-names': [0],
		'indent': [1, 'tab', {
			'SwitchCase': 1,
			'ignoredNodes': ['TemplateLiteral']
		}],
		'lines-between-class-members': [1],
		'max-len': [0],
		'newline-per-chained-call': [0, { 'ignoreChainWithDepth': 2 }],
		'no-mixed-operators': [1],
		'no-nested-ternary': [0],
		'no-param-reassign': ['error', {
			props: true,
			ignorePropertyModificationsFor: [
				'acc', // for reduce accumulators
				'document', // for IIFE with window & document params
				'c2pFrame', // for mutable iframe c2p element
				'trackerEl', // for trackers.forEach()
				'categoryEl', // for categories.forEach()
				'dataEntry', // for data.forEach()
				'appEntry', // for apps.forEach()
				'sEntry', // for apps.forEach()
				'confMutable', // for mutable conf settings
				'eventMutable', // for mutable event details objects
			]
		}],
		'no-plusplus': [0],
		'no-prototype-builtins': [0],
		'no-restricted-syntax': [1],
		'no-tabs': [0],
		'no-underscore-dangle': [0],
		'no-unused-vars': [1],
		'no-useless-escape': [1],
		'operator-linebreak': [0],
		'prefer-object-spread': [1],
		'space-before-function-paren': [2, 'never'],

		// Plugin: Import
		'import/no-cycle': [0],
		'import/prefer-default-export': [1],

		// Plugin: React
		'react/destructuring-assignment': [1],
		'react/static-property-placement': [0],
		'react/jsx-curly-newline': [0],
		'react/jsx-indent': [1, 'tab'],
		'react/jsx-indent-props': [1, 'tab'],
		'react/jsx-props-no-spreading': [1],
		'react/no-access-state-in-setstate': [1],
		'react/no-danger': [0],
		'react/prop-types': [0],
		'react/jsx-fragments': [1, 'element'],
		'react/sort-comp': [1, {
			order: [
				"static-variables",
				"instance-variables",
				"constructor",
				"static-methods",
				"lifecycle",
				"everything-else",
				"render"
			]
		}],

		// Plugin: JSX-A11y
		'jsx-a11y/alt-text': [0],
		'jsx-a11y/anchor-is-valid': [0],
		'jsx-a11y/click-events-have-key-events': [0],
		'jsx-a11y/label-has-for': [0],
		'jsx-a11y/mouse-events-have-key-events': [0],
		'jsx-a11y/no-noninteractive-element-interactions': [0],
		'jsx-a11y/no-static-element-interactions': [0],
		'jsx-a11y/label-has-associated-control': [0], //ToDo: enable this check. Throws 2 errors, should work.
		'jsx-a11y/media-has-caption': [0], //ToDo: enable this check. Need Captions to enable.
		'jsx-a11y/anchor-has-content': [0], //ToDo: enable this check. Need anchor text to enable.
	},
};
