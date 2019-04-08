/**
 * Signed In View
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
import { ExitButton } from '../../../shared-components';

/**
 * A Functional React component for rendering the Login View
 * @return {JSX} JSX for rendering the Login View of the Hub app
 * @memberof HubComponents
 */
const SignedInView = (props) => {
	const signedInAsString = t('hub_signedin_as_email');

	return (
		<div className="SignedInView">
			<ExitButton hrefExit="/" textExit={t('hub_signedin_exit')} />
			<div className="SignedInView--addPaddingTop row align-center">
				<div className="columns small-12 large-10">
					<div className="flex-container align-center-middle">
						<img className="SignedInView__headerImage" src="/app/images/hub/account/ghosty-account.svg" />
						<div className="SignedInView__headerTitle">
							<h3>
								{t('hub_signedin_header_title')}
							</h3>
						</div>
					</div>
				</div>
			</div>
			<div className="SignedInView--addPaddingTop row align-center">
				<div className="columns small-12 medium-6 text-center">
					<h3 className="SignedInView--blueText">
						{`${signedInAsString} ${props.email}`}
					</h3>
				</div>
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
SignedInView.propTypes = {
	email: PropTypes.string.isRequired,
};

export default SignedInView;
