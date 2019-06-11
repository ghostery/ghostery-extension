/**
 * Combine Reducers
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
/**
 * @namespace  PanelReactReducers
 */
import { combineReducers } from 'redux';
import panel from './panel';
import summary from './summary';
import detail from './detail';
import rewards from './rewards';
import blocking from './blocking';
import settings from './settings';
import account from '../../Account/AccountReducer';

/**
 * Export combined reducers object which provides
 * the full list of reducers. To be imported by React.
 * @memberOf  PanelReactReducers
 *
 * @param  {Object} argument	object literal with all redicers as its properties
 * @return {Object}        		combined reducers object
 */
const Reducers = combineReducers({
	panel,
	summary,
	detail,
	rewards,
	blocking,
	settings,
	account,
});

export default Reducers;
