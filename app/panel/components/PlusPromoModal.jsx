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
import ClassNames from 'classnames';
import Modal from '../../shared-components/Modal';
import ModalExitButton from './BuildingBlocks/ModalExitButton';

/**
 * A functional React component for a PlusPromo Modal that may be displayed in the Hub and/or Panel
 * @return {JSX} JSX for rendering a PlusPromo Modal
 * @memberof SharedComponents
 */
const PlusPromoModal = (props) => {
	const {
		show,
		handleTryPlusClick,
		handleSignInClick,
		handleGoAwayClick,
		handleXClick,
		loggedIn
	} = props;

	const contentClassNames = ClassNames(
		'PlusPromoModal__content',
		'flex-container',
		'flex-dir-column',
		'align-middle',
	);

	return (
		<Modal show={show}>
			<div className={contentClassNames}>
				<ModalExitButton className="PlusPromoModal__exitButton" toggleModal={handleXClick} border="green" />
				<div className="PlusPromoModal__plus-logo" />
				<div className="PlusPromoModal__main-content-container">
					<div className="PlusPromoModal__header">
						<div className="title">
							<div>Spring has sprung!</div>
						</div>
						<div className="description">
							<div>Support us and unlock a new spring theme, personal tracking insights, and other special perks by upgrading to Ghostery Plus for $2 per month.</div>
						</div>
					</div>
				</div>
				<div className="PlusPromoModal__call-to-action-container">
					<div className="PlusPromoModal__button-container flex-container align-center">
						<button type="button" className="PlusPromoModal__download-button" onClick={handleTryPlusClick}>
							<span>UPGRADE TO PLUS</span>
						</button>
					</div>
					<div>
						{!loggedIn &&
							<span className="PlusPromoModal__link sign-in" onClick={handleSignInClick}>Already a plus subscriber?</span>
						}
						<span className="PlusPromoModal__link turn-promos-off" onClick={handleGoAwayClick}>{t('no_thanks_turn_promos_off')}</span>
					</div>
				</div>
			</div>
		</Modal>
	);
};


// PropTypes ensure we pass required props of the correct type
PlusPromoModal.propTypes = {
	show: PropTypes.bool.isRequired,
	handleTryPlusClick: PropTypes.func.isRequired,
	handleSignInClick: PropTypes.func.isRequired,
	handleGoAwayClick: PropTypes.func.isRequired,
	handleXClick: PropTypes.func.isRequired,
	loggedIn: PropTypes.bool.isRequired,
};

export default PlusPromoModal;
