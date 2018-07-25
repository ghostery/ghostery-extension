/**
 * Header Container
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

import { connect } from 'react-redux';
import { withRouter } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import Header from '../components/Header';
import * as actions from '../actions/PanelActions'; // get shared actions from Panel
import { logout } from '../../Account/AccountActions';
/**
 * Map redux store state properties to Header component own properties.
 * @memberOf PanelContainers
 * @param  {Object} state    entire Redux store's state
 * @param  {Object} ownProps props passed to the connected component
 * @return {function}        this function returns plain object, which will be merged into Header component props
 * @todo  We are not using ownProps, so we better not specify it explicitly,
 * in this case it won't be passed by React (see https://github.com/reactjs/react-redux/blob/master/docs/api.md).
 */
const mapStateToProps = state => Object.assign({}, state.header, state.account, {
	// get properties from panel redux store
	is_expert: state.panel.is_expert,
	language: state.panel.language,
	tab_id: state.panel.tab_id,
});
/**
 * Bind Header component action creators using Redux's bindActionCreators. Pass updated match, location, and history props to the wrapped component.
 * @memberOf PanelContainers
 * @param  {function} 	dispatch  redux store method which dispatches actions
 * @param  {Object} 	ownProps  Header component own props
 * @return {function}          	  to be used as an argument in redux connect call
 */
const mapDispatchToProps = dispatch => ({ actions: bindActionCreators(Object.assign(actions, { logout }), dispatch) });
/**
 * Connects Header component to the Redux store.
 * @memberOf PanelContainers
 * @param {function} mapStateToProps 		maps redux store state properties to Header component own properties
 * @param {function} mapDispatchToProps 	binds Header component action creators
 * @return {Object}  						A higher-order React component class that passes state and action
 *                           				creators into Header component. Used by React framework.
 */
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Header));
