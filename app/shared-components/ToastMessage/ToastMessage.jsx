/**
 * Toast Message Component
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

import React from 'react';
import PropTypes from 'prop-types';

/**
 * A Functional React component for a Toast Message
 * @return {JSX} JSX for rendering a Toast Message
 * @memberof SharedComponents
 */
const ToastMessage = props => (
	<div className="ToastMessage">
		{props.toastText && (
			<div className="callout-container">
				<div className={`callout toast ${props.toastClass}`}>
					<div className="callout-text">
						{props.toastText}
					</div>
				</div>
			</div>
		)}
	</div>
);

// PropTypes ensure we pass required props of the correct type
ToastMessage.propTypes = {
	toastText: PropTypes.string.isRequired,
	toastClass: PropTypes.string.isRequired,
};

export default ToastMessage;
