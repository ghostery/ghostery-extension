/**
 * Setup Human Web View Component
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

import React from 'react';
import PropTypes from 'prop-types';
import { ToggleCheckbox } from '../../../../shared-components';

/**
 * A Functional React component for rendering the Setup Human Web View
 * @return {JSX} JSX for rendering the Setup Human Web View of the Hub app
 * @memberof HubComponents
 */
const SetupHumanWebView = ({ enableHumanWeb, changeHumanWeb }) => (
	<div className="row align-center">
		<div className="columns small-12 large-10">
			<div className="SetupHumanWeb">
				<div className="SetupHumanWeb__header" dangerouslySetInnerHTML={{ __html: t('hub_setup_humanweb_header') }} />
				<div className="flex-container align-middle">
					<ToggleCheckbox
						checked={enableHumanWeb}
						onChange={changeHumanWeb}
					/>
					<span className="SetupHumanWeb__label" onClick={changeHumanWeb}>
						{ t('hub_setup_humanweb_label') }
					</span>
				</div>
			</div>
		</div>
	</div>
);

// PropTypes ensure we pass required props of the correct type
SetupHumanWebView.propTypes = {
	enableHumanWeb: PropTypes.bool.isRequired,
	changeHumanWeb: PropTypes.func.isRequired,
};

export default SetupHumanWebView;
