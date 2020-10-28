/**
 * Subscribe Component
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
import { NavLink } from 'react-router-dom';
import PanelToTabLink from './BuildingBlocks/PanelToTabLink';
import { sendMessage, openCheckoutPage } from '../utils/msg';
import globals from '../../../src/classes/Globals';

const { GHOSTERY_BASE_URL } = globals;

/**
 * Helper function to handle clicking on the Become a Subscriber button
 */
function _handleBecomeClick() {
	sendMessage('ping', 'plus_cta_extension');
	openCheckoutPage({
		utm_source: 'gbe',
		utm_campaign: 'in_app_plus'
	});
}

/**
 * Render Subscribe panel.
 * @return {ReactComponent}   ReactComponent instance
 */
const Subscribe = ({ match }) => {
	const { loggedIn } = match.params;
	return (
		<div className="content-subscription">
			<div className="badge" />
			<div className="pitch-container">
				<span className="pitch-text" dangerouslySetInnerHTML={{ __html: t('subscribe_pitch') }} />
			</div>
			<PanelToTabLink href={`${GHOSTERY_BASE_URL}/pricing/?utm_source=gbe&utm_campaign=in_app_plus_lm`}>
				<span className="pitch-learn-more">{t('subscribe_pitch_learn_more')}</span>
			</PanelToTabLink>
			<div>
				<span className="pitch-become-subscriber" onClick={_handleBecomeClick}>{t('get_ghostery_plus_bang')}</span>
			</div>
			{(loggedIn === 'false') && (
				<NavLink to="/login" className="pitch-already-subscriber">
					<span>{t('already_subscribed_sign_in')}</span>
				</NavLink>
			)}
		</div>
	);
};

export default Subscribe;
