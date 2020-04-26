/**
 * PlusPromoModal Component
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
 * A functional React component for a PlusPromo Modal that may be displayed in the Hub and/or Panel
 * @return {JSX} JSX for rendering a PlusPromo Modal
 * @memberof SharedComponents
 */
const PlusPromoModalContent = (props) => {
	const {
		handleGoAwayClick,
		handleTryPlusClick,
		handleSignInClick,
		loggedIn,
	} = props;

	return (
		<div className="flex-container flex-dir-column align-middle">
			<div className="PlusPromoModal__plus-logo" />
			<div className="PlusPromoModal__main-content-container">
				<div className="PlusPromoModal__header">
					<div className="title">
						<div>{t('spring_is_here')}</div>
					</div>
					<div className="description">
						<div dangerouslySetInnerHTML={{ __html: t('subscribe_pitch_spring') }} />
					</div>
				</div>
			</div>
			<div className="PlusPromoModal__call-to-action-container">
				<div className="PlusPromoModal__button-container flex-container align-center">
					<button type="button" className="PlusPromoModal__download-button" onClick={handleTryPlusClick}>
						<span>{t('upgrade_to_plus').toUpperCase()}</span>
					</button>
				</div>
				<div>
					{!loggedIn &&
						<span className="PlusPromoModal__link sign-in" onClick={handleSignInClick}>{t('subscribe_pitch_sign_in_plus')}</span>
					}
					<span className="PlusPromoModal__link turn-promos-off" onClick={handleGoAwayClick}>{t('no_thanks_turn_promos_off')}</span>
				</div>
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
PlusPromoModalContent.propTypes = {
	handleTryPlusClick: PropTypes.func.isRequired,
	handleSignInClick: PropTypes.func.isRequired,
	handleGoAwayClick: PropTypes.func.isRequired,
	loggedIn: PropTypes.bool.isRequired,
};

export default PlusPromoModalContent;
