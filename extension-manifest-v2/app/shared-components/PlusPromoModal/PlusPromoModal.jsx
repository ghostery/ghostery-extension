/**
 * Plus Promo Modal Component
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
 * A functional React component for a Plus Promo Modal that may be displayed in the Hub and/or Panel
 * @return {JSX} JSX for rendering a Plus Promo Modal
 * @memberof SharedComponents
 */
const PlusPromoModal = (props) => {
	const {
		show,
		location,
		handleSelectBasicClick,
		handleSelectPlusClick,
		handleSignInClick,
	} = props;

	const isInHub = location === 'hub';
	const isInPanel = location === 'panel';

	const locationClassName = {
		'in-hub': isInHub,
		'in-panel': location === 'panel'
	};
	const contentClassNames = ClassNames(
		'PlusPromoModal__content',
		'flex-container',
		'flex-dir-column',
		'align-middle',
		'initial',
		locationClassName
	);
	const optionsContainerClassNames = ClassNames(
		'PlusPromoModal__options-container',
		'full-width',
		locationClassName
	);
	const optionsDecriptionClassNames = ClassNames(
		'PlusPromoModal__option-description-item',
		locationClassName
	);
	const chooseYourPlanClassNames = ClassNames(
		'PlusPromoModal__choose-your-plan',
		locationClassName
	);
	const recommendedBannerClassNames = ClassNames(
		'PlusPromoModal__recommended-banner',
		locationClassName
	);
	const optionDescriptionBoxClassNames = ClassNames(
		'PlusPromoModal__option-description-box',
		locationClassName
	);
	const buttonBackgroundClassNames = ClassNames(
		'PlusPromoModal__buttons-background',
		'initial',
		locationClassName
	);

	return (
		<Modal show={show}>
			<div className={contentClassNames}>
				{isInHub && (
					<div className="PlusPromoModal__thanks-for-download">
						{t('ghostery_is_ready')}
					</div>
				)}
				<div className={chooseYourPlanClassNames}>
					{isInHub ? t('choose_your_privacy_plan') : t('choose_your_ghostery_privacy_plan')}
				</div>
				<div className={optionsContainerClassNames}>
					<div className="PlusPromoModal__option-container">
						<div className={`${optionDescriptionBoxClassNames} basic`}>
							<div className="PlusPromoModal__option-header basic">{t('ghostery_basic')}</div>
							<div className="PlusPromoModal__price-text basic">
								<span className="PlusPromoModal__currency-sign">{t('locale_appropriate_currency_icon')}</span>
								<span className="PlusPromoModal__amount">0</span>
								<span> </span>
								<span className="PlusPromoModal__per-month">{t('per_month')}</span>
							</div>
							<div className="PlusPromoModal__option-description">
								<div className={`${optionsDecriptionClassNames} no-capitalize`}>{t('faster_cleaner_browsing')}</div>
								<div className={optionsDecriptionClassNames}>{t('blocks_ads')}</div>
								<div className={optionsDecriptionClassNames}>{t('blocks_trackers')}</div>
								<div className={optionsDecriptionClassNames}>{t('data_protection')}</div>
							</div>
						</div>
					</div>
					<div className="PlusPromoModal__option-container">
						<div className={`${optionDescriptionBoxClassNames} plus`}>
							<div className={recommendedBannerClassNames}>
								<img src="/app/images/hub/home/recommended-banner.svg" />
								<div className="PlusPromoModal__recommended-banner-text">{t('recommended')}</div>
							</div>
							<div className="PlusPromoModal__option-header plus">{t('ghostery_plus')}</div>
							<div className="PlusPromoModal__price-text plus">
								<span className="PlusPromoModal__currency-sign">{t('locale_appropriate_currency_icon')}</span>
								<span className="PlusPromoModal__amount">{t('plus_monthly_subscription_price_number')}</span>
								<span> </span>
								<span className="PlusPromoModal__per-month">{t('per_month')}</span>
							</div>
							<div className="PlusPromoModal__option-description">
								<div className={`${optionsDecriptionClassNames} italic`}>{t('all_basic_features_plus_COLON')}</div>
								<div className="PlusPromoModal__plus-option-description-item-container">
									<div className={optionsDecriptionClassNames}>
										<img className="PlusPromoModal__check-icon" src="/app/images/hub/home/check-icon.svg" />
										{t('historical_tracker_stats')}
									</div>
								</div>
								<div className="PlusPromoModal__plus-option-description-item-container">
									<div className={optionsDecriptionClassNames}>
										<img className="PlusPromoModal__check-icon" src="/app/images/hub/home/check-icon.svg" />
										{t('priority_support')}
									</div>
								</div>
								<div className="PlusPromoModal__plus-option-description-item-container">
									<div className={optionsDecriptionClassNames}>
										<img className="PlusPromoModal__check-icon" src="/app/images/hub/home/check-icon.svg" />
										{t('new_color_themes')}
									</div>
								</div>
							</div>
						</div>
					</div>
					<div className={buttonBackgroundClassNames}>
						<div className="PlusPromoModal__button basic" onClick={handleSelectBasicClick}>
							<span className="side-padded">{t('select_basic')}</span>
						</div>
						<div onClick={handleSelectPlusClick} className="PlusPromoModal__button plus">
							<span className="side-padded">{t('select_plus')}</span>
						</div>
						{isInPanel && (
							<div onClick={handleSignInClick} className="PlusPromoModal__text-link sign-in">
								{t('already_subscribed_sign_in')}
							</div>
						)}
					</div>
				</div>
			</div>
		</Modal>
	);
};

// PropTypes ensure we pass required props of the correct type
PlusPromoModal.propTypes = {
	show: PropTypes.bool.isRequired,
	location: PropTypes.string.isRequired,
	handleSelectBasicClick: PropTypes.func.isRequired,
	handleSelectPlusClick: PropTypes.func.isRequired,
	handleSignInClick: PropTypes.func,
};

PlusPromoModal.defaultProps = {
	handleSignInClick: () => {},
};

export default PlusPromoModal;
