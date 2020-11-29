/**
 * Point of entry index.js file for Ghostery Browser Hub Onboarding View
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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';

import OnboardingViewContainer from './OnboardingViewContainer';
import OnboardingViewReducer from './OnboardingViewReducer';
import * as MainViewActions from './MainViewActions';
import setBlockingPolicy from '../OnboardingViews/BlockingView/BlockingViewActions';
import {
	setAntiTracking,
	setAdBlock,
	setSmartBlocking,
	setGhosteryRewards
} from '../OnboardingViews/AntiSuiteView/AntiSuiteViewActions';
import setHumanWeb from '../OnboardingViews/SetupHumanWebView/SetupHumanWebViewActions';
import setSetupComplete from '../OnboardingViews/SetupDoneView/SetupDoneViewActions';

/**
 * Map redux store state properties to the component's own properties.
 * @param  {Object} state    entire Redux store's state
 * @return {function}        this function returns a plain object, which will be merged into the component's props
 * @memberof HubContainers
 */
const mapStateToProps = state => ({ ...state.setup, ...state.account });

/**
 * Bind the component's action creators using Redux's bindActionCreators.
 * @param  {function} dispatch redux store method which dispatches actions
 * @return {function}          to be used as an argument in redux connect call
 * @memberof SetupContainers
 */
const mapDispatchToProps = dispatch => ({
	actions: bindActionCreators({
		...SetupViewActions,
		setBlockingPolicy,
		setAntiTracking,
		setAdBlock,
		setSmartBlocking,
		setGhosteryRewards,
		setHumanWeb,
		setSetupComplete
	}, dispatch),
});

export const reducer = OnboardingViewReducer;

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(OnboardingViewContainer));



