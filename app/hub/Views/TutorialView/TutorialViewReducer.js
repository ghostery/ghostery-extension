/**
 * Reducer used throughout the Tutorial View's flow
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */
import { INIT_TUTORIAL_PROPS, SET_TUTORIAL_NAVIGATION } from './TutorialViewConstants';

const initialState = {};

function TutorialViewReducer(state = initialState, action) {
	switch (action.type) {
		// Tutorial View
		case INIT_TUTORIAL_PROPS: {
			const {
				activeIndex,
				hrefPrev,
				hrefNext,
				hrefDone,
				textPrev,
				textNext,
				textDone,
			} = action.data.navigation;
			return {
				...state,
				tutorial: {
					navigation: {
						activeIndex,
						hrefPrev,
						hrefNext,
						hrefDone,
						textPrev,
						textNext,
						textDone,
					}
				}
			};
		}
		case SET_TUTORIAL_NAVIGATION: {
			const {
				activeIndex,
				hrefPrev,
				hrefNext,
				hrefDone,
				textPrev,
				textNext,
				textDone,
			} = action.data;
			return {
				...state,
				tutorial: {
					...state.tutorial,
					navigation: {
						activeIndex,
						hrefPrev,
						hrefNext,
						hrefDone,
						textPrev,
						textNext,
						textDone,
					}
				}
			};
		}

		default: return state;
	}
}

export default TutorialViewReducer;
