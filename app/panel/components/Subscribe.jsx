/**
 * About Component
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
import { NavLink } from 'react-router-dom';
import { sendMessage, openSubscriptionPage } from '../utils/msg';

/**
 * Helper function to handle clicking on the Become a Subscriber button
 */
function _handleBecomeClick() {
	sendMessage('ping', 'supporter_cta_extension');
	openSubscriptionPage();
}

/**
 * Render Subscribe panel.
 * @return {ReactComponent}   ReactComponent instance
 */
const Subscribe = (props) => {
	const { loggedIn } = props.match.params;
	return (
		<div className="content-subscription">
			<div className="badge" />
			<div className="pitch-container">
				<span className="pitch-text" dangerouslySetInnerHTML={{ __html: t('subscribe_pitch') }} />
			</div>
			<a href="https://www.ghostery.com/supporter/" target="_blank" rel="noopener noreferrer">
				<span className="pitch-learn-more">{t('subscribe_pitch_learn_more')}</span>
			</a>
			<div>
				<span className="pitch-become-subscriber" onClick={_handleBecomeClick}>{t('subscribe_pitch_button_label')}</span>
			</div>
			{(loggedIn === 'false') &&
				<NavLink to="/login" className="pitch-already-subscriber">
					<span>{t('subscribe_pitch_sign_here')}</span>
				</NavLink>
			}
		</div>
	);
};

export default Subscribe;
