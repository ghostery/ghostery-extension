/**
 * Point of entry index.js file for Ghostery Browser Hub Onboarding Block Settings View
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

import BlockSettingsView from './BlockSettingsView';
import { setAntiTracking, setAdBlock, setSmartBlocking } from '../../../../shared-hub/actions/AntiSuiteActions';
import { setBlockingPolicy } from '../../../../shared-hub/actions/BlockingPolicyActions';
import { setToast } from '../../../../shared-hub/actions/ToastActions';

/**
 * Bind the component's action creators using Redux's bindActionCreators.
 * @param  {function} dispatch redux store method which dispatches actions
 * @return {function}          to be used as an argument in redux connect call
 */
const mapDispatchToProps = dispatch => ({
	actions: bindActionCreators({
		setAntiTracking,
		setAdBlock,
		setSmartBlocking,
		setBlockingPolicy,
		setToast,
	}, dispatch),
});

export default connect(null, mapDispatchToProps)(BlockSettingsView);
