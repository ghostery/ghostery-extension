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
import Modal from '../../shared-components/Modal';
import ModalExitButton from './BuildingBlocks/ModalExitButton';
import PanelToTabLink from './BuildingBlocks/PanelToTabLink';

const INSIGHTS = 'insights';

/**
 * @class Implements the Insights Promo Modal
 * @memberof PanelClasses
 */
class InsightsPromoModal extends React.Component {
	handleNoThanksClick = () => { this.props.handleNoThanksClick(INSIGHTS); };

	handleSignInClick = () => { this.props.handleSignInClick(INSIGHTS); };

	handleXClick = () => { this.props.handleXClick(INSIGHTS); };

	render() {
		return (
			<Modal show>
				<div className="InsightsModal__content flex-container flex-dir-column align-middle">
					<ModalExitButton className="InsightsModal__exitButton" toggleModal={this.handleXClick} />
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
									{ t('panel_insights_audit_tags') }
								</div>
							</div>
							<div className="flex-container align-middle">
								<span className="InsightsModal__checked-circle-icon" />
								<div className="InsightsModal__feature-text">
									{ t('panel_insights_promotion_trace_poor_performance') }
								</div>
							</div>
						</div>
						<div className="InsightsModal__features">
							<div className="flex-container align-middle">
								<span className="InsightsModal__checked-circle-icon" />
								<div className="InsightsModal__feature-text">
									{ t('panel_insights_promotion_watch_pings') }
								</div>
							</div>
							<div className="flex-container align-middle">
								<span className="InsightsModal__checked-circle-icon" />
								<div className="InsightsModal__feature-text">
									{ t('panel_insights_promotion_explore_trends') }
								</div>
							</div>
						</div>
					</div>
					<div className="InsightsModal__call-to-action-container">
						<div className="flex-container align-center">
							<PanelToTabLink className="btn InsightsModal__call-to-action" href="http://ghostery.com/insights/">
								<span className="button-text">{t('panel_insights_promotion_call_to_action')}</span>
							</PanelToTabLink>
						</div>
						<div className="InsightsModal__other-options-container flex-container align-justify">
							<span onClick={this.handleSignInClick} className="InsightsModal__link">{t('subscribe_pitch_sign_in')}</span>
							<span onClick={this.handleNoThanksClick} className="InsightsModal__link">{t('no_thanks_turn_promos_off')}</span>
						</div>
					</div>
				</div>
			</Modal>
		);
	}
}

export default InsightsPromoModal;
