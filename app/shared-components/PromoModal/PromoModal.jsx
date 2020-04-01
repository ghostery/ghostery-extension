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
import InsightsPromoModal from '../../panel/components/InsightsPromoModal';
import PlusPromoModal from '../../panel/components/PlusPromoModal';
import PremiumPromoModal from '../PremiumPromoModal';
import history from '../../panel/utils/history';
import { sendMessage } from '../../panel/utils/msg';
import globals from '../../../src/classes/Globals';

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
	 * @private
	 * Handle click action when user selects Subscribe button in the Insights modal
	 * @param  {string} modal Modal type (insights or plus)
	 */
	_handlePromoSubscribeClick = (modal) => {
		this.props.actions.togglePromoModal();

		let url = `https://checkout.${DOMAIN}.com/`;

		if (modal === 'insights') {
			sendMessage('ping', 'promo_modals_insights_upgrade_cta');
			url += 'insights?utm_source=gbe&utm_campaign=in_app_upgrade';
		}

		sendMessage('openNewTab', {
			url,
			become_active: true,
		});
	};

	/**
	 * @private
	 * Handle clicks on sign in links in promo modals
	 */
	_handlePromoSignInClick = () => {
		console.log('here');
		this.props.actions.togglePromoModal();
		history.push({
			pathname: '/login',
		});
	};

	_handleGoAwayClick = (type) => { this.props.handleGoAwayClick(type); }

	_handleSubscribeClick = (type) => { this.props.handleSubscribeClick(type); }

	_handlePromoXClick = (type) => {
		console.log('test');
		this.props.handleXClick(type);
	}

	render() {
		const { type } = this.props;
		switch (type) {
			case INSIGHTS:
				return (
					<InsightsPromoModal
						{...this.props}
						handleSignInClick={this._handlePromoSignInClick}
						handleSubscribeClick={() => this._handlePromoSubscribeClick(type)}
						handleXClick={() => this._handlePromoXClick(type)}
						show
					/>
				);
			case PLUS:
				return <PlusPromoModal type={type} />;
			case PREMIUM:
				return <PremiumPromoModal {...this.props} />;
			default:
				return <InsightsPromoModal {...this.props} />;
		}
	}
}

// PropTypes ensure we pass required props of the correct type
PromoModal.propTypes = {
	type: PropTypes.string.isRequired,
	handleGoAwayClick: PropTypes.func,
	handleSignInClick: PropTypes.func,
	handleSubscribeClick: PropTypes.func,
	handleXClick: PropTypes.func,
	handleTryMidnightClick: PropTypes.func,
	handleGetPlusClick: PropTypes.func,
	handleKeepBasicClick: PropTypes.func,
	location: PropTypes.string,
	isPlus: PropTypes.bool,
};

const noop = () => { };
PromoModal.defaultProps = {
	handleGoAwayClick: noop,
	handleSignInClick: noop,
	handleSubscribeClick: noop,
	handleXClick: noop,
	handleTryMidnightClick: noop,
	handleGetPlusClick: noop,
	handleKeepBasicClick: noop,
	location: 'panel',
	isPlus: false,
};

export default PromoModal;
