/**
 * Supporter View Container
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SupporterView from './SupporterView';

/**
 * @class Implement the Supporter View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class SupporterViewContainer extends Component {
	constructor(props) {
		super(props);

		const title = t('hub_supporter_page_title');
		window.document.title = title;

		props.actions.getUser();
	}

	render() {
		const isSupporter = !!(this.props.user && this.props.user.subscriptionsSupporter);

		return <SupporterView isSupporter={isSupporter} />;
	}
}

// PropTypes ensure we pass required props of the correct type
SupporterViewContainer.propTypes = {
	user: PropTypes.shape({
		subscriptionsSupporter: PropTypes.bool,
	}),
	actions: PropTypes.shape({
		getUser: PropTypes.func.isRequired,
	}).isRequired,
};

// Default props used throughout the Setup flow
SupporterViewContainer.defaultProps = {
	user: {
		subscriptionsSupporter: false,
	},
};

export default SupporterViewContainer;
