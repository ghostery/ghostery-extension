/**
 * Plus Promo Modal Component
 * renders Plus Promo inside of the shared Modal component
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

function _renderInitialVersion(props) {
	const { show, location, clickHandler } = props;

	const isInHub = location === 'hub';

	const locationClassName = {
		'in-hub': isInHub,
		'in-panel': location === 'panel'
	};
	const contentClassNames = ClassNames(
		'PlusPromoModal__content',
		'flex-container',
		'flex-dir-column',
		'align-middle',
		locationClassName
	);
	const optionsContainerClassNames = ClassNames(
		'PlusPromoModal__options-container',
		'full-width',
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

	// TODO refactor for clarity & concision alongside implementing _renderUpgradeVersion for GH-1813
	return (
		<Modal show={show}>
			<div className={contentClassNames}>
				<div className="PlusPromoModal__buttons-background" />
				{isInHub && (
					<div className="PlusPromoModal__thanks-for-download">
						{t('thanks_for_downloading_ghostery')}
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
								<div className="PlusPromoModal__option-description-item no-capitalize">{t('protection_for_this_browser')}</div>
								<div className="PlusPromoModal__option-description-item">{t('blocks_ads')}</div>
								<div className="PlusPromoModal__option-description-item">{t('blocks_trackers')}</div>
								<div className="PlusPromoModal__option-description-item">{t('fast_browsing')}</div>
							</div>
						</div>
						<div className="PlusPromoModal__button basic button" onClick={clickHandler}>
							<span>{t('select_basic')}</span>
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
								<span className="PlusPromoModal__per-month">{t('per month')}</span>
							</div>
							<div className="PlusPromoModal__option-description">
								<div className="PlusPromoModal__option-description-item italic">{t('all_basic_features_plus_COLON')}</div>
								<div className="PlusPromoModal__plus-option-description-item-container">
									<img className="PlusPromoModal__check-icon" src="/app/images/hub/home/check-icon.svg" />
									<div className="PlusPromoModal__option-description-item">{t('historical_tracker_stats')}</div>
								</div>
								<div className="PlusPromoModal__plus-option-description-item-container">
									<img className="PlusPromoModal__check-icon" src="/app/images/hub/home/check-icon.svg" />
									<div className="PlusPromoModal__option-description-item">{t('priority_support')}</div>
								</div>
								<div className="PlusPromoModal__plus-option-description-item-container">
									<img className="PlusPromoModal__check-icon" src="/app/images/hub/home/check-icon.svg" />
									<div className="PlusPromoModal__option-description-item">{t('new_color_themes')}</div>
								</div>
							</div>
						</div>
						<a href="http://signon.ghostery.com/en/subscribe/" target="_blank" rel="noopener noreferrer" className="PlusPromoModal__button plus button" onClick={clickHandler}>
							<span>{t('select_plus')}</span>
						</a>
					</div>
				</div>
			</div>
		</Modal>
	);
}

/**
 * A Functional React component for a Plus Promo Modal
 * @return {JSX} JSX for rendering a Plus Promo Modal
 * @memberof SharedComponents
 */
const PlusPromoModal = props => _renderInitialVersion(props);

// PropTypes ensure we pass required props of the correct type
PlusPromoModal.propTypes = {
	show: PropTypes.bool.isRequired,
	location: PropTypes.string.isRequired,
	clickHandler: PropTypes.func.isRequired,
};

export default PlusPromoModal;
