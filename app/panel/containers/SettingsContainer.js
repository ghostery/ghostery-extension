/**
 * Settings Container
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
import Settings from '../components/Settings';
import * as settingsActions from '../actions/SettingsActions';
import toggleExpanded from '../actions/DetailActions';
import { updateSitePolicy } from '../actions/SummaryActions';
import { sendSignal } from '../actions/RewardsActions';
/**
 * Map redux store state properties to Settings view component own properties.
 * @memberOf PanelContainers
 * @param  {Object} state    entire Redux store's state
 * @param  {Object} ownProps props passed to the connected component
 * @return {function}        this function returns plain object, which will be merged into Settings view component props
 * @todo  We are not using ownProps, so we better not specify it explicitly,
 * in this case it won't be passed by React (see https://github.com/reactjs/react-redux/blob/master/docs/api.md).
 */
const mapStateToProps = state => ({
	...state.settings,
	user: state.account.user,
	is_expanded: state.panel.is_expanded,
	language: state.panel.language,
	pageHost: state.summary.pageHost,
	pageUrl: state.summary.pageUrl,
	reload_banner_status: state.panel.reload_banner_status,
	sitePolicy: state.summary.sitePolicy,
	site_blacklist: state.summary.site_blacklist,
	site_whitelist: state.summary.site_whitelist,
	trackers_banner_status: state.panel.trackers_banner_status,
	trackerCounts: state.summary.trackerCounts
});
/**
 * Bind Settings view component action creators using Redux's bindActionCreators
 * @memberOf PanelContainers
 * @param  {function} 	dispatch  redux store method which dispatches actions
 * @param  {Object} 	ownProps  Settings view component own props
 * @return {function}          	  to be used as an argument in redux connect call
 */
const mapDispatchToProps = dispatch => ({
	actions: bindActionCreators(Object.assign(settingsActions, {
		toggleExpanded,
		updateSitePolicy,
		sendSignal,
	}), dispatch),
});
/**
 * Connects Settings view component to the Redux store. Pass updated match, location, and history props to the wrapped component.
 * @memberOf PanelContainers
 * @param {function} mapStateToProps 		maps redux store state properties to Settings view component own properties
 * @param {function} mapDispatchToProps 	binds Settings view component action creators
 * @return {Object}  						A higher-order React component class that passes state and action
 *                           				creators into Settings view component. Used by React framework.
 */
export default connect(mapStateToProps, mapDispatchToProps)(Settings);
