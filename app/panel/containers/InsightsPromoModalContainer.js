/**
 * InsightsPromoModal Container
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
import InsightsPromoModal from '../components/InsightsPromoModal';
import * as actions from '../actions/PanelActions'; // get shared actions from Panel

/*
 * Bind Login view component action creators using Redux's bindActionCreators
 * @memberOf PanelContainers
 * @param  {function} 	dispatch  redux store method which dispatches actions
 * @param  {Object} 	ownProps  Login view component own props
 * @return {function}          	  to be used as an argument in redux connect call
 */
const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(Object.assign(actions), dispatch) });
/**
 * Connects Login view component to the Redux store.
 * @memberOf PanelContainers
 * @param {function} mapStateToProps 		maps redux store state properties to Login view component own properties
 * @param {function} mapDispatchToProps 	binds Login view component action creators
 * @return {Object}  						A higher-order React component class that passes state and action
 *                           				creators into Login view component. Used by React framework.
 */
export default connect(null, mapDispatchToProps)(InsightsPromoModal);
