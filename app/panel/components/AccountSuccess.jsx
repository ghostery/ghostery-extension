/**
 * Account Success Component
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
import PropTypes from 'prop-types';

/**
 * @class Implement Account Success component which opens
 * in place of Sign In view on successful signing.
 * @memberof PanelClasses
 */
const AccountSuccess = ({ email, is_expert }) => (
	<div id="signin-success-panel">
		<div className="row align-center">
			<div className="small-11 columns text-center">
				<h3 className="signin-success-title">{ t('panel_signin_success_title') }</h3>
				<p>{ t('panel_signin_success') }</p>
				<h3 className="signin-success-email">{ email }</h3>
				<div className="premium-sparkles-icon" />
				<h4 className="signin-premium-benefits">{ t('panel_signin_premium_benefits') }</h4>
				<a className="learn-more-button" href="https://ghostery.com/midnight?utm_source=gbe&utm_campaign=in_app_account_creation_success" alt={t('learn_more')} target="_blank" rel="noopener noreferrer">
					{t('learn_more')}
				</a>
				<NavLink className="no-thanks-maybe-later text-center" to={is_expert ? '/detail' : '/'}>
					{t('subscribe_pitch_no_thanks')}
				</NavLink>
			</div>
		</div>
	</div>
);

// PropTypes ensure we pass required props of the correct type
AccountSuccess.propTypes = {
	is_expert: PropTypes.bool.isRequired,
	email: PropTypes.string,
};

AccountSuccess.defaultProps = {
	email: '',
};

export default AccountSuccess;
