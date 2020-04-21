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

/**
 * A functional React component for a Premium Promo Modal that may be displayed in the Hub and/or Panel
 * @return {JSX} JSX for rendering a Premium Promo Modal
 * @memberof SharedComponents
 */
const PremiumPromoModalContent = (props) => {
	const {
		isPlus,
		handleTryMidnightClick,
		handleGetPlusClick,
		handleKeepBasicClick,
		handleGoAwayClick,
		location,
	} = props;

	const isInHub = location === 'hub';
	const isInPanel = location === 'panel';

	return (
		<div className="flex-container flex-dir-column align-middle">
			<div className="PremiumPromoModal__midnight-logo" />
			<div className="PremiumPromoModal__main-content-container">
				<div className="PremiumPromoModal__header">
					<div className="PremiumPromoModal__header-text">
						<span>{t('try_ghostery_midnight')}</span>
						<div className="PremiumPromoModal__header-beta-icon" />
					</div>
				</div>
				<div className="PremiumPromoModal__sub-header">{t('full_coverage_protection_promise')}</div>
				<div className="PremiumPromoModal__features-container">
					<div className="PremiumPromoModal__feature-column">
						<div className="PremiumPromoModal__feature">
							<span className="PremiumPromoModal__checked-circle-icon" />
							<div className="PremiumPromoModal__feature-text">
								{t('system_wide_tracker_and_ad_blocking')}
							</div>
						</div>
						<div className="PremiumPromoModal__feature">
							<span className="PremiumPromoModal__checked-circle-icon" />
							<div className="PremiumPromoModal__feature-text">
								{t('built_in_vpn')}
							</div>
						</div>
					</div>
					<div className="PremiumPromoModal__feature-column">
						<div className="PremiumPromoModal__feature">
							<span className="PremiumPromoModal__checked-circle-icon" />
							<div className="PremiumPromoModal__feature-text">
								{t('historical_tracking_insights')}
							</div>
						</div>
						<div className="PremiumPromoModal__feature">
							<span className="PremiumPromoModal__checked-circle-icon" />
							<div className="PremiumPromoModal__feature-text" dangerouslySetInnerHTML={{ __html: t('seven_day_free_trial') }} />
						</div>
					</div>
				</div>
			</div>
			<div className="PremiumPromoModal__buttons-background">
				<div className="PremiumPromoModal__button-container">
					<div className="PremiumPromoModal__download-button" onClick={handleTryMidnightClick}>
						<span>{t('download_for_free')}</span>
					</div>
				</div>
				<div className="PremiumPromoModal__text-link-container">
					{!isPlus && (
						<div onClick={handleGetPlusClick} className="PremiumPromoModal__text-link" dangerouslySetInnerHTML={{ __html: t('support_ghostery_for_2_instead') }} />
					)}
					{isInHub && (
						<div onClick={handleKeepBasicClick} className="PremiumPromoModal__text-link">
							{t('no_thanks_continue_with_basic')}
						</div>
					)}
					{isInPanel && (
						<div onClick={handleGoAwayClick} className="PremiumPromoModal__text-link">
							{t('no_thanks_turn_promos_off')}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};


// PropTypes ensure we pass required props of the correct type
PremiumPromoModalContent.propTypes = {
	location: PropTypes.string.isRequired,
	isPlus: PropTypes.bool.isRequired,
	handleTryMidnightClick: PropTypes.func.isRequired,
	handleGetPlusClick: PropTypes.func.isRequired,
	handleKeepBasicClick: PropTypes.func,
	handleGoAwayClick: PropTypes.func,
};

const noop = () => { };
PremiumPromoModalContent.defaultProps = {
	handleKeepBasicClick: noop,
	handleGoAwayClick: noop,
};

export default PremiumPromoModalContent;
