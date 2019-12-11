/**
 * Premium Promo Modal Component
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
import Modal from '../Modal/Modal';
import ModalExitButton from '../../panel/components/BuildingBlocks/ModalExitButton';

/**
 * A functional React component for a Premium Promo Modal that may be displayed in the Hub and/or Panel
 * @return {JSX} JSX for rendering a Premium Promo Modal
 * @memberof SharedComponents
 */
const PremiumPromoModal = (props) => {
	const {
		show,
		location,
		handleTryMidnightClick,
		handleGetPlusClick,
		handleKeepBasicClick,
		handleGoAwayClick,
		handleXClick,
	} = props;

	const isInHub = location === 'hub';
	const isInPanel = location === 'panel';

	const contentClassNames = ClassNames(
		'PremiumPromoModal__content',
		'flex-container',
		'flex-dir-column',
		'align-middle',
	);
	const optionsContainerClassNames = ClassNames(
		'PremiumPromoModal__options-container',
		'full-width',
	);
	const optionsDecriptionClassNames = ClassNames(
		'PremiumPromoModal__option-description-item',
	);
	const chooseYourPlanClassNames = ClassNames(
		'PremiumPromoModal__choose-your-plan',
	);
	const recommendedBannerClassNames = ClassNames(
		'PremiumPromoModal__recommended-banner',
	);
	const optionDescriptionBoxClassNames = ClassNames(
		'PremiumPromoModal__option-description-box',
	);

	return (
		<Modal show={show}>
			<div className={contentClassNames}>
				{isInPanel && (
					<ModalExitButton className="InsightsModal__exitButton" toggleModal={handleXClick} />
				)}
				<div className="PremiumPromoModal__midnight-logo" />
				<div className="PremiumPromoModal__header">
					<div className="PremiumPromoModal__header-text">
						<span>Try Ghostery Midnight</span>
						<div className="PremiumPromoModal__header-beta-icon" />
					</div>
					<div className="PremiumPromoModal__header-text">7 Day Free Trial ($14/mo)</div>
				</div>
				<div className="PremiumPromoModal__sub-header">
					Get full-coverage protection across all browsers & apps on your device
				</div>
				<div className="PremiumPromoModal__features-container">
					<div className="PremiumPromoModal__feature-column">
						<div className="PremiumPromoModal__feature">
							<span className="PremiumPromoModal__checked-circle-icon" />
							<div className="PremiumPromoModal__feature-text">
								System-wide tracker & ad-blocking
							</div>
						</div>
						<div className="PremiumPromoModal__feature">
							<span className="PremiumPromoModal__checked-circle-icon" />
							<div className="PremiumPromoModal__feature-text">
								Built-in VPN
							</div>
						</div>
					</div>
					<div className="PremiumPromoModal__feature-column">
						<div className="PremiumPromoModal__feature">
							<span className="PremiumPromoModal__checked-circle-icon" />
							<div className="PremiumPromoModal__feature-text">
								Custom whitelist options
							</div>
						</div>
						<div className="PremiumPromoModal__feature">
							<span className="PremiumPromoModal__checked-circle-icon" />
							<div className="PremiumPromoModal__feature-text">
								Historical tracking insights
							</div>
						</div>
					</div>
				</div>
				<div className="PremiumPromoModal__buttons-background">
					<div className="PremiumPromoModal__button-container">
						<div className="PremiumPromoModal__download-button" onClick={handleTryMidnightClick}>
							<span>Download For Free</span>
						</div>
					</div>
					<div className="PremiumPromoModal__text-link-container">
						<div onClick={handleGetPlusClick} className="PremiumPromoModal__text-link">
							Support Ghostery for $2/mo instead
						</div>
						{isInHub && (
							<div onClick={handleKeepBasicClick} className="PremiumPromoModal__text-link">
								No thanks, continue with basic
							</div>
						)}
						{isInPanel && (
							<div onClick={handleGoAwayClick} className="PremiumPromoModal__text-link">
								No thanks, turn promos off
							</div>
						)}
					</div>
				</div>
			</div>
		</Modal>
	);
};


// PropTypes ensure we pass required props of the correct type
PremiumPromoModal.propTypes = {
	show: PropTypes.bool.isRequired,
	location: PropTypes.string.isRequired,
	handleTryMidnightClick: PropTypes.func.isRequired,
	handleGetPlusClick: PropTypes.func.isRequired,
	handleKeepBasicClick: PropTypes.func,
	handleGoAwayClick: PropTypes.func,
	handleXClick: PropTypes.func,
};

const noop = () => {};
PremiumPromoModal.defaultProps = {
	handleKeepBasicClick: noop,
	handleGoAwayClick: noop,
	handleXClick: noop,
};

export default PremiumPromoModal;
