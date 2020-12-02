/**
 * React Utility Imports
 * Import files from app to prevent duplicate code
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import {
	applyMiddleware,
	compose,
	combineReducers,
	createStore,
	bindActionCreators
} from 'redux';
import { connect } from 'react-redux';

// Imports utilities from elsewhere in the codebase to reduce duplicate code
import { log } from '../../../src/utils/common';
import { sendMessage as importedSM, sendMessageInPromise as importedSMIP } from '../../panel/utils/msg';

const sendMessageInPromise = function(name, message) {
	return importedSMIP(name, message, 'ghostery-hub');
};

const sendMessage = function(name, message) {
	return importedSM(name, message, 'ghostery-hub');
};

/**
 * @since 8.5.5
 *
 * Build store using provided reducers and middlewares.
 *
 * @param	{Object} reducers			The reducers to combine.
 * @param	{Array}	 [middlewares]		(Optional) The middlewares to apply, in the order they should be applied.
 * @return 	{Object}					The store created by calling redux's createStore with the provided reducers and middlewares.
 * @memberof Utils
 */
const createStoreFactory = function(reducers, middlewares) {
	const reducer = combineReducers(reducers);

	return createStore(
		reducer,
		compose(
			applyMiddleware(...middlewares),
			window.devToolsExtension ? window.devToolsExtension() : f => f
		),
	);
};

/**
 * @since 8.5.5
 *
 * Uses react-redux's connect to wrap the provided base component in a HOC,
 * with the provided state slices mapped to props and the provided action creators dispatch mapped to props.actions.
 *
 * @param {Array|null} 		stateKeys		The slices of the Redux state store you want to map to props. Pass null if none.
 * @param {Object|null} 	actionCreators	The action creators you want to dispatch map to props.actions. Pass null if none.
 * @param {*}				baseComponent	The React component you want to wrap.
 *
 * @returns {*}								The created HOC.
 */
function buildReduxHOC(stateKeys, actionCreators, baseComponent) {
	const mapStateToProps = (stateKeys === null)
		? null
		: state => stateKeys.reduce((acc, key) => ({ ...acc, ...state[key] }), {});

	const mapDispatchToProps = (actionCreators === null)
		? null
		: dispatch => ({
			actions: bindActionCreators(actionCreators, dispatch)
		});

	return connect(mapStateToProps, mapDispatchToProps)(baseComponent);
}

export {
	buildReduxHOC,
	createStoreFactory,
	log,
	sendMessage,
	sendMessageInPromise
};
