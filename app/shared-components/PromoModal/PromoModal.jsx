/**
 * Super component for all of the Promo Modals
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

const INSIGHTS = 'insights';
const PLUS = 'plus';
const PREMIUM = 'premium';
/**
 * A superclass for Promo Modals
 * @return {JSX}
 * @memberof HubComponents
 */
class PromoModal extends React.Component {
	handleGoAwayClick = () => { this.props.handleGoAwayClick(this.props.type); }

	handleSubscribeClick = () => { this.props.handleSubscribeClick(this.props.type); }

	handleXClick = () => { this.props.handleXClick(this.props.type); }

	render() {
		const { type } = this.props;
		switch (type) {
			case INSIGHTS:
				return <InsightsPromoModal {...this.props} />;
			case PLUS:
				return <PlusPromoModal {...this.props} />;
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

const noop = () => {};
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
