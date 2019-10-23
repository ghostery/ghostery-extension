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
import history from '../utils/history';
import ModalExitButton from './BuildingBlocks/ModalExitButton';

// A Functional React component for a Modal
class InsightsPromoModal extends React.Component {
	clickSignIn = () => {
		history.push({
			pathname: '/login',
		});
		this.props.actions.toggleInsightsModal();
	};

	render() {
		return (
			<Modal show>
				<div className="InsightsModal__content flex-container flex-dir-column align-middle">
					<ModalExitButton className="InsightsModal__exitButton" toggleModal={this.props.actions.toggleInsightsModal} />
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
							<a href="https://www.ghostery.com/insights/" target="_blank" rel="noopener noreferrer" className="btn InsightsModal__call-to-action">
								<span className="flex-container align-center">{t('panel_insights_promotion_call_to_action')}</span>
							</a>
						</div>
						<div className="InsightsModal__other-options-container flex-container align-justify">
							<span onClick={this.clickSignIn} className="InsightsModal__link">{t('subscribe_pitch_sign_in')}</span>
							<span onClick={this.props.actions.toggleInsightsModal} className="InsightsModal__link">{t('subscribe_pitch_no_thanks')}</span>
						</div>
					</div>
				</div>
			</Modal>
		);
	}
}

export default InsightsPromoModal;
