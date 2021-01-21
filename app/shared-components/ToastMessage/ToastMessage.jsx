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
const ToastMessage = ({
	toastText, toastClass, toastExit, dawnHub
}) => {
	// These variables will be used to determine whether the toast should display with Dawn
	// onboarding styling or the default styling used in GBE
	const dawnHubClass = dawnHub ? 'dawn-hub' : '';
	const dawnLayout = dawnHub ? 'align-justify align-middle' : 'align-center-middle';

	const dawnToastText = dawnHub ? t(`ghostery_dawn_onboarding_toast_${toastClass}`) : '';

	return (
		<div className={`ToastMessage full-width ${dawnHubClass}`}>
			{toastText && (
				<div className="callout-container">
					<div className={`callout toast ${toastClass}`}>
						<div className={`flex-container ${dawnLayout}`}>
							<div className="flex-container align-middle">
								{dawnHub && (
									<img className="ToastMessage_classIcon" src={`/app/images/hub/toast/toast-${toastClass}.svg`} />
								)}
								<div className="callout-text">
									{`${dawnToastText}${toastText}`}
								</div>
							</div>
							{toastExit && (
								<div className="ToastMessage__close clickable" onClick={toastExit} />
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
ToastMessage.propTypes = {
	toastText: PropTypes.string.isRequired,
	toastClass: PropTypes.string.isRequired,
	toastExit: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.bool,
	]),
	dawnHub: PropTypes.bool,
};

// Default props used in the Toast Message
ToastMessage.defaultProps = {
	toastExit: false,
	dawnHub: false,
};

export default ToastMessage;
