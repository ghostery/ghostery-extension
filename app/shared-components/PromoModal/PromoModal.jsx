/**
 * Base component for all of the Promo Modals
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
import Modal from '../Modal';
import InsightsPromoModalContent from '../ModalContent/InsightsPromoModalContent';
import PlusPromoModalContent from '../ModalContent/PlusPromoModalContent';
import PremiumPromoModalContent from '../ModalContent/PremiumPromoModalContent';
import history from '../../panel/utils/history';
import { sendMessage } from '../../panel/utils/msg';
import globals from '../../../src/classes/Globals';
import ModalExitButton from '../../panel/components/BuildingBlocks/ModalExitButton';

const DOMAIN = globals.DEBUG ? 'ghosterystage' : 'ghostery';
const INSIGHTS = 'insights';
const PLUS = 'plus';
const PREMIUM = 'premium';

/**
 * A base functional component for Promo Modals
 * @return {JSX}
 * @memberof HubComponents
 */

class PromoModal extends React.Component {
	/**
	 * @param modal			'insights' or 'premium'
	 * @private
	 * Handle clicks on the link to turn off promos in the promo modals
	 */
	_handlePromoGoAwayClick = (modal) => {
		this.props.actions.togglePromoModal();

		sendMessage('promoModals.turnOffPromos', {});

		switch (modal) {
			case INSIGHTS:
				sendMessage('ping', 'promo_modals_decline_insights_upgrade');
				break;
			case PLUS:
				sendMessage('ping', 'promo_modals_decline_plus_upgrade');
				break;
			case PREMIUM:
				sendMessage('ping', 'promo_modals_decline_insights_upgrade');
				break;
			default:
				break;
		}

		this.props.actions.showNotification({
			classes: 'warning',
			reload: false,
			text: t('promos_turned_off_notification'),
		});
	};

	/**
	 * @private
	 * Handle clicks on the download buttons
	 */
	_handlePromoTryProductClick = (product, utm_campaign) => {
		this.props.actions.togglePromoModal();

		let url;
		switch (product) {
			case PLUS:
				// Should we send a plus ping here?
				// sendMessage('ping', 'promo_modals_plus_upgrade_cta');
				url = `https://checkout.${DOMAIN}.com/plus?utm_source=gbe&utm_campaign=${utm_campaign}`;
				break;
			case PREMIUM:
				url = `https://ghostery.com/thanks-for-downloading-midnight?utm_source=gbe&utm_campaign=${utm_campaign}`;
				break;
			case INSIGHTS:
				sendMessage('ping', 'promo_modals_insights_upgrade_cta');
				url = `https://checkout.${DOMAIN}.com/insights?utm_source=gbe&utm_campaign=${utm_campaign}`;
				break;
			default:
		}

		sendMessage('openNewTab', {
			url,
			become_active: true,
		});
	}

	/**
	 * @private
	 * Handle clicks on sign in links in promo modals
	 */
	_handlePromoSignInClick = () => {
		this.props.actions.togglePromoModal();
		history.push({
			pathname: '/login',
		});
	};

	_handlePromoXClick = (type) => {
		this.props.actions.togglePromoModal();

		if (type === INSIGHTS) {
			sendMessage('ping', 'promo_modals_decline_insights_upgrade');
		} else if (type === PLUS) {
			sendMessage('ping', 'promo_modals_decline_plus_upgrade');
		}
	}

	_renderXButton = (type) => {
		const XButtonClass = type === PLUS
			? 'PlusPromoModal__exitButton'
			: 'InsightsModal__exitButton';

		return (
			<ModalExitButton
				className={XButtonClass}
				toggleModal={() => this._handlePromoXClick(type)}
			/>
		);
	};

	renderModalContent() {
		const { type, loggedIn } = this.props;
		switch (type) {
			case INSIGHTS:
				return (
					<InsightsPromoModalContent
						handleGoAwayClick={() => this._handlePromoGoAwayClick(INSIGHTS)}
						handleTryInsightsClick={() => this._handlePromoTryProductClick(INSIGHTS, 'in_app_upgrade')}
						handleSignInClick={this._handlePromoSignInClick}
						{...this.props}
					/>
				);
			case PLUS:
				return (
					<PlusPromoModalContent
						handleGoAwayClick={() => this._handlePromoGoAwayClick(PLUS)}
						handleTryPlusClick={() => this._handlePromoTryProductClick(PLUS, 'in_app_spring2020')}
						handleSignInClick={this._handlePromoSignInClick}
						loggedIn={loggedIn}
					/>
				);
			case PREMIUM:
				return (
					<PremiumPromoModalContent
						handleGoAwayClick={() => this._handlePromoGoAwayClick(PREMIUM)}
						handleTryMidnightClick={() => this._handlePromoTryProductClick(PREMIUM, 'in_app')}
						handleGetPlusClick={() => this._handlePromoTryProductClick(PLUS, 'in_app')}
						{...this.props}
					/>
				);
			default:
				return <InsightsPromoModalContent {...this.props} />;
		}
	}

	render() {
		const { type } = this.props;
		const modalContentClassNames = ClassNames('', {
			InsightsModal__content: type === INSIGHTS,
			PlusPromoModal__content: type === PLUS,
			PremiumPromoModal__content: type === PREMIUM,
		});
		return (
			<Modal show>
				<div className={modalContentClassNames}>
					{this._renderXButton(type)}
					{this.renderModalContent()}
				</div>
			</Modal>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
PromoModal.propTypes = {
	type: PropTypes.string.isRequired,
	location: PropTypes.string,
	isPlus: PropTypes.bool,
};

PromoModal.defaultProps = {
	location: 'panel',
	isPlus: false,
};

export default PromoModal;
