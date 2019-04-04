/**
 * Rewards Container
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
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import Rewards from '../components/Rewards';
import * as actions from '../actions/RewardsActions';
import { showNotification } from '../actions/PanelActions';

/**
 * Map redux store state properties to Rewards view own properties.
 * @memberof PanelContainers
 * @param  {Object} state    entire Redux store's state
 * @param  {Object} ownProps props passed to the connected component
 * @return {function}        this function returns plain object, which will be merged into Detailed view props
 * @todo  We are not using ownProps, so we better not specify it explicitly,
 * in this case it won't be passed by React (see https://github.com/reactjs/react-redux/blob/master/docs/api.md).
 */
const mapStateToProps = state => Object.assign({}, state.rewards, {
	is_expanded: state.panel.is_expanded,
});

/**
 * Bind Rewards view action creators using Redux's bindActionCreators
 * @memberof PanelContainers
 * @param  {function} 	dispatch  redux store method which dispatches actions
 * @param  {Object} 	ownProps  Detailed view component own props
 * @return {function}          	  to be used as an argument in redux connect call
 */
const mapDispatchToProps = dispatch => ({
	actions: bindActionCreators(Object.assign(actions, { showNotification }), dispatch)
});

/**
 * Connects Rewards view component to the Redux store. Pass updated match, location, and history props to the wrapped component.
 * @memberof PanelContainers
 * @param {function} mapStateToProps 		maps redux store state properties to Detailed view own properties
 * @param {function} mapDispatchToProps 	binds Detailed view component action creators
 * @return {Object}  						A higher-order React component class that passes state and action
 *                           				creators into Detailed view component. Used by React framework.
 */
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Rewards));
