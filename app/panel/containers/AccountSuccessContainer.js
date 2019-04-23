/**
 * Account Success Container
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
 * @namespace  PanelContainers
 */
import { connect } from 'react-redux';
import AccountSuccess from '../components/AccountSuccess';
/**
 * Map redux store state properties to AccountSuccess component own properties.
 * @memberOf PanelContainers
 * @param  {Object} state     entire Redux store's state
 * @param  {Object} ownProps  props passed to the connected component
 * @return {function}         this function returns plain object, which will be merged into AccountSuccess props
 * @todo  We are not using ownProps, so we better not specify it explicitly,
 * in this case it won't be passed by React (see https://github.com/reactjs/react-redux/blob/master/docs/api.md).
 */
const mapStateToProps = state => Object.assign({}, state.accountSuccess, {
	// get properties from panel redux store
	email: state.panel.email,
	is_expert: state.panel.is_expert,
});
/**
 * Connects AccountSuccess component to the Redux store.
 * @param {function} mapStateToProps [description]
 *
 * @return {Object}  	A higher-order React component class that passes state into AccountSuccess. Used by React framework.
 */
export default connect(mapStateToProps)(AccountSuccess);
