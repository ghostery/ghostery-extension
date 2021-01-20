/**
 * Point of entry index.js file for Ghostery Browser Hub Choose Default Search View
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

import { withRouter } from 'react-router-dom';
import ChooseDefaultSearchView from './ChooseDefaultSearchView';
import { buildReduxHOC } from '../../../../shared-hub/utils';
import { setSetupStep } from '../../../../shared-hub/actions/SetupLifecycleActions';

const actionCreators = {
	setSetupStep,
};

export default withRouter(buildReduxHOC(null, actionCreators, ChooseDefaultSearchView));
