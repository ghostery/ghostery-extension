/**
 * Plus View Container
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import PlusView from './PlusView';

/**
 * @class Implement the Plus View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class PlusViewContainer extends Component {
	constructor(props) {
		super(props);

		const title = t('hub_supporter_page_title');
		window.document.title = title;

		props.actions.getUser();
	}

	/**
	 * Sends the necessary ping to background
	 */
	_sendPlusPing = () => {
		this.props.actions.sendPing({ type: 'plus_cta_hub' });
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Plus View of the Hub app
	 */
	render() {
		const childProps = {
			isPlus: (this.props.user && this.props.user.subscriptionsPlus) || false,
			onPlusClick: this._sendPlusPing,
		};

		return <PlusView {...childProps} />;
	}
}

// PropTypes ensure we pass required props of the correct type
PlusViewContainer.propTypes = {
	user: PropTypes.shape({
		email: PropTypes.string,
		subscriptionsPlus: PropTypes.bool,
	}),
	actions: PropTypes.shape({
		sendPing: PropTypes.func.isRequired,
		getUser: PropTypes.func.isRequired,
	}).isRequired,
};

// Default props used in the Plus View
PlusViewContainer.defaultProps = {
	user: {
		email: false,
		subscriptionsPlus: false,
	},
};

export default PlusViewContainer;
