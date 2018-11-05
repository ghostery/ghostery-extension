/**
 * Tutorial View Test Reducer
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import Immutable from 'seamless-immutable';
import TutorialViewReducer from '../TutorialViewReducer';
import { INIT_TUTORIAL_PROPS, SET_TUTORIAL_NAVIGATION } from '../TutorialViewConstants';

// Copied from Tutorial View Container Default Props
const initialState = Immutable({
	tutorial: {
		navigation: {
			activeIndex: 0,
			hrefPrev: false,
			hrefNext: false,
			hrefDone: false,
			textPrev: false,
			textNext: false,
			textDone: false,
		},
	},
});

describe('app/hub/Views/TutorialView reducer', () => {
	test('initial state is correct', () => {
		expect(TutorialViewReducer(undefined, {})).toEqual({});
	});

	test('reducer correctly handles INIT_TUTORIAL_PROPS', () => {
		const data = initialState.tutorial;
		const action = { data, type: INIT_TUTORIAL_PROPS };
		const initState = Immutable({});

		expect(TutorialViewReducer(initState, action)).toEqual(initialState);
	});

	test('reducer correctly handles SET_TUTORIAL_NAVIGATION', () => {
		const data = {
			activeIndex: 2,
			hrefPrev: '/test/1',
			hrefNext: '/test/3',
			hrefDone: '/',
			textPrev: 'Back',
			textNext: 'Next',
			textDone: 'Exit',
		};
		const action = { data, type: SET_TUTORIAL_NAVIGATION };

		const updatedTutorialState = Immutable.merge(initialState.tutorial, {
			navigation: data,
		});

		expect(TutorialViewReducer(initialState, action)).toEqual({
			tutorial: updatedTutorialState
		});
	});
});
