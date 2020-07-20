/**
 * Setup Header Component
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

/**
 * A Functional React component for rendering the Setup View
 * @return {JSX} JSX for rendering the Setup Header View of the Hub app
 * @memberof HubComponents
 */
const SetupHeader = ({ title, titleImage }) => (
	<div className="row align-center">
		<div className="columns small-12 large-10">
			<div className="SetupHeader flex-container align-center-middle">
				<img src={titleImage} />
				<div className="SetupHeader__title">
					<h3 dangerouslySetInnerHTML={{ __html: title }} />
				</div>
			</div>
		</div>
	</div>
);

// PropTypes ensure we pass required props of the correct type
SetupHeader.propTypes = {
	title: PropTypes.string.isRequired,
	titleImage: PropTypes.string.isRequired,
};

export default SetupHeader;
