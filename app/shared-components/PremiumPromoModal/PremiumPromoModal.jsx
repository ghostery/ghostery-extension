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
	const buttonBackgroundClassNames = ClassNames(
		'PremiumPromoModal__buttons-background',
	);

	return (
		<Modal show={show}>
			<div className={contentClassNames}>
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
								Custom whitelist options
							</div>
						</div>
					</div>
					<div className="PremiumPromoModal__feature-column">
						<div className="PremiumPromoModal__feature">
							<span className="PremiumPromoModal__checked-circle-icon" />
							<div className="PremiumPromoModal__feature-text">
								Built-in VPN
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
				<div className={buttonBackgroundClassNames}>
					<div className="PremiumPromoModal__button basic" onClick={handleTryMidnightClick}>
						<span className="side-padded">{t('select_basic')}</span>
					</div>
					<div onClick={handleGetPlusClick} className="PremiumPromoModal__button plus">
						<span className="side-padded">{t('select_plus')}</span>
					</div>
					{isInPanel && (
						<div onClick={handleKeepBasicClick} className="PremiumPromoModal__text-link sign-in">
							{t('already_subscribed_sign_in')}
						</div>
					)}
					{isInPanel && (
						<div onClick={handleXClick} className="requiredToCompileTEST" />
					)}
					{isInPanel && (
						<div onClick={handleGoAwayClick} className="requiredToCompileTEST" />
					)}
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
