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
import { Link } from 'react-router-dom';
/**
 * @class Implement Account Success component which opens
 * in place of Sign In view on successful signing.
 * @memberof PanelClasses
 */
const AccountSuccess = ({ email, is_expert }) => ( // eslint-disable-line arrow-parens
	<div id="signin-success-panel">
		<div className="row align-center">
			<div className="small-7 columns text-center">
				<h3>{ t('panel_signin_success_title') }</h3>
				<div className="big-ghosty" />
				<p className="small-and-pale">{ t('panel_signin_success') }</p>
				<h3 className="signin-success-email">{ email }</h3>
				<Link to={(is_expert ? '/detail' : '/')} id="view-trackers-button" className="button">
					{ t('panel_view_trackers') }
				</Link>
			</div>
		</div>
	</div>
);

AccountSuccess.defaultProps = {
	email: '',
};

export default AccountSuccess;
