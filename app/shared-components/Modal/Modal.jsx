/**
 * Modal Component
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

/**
 * A Functional React component for a Modal
 * @return {JSX} JSX for rendering a Modal
 * @memberof SharedComponents
 */
const Modal = props => (
	<div className="Modal">
		{ props.show && (
			<div>
				<div className="Modal__background" onClick={props.toggle ? props.toggle : undefined} />
				<div className="Modal__container flex-container align-center-middle">
					{props.children}
				</div>
			</div>
		)}
	</div>
);

Modal.renderPlusPromo = (location, clickHandler) => {
	const isInHub = location === 'inHub';
	const isInPanel = location === 'inPanel';

	const locationClassName = {
		'in-hub': isInHub,
		'in-panel': isInPanel
	};
	const contentClassNames = ClassNames(
		'PlusPromoModal__content',
		'flex-container',
		'flex-dir-column',
		'align-middle',
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

	return (
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
			<div className="PlusPromoModal__options-container full-width">
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
						<div className="PlusPromoModal__option-header plus">Ghostery Plus</div>
						<div className="PlusPromoModal__price-text plus">
							<span className="PlusPromoModal__currency-sign">{t('locale_appropriate_currency_icon')}</span>
							<span className="PlusPromoModal__amount">{t('plus_monthly_subscription_price_number')}</span>
							<span> </span>
							<span className="PlusPromoModal__per-month">per month</span>
						</div>
						<div className="PlusPromoModal__option-description">
							<div className="PlusPromoModal__option-description-item italic">All basic features, plus:</div>
							<div className="PlusPromoModal__plus-option-description-item-container">
								<img className="PlusPromoModal__check-icon" src="/app/images/hub/home/check-icon.svg" />
								<div className="PlusPromoModal__option-description-item">Historical Tracker Stats</div>
							</div>
							<div className="PlusPromoModal__plus-option-description-item-container">
								<img className="PlusPromoModal__check-icon" src="/app/images/hub/home/check-icon.svg" />
								<div className="PlusPromoModal__option-description-item">Priority Support</div>
							</div>
							<div className="PlusPromoModal__plus-option-description-item-container">
								<img className="PlusPromoModal__check-icon" src="/app/images/hub/home/check-icon.svg" />
								<div className="PlusPromoModal__option-description-item">New Color Themes</div>
							</div>
						</div>
					</div>
					<a href="http://signon.ghostery.com/en/subscribe/" target="_blank" rel="noopener noreferrer" className="PlusPromoModal__button plus button" onClick={clickHandler}>
						<span>Select Plus</span>
					</a>
				</div>
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
Modal.propTypes = {
	show: PropTypes.bool.isRequired,
	toggle: PropTypes.oneOfType([
		PropTypes.func,
		PropTypes.oneOf([false]),
	]),
	children: PropTypes.element.isRequired,
};

// Default props instantiation
Modal.defaultProps = {
	toggle: false,
};

export default Modal;
