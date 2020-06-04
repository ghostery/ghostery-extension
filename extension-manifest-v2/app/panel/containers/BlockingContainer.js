/**
 * Blocking Container
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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Blocking from '../components/Blocking';
import * as blockingActions from '../actions/BlockingActions';
import { updateTrackerCounts } from '../actions/SummaryActions';
import { showNotification, toggleCliqzFeature } from '../actions/PanelActions';
/**
 * Map redux store state properties to Blocking view component own properties.
 * @memberOf PanelContainers
 * @param  {Object} state    entire Redux store's state
 * @param  {Object} ownProps props passed to the connected component
 * @return {function}        this function returns plain object, which will be merged into Blocking view props
 * @todo  We are not using ownProps, so we better not specify it explicitly,
 * in this case it won't be passed by React (see https://github.com/reactjs/react-redux/blob/master/docs/api.md).
 */
const mapStateToProps = state => ({
	...state.blocking,
	is_expanded: state.panel.is_expanded,
	language: state.panel.language,
	smartBlock: state.panel.smartBlock,
	enable_anti_tracking: state.panel.enable_anti_tracking,
	pageHost: state.summary.pageHost,
	paused_blocking: state.summary.paused_blocking,
	sitePolicy: state.summary.sitePolicy,
	smartBlockActive: state.panel.enable_smart_block
});
/**
 * Bind Blocking view component action creators using Redux's bindActionCreators
 * @memberOf PanelContainers
 * @param  {function} 	dispatch  redux store method which dispatches actions
 * @param  {Object} 	ownProps  Blocking view component own props
 * @return {function}          	  to be used as an argument in redux connect call
 */
const mapDispatchToProps = dispatch => ({
	actions: bindActionCreators(
		Object.assign(blockingActions, {
			updateTrackerCounts,
			showNotification,
			toggleCliqzFeature
		}),
		dispatch
	)
});
/**
 * Connects Blocking component to the Redux store.
 * @memberOf PanelContainers
 * @param {function} mapStateToProps 		maps redux store state properties to Blocking component own properties
 * @param {function} mapDispatchToProps 	binds Blocking view action creators
 * @return {Object}  						A higher-order React component class that passes state and action creators
 *                           				into Blocking view component. Used by React framework.
 */
export default connect(mapStateToProps, mapDispatchToProps)(Blocking);
