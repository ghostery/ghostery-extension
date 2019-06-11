/**
 * Toast Message Component
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
 * A Functional React component for a Toast Message
 * @return {JSX} JSX for rendering a Toast Message
 * @memberof SharedComponents
 */
const ToastMessage = props => (
	<div className="ToastMessage full-width">
		{props.toastText && (
			<div className="callout-container">
				<div className={`callout toast ${props.toastClass}`}>
					<div className="flex-container align-center-middle">
						<div className="callout-text">
							{props.toastText}
						</div>
						{props.toastExit && (
							<div className="ToastMessage__close clickable" onClick={props.toastExit} />
						)}
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
	toastExit: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.bool,
	]),
};

// Default props used in the Toast Message
ToastMessage.defaultProps = {
	toastExit: false,
};

export default ToastMessage;
