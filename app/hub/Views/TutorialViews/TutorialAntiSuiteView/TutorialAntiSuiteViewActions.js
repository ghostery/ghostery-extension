/**
 * Tutorial Anti Suite View Action creators
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

import { log, sendMessageInPromise } from '../../../utils';
import { SET_TUTORIAL_COMPLETE } from '../../TutorialView/TutorialViewConstants';

export function setTutorialComplete() {
	return function (dispatch) {
		return sendMessageInPromise(SET_TUTORIAL_COMPLETE).then((data) => {
			dispatch({
				type: SET_TUTORIAL_COMPLETE,
				data,
			});
		}).catch((err) => {
			log('tutorialAntiSuite Action setTutorialComplete Error', err);
		});
	};
}
