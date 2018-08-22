/**
 * Point of entry index.js file for Setup Anti-Suite View
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
import { bindActionCreators } from 'redux';

import SetupAntiSuiteViewContainer from './SetupAntiSuiteViewContainer';
import * as SetupAntiSuiteViewActions from './SetupAntiSuiteViewActions';
import { setSetupNavigation } from '../../SetupView/SetupViewActions';

/**
 * Map redux store state properties to the component's own properties.
 * @param  {Object} state    entire Redux store's state
 * @return {function}        this function returns a plain object, which will be merged into the component's props
 * @memberof HubContainers
 */
const mapStateToProps = state => Object.assign({}, state.setup);

/**
 * Bind the component's action creators using Redux's bindActionCreators.
 * @param  {function} dispatch redux store method which dispatches actions
 * @return {function}          to be used as an argument in redux connect call
 * @memberof SetupContainers
 */
const mapDispatchToProps = dispatch => ({
	actions: bindActionCreators(Object.assign(SetupAntiSuiteViewActions, { setSetupNavigation }), dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SetupAntiSuiteViewContainer);
