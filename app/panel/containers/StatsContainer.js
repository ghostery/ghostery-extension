/**
 * Stats Container
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
import Stats from '../components/Stats';

/**
 * Map redux store state properties to Subscription view component own properties.
 * @memberOf PanelContainers
 * @param  {Object} state    entire Redux store's state
 * @param  {Object} ownProps props passed to the connected component
 * @return {function}        this function returns plain object, which will be merged into Subscription view component props
 * @todo  We are not using ownProps, so we better not specify it explicitly,
 * in this case it won't be passed by React (see https://github.com/reactjs/react-redux/blob/master/docs/api.md).
 */
const mapStateToProps = state => Object.assign({}, state.account, {});

/**
 * Connects Subscription view component to the Redux store. Pass updated match, location, and history props to the wrapped component.
 * @memberOf PanelContainers
 * @param {function} mapStateToProps 		maps redux store state properties to Subscription view component own properties
 * @param {function} mapDispatchToProps 	binds Subscription view component action creators
 * @return {Object}  						A higher-order React component class that passes state and action
 *                           				creators into Subscription view component. Used by React framework.
 */
export default connect(mapStateToProps)(Stats);
