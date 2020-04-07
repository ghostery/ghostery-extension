/**
 * Insights Promo Modal Component
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

const InsightsPromoModalContent = (props) => {
	const {
		handleGoAwayClick,
		handleSignInClick,
		handleTryInsightsClick,
	} = props;
	return (
		<div className="InsightsModal__container flex-container flex-dir-column align-middle">
			<div className="InsightsModal__image" />
			<div className="InsightsModal__header">
				{t('panel_insights_promotion_header')}
			</div>
			<div className="InsightsModal__description">
				{t('panel_insights_promotion_description')}
			</div>
			<div className="flex-container">
				<div className="InsightsModal__features">
					<div className="flex-container align-middle">
						<span className="InsightsModal__checked-circle-icon" />
						<div className="InsightsModal__feature-text">
							{t('panel_insights_audit_tags')}
						</div>
					</div>
					<div className="flex-container align-middle">
						<span className="InsightsModal__checked-circle-icon" />
						<div className="InsightsModal__feature-text">
							{t('panel_insights_promotion_trace_poor_performance')}
						</div>
					</div>
				</div>
				<div className="InsightsModal__features">
					<div className="flex-container align-middle">
						<span className="InsightsModal__checked-circle-icon" />
						<div className="InsightsModal__feature-text">
							{t('panel_insights_promotion_watch_pings')}
						</div>
					</div>
					<div className="flex-container align-middle">
						<span className="InsightsModal__checked-circle-icon" />
						<div className="InsightsModal__feature-text">
							{t('panel_insights_promotion_explore_trends')}
						</div>
					</div>
				</div>
			</div>
			<div className="InsightsModal__call-to-action-container">
				<div className="flex-container align-center">
					<span onClick={handleTryInsightsClick} className="btn InsightsModal__call-to-action">
						<span className="button-text">{t('panel_insights_promotion_call_to_action')}</span>
					</span>
				</div>
				<div className="InsightsModal__other-options-container flex-container align-justify">
					<span onClick={handleSignInClick} className="InsightsModal__link">{t('subscribe_pitch_sign_in')}</span>
					<span onClick={handleGoAwayClick} className="InsightsModal__link">{t('no_thanks_turn_promos_off')}</span>
				</div>
			</div>
		</div>
	);
};

export default InsightsPromoModalContent;
