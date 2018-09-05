/**
 * Setup Blocking Dropdown Container
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
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import SetupBlockingDropdown from './SetupBlockingDropdown';
import { Modal } from '../../../../shared-components';

/**
 * @class Implement the Blocking Dropdown for the Ghostery Hub - Setup Blocking
 * @extends Component
 * @memberof HubComponents
 */
class SetupBlockingDropdownContainer extends Component {
	constructor(props) {
		super(props);

		const { sendMountActions } = props;
		if (sendMountActions) {
			props.actions.getSettingsData();
		}
	}

	/**
	 * Function to handle navigating back to the Blocking route
	 */
	_closeModal = () => {
		this.props.history.push('/setup/1');
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Blocking Dropdown
	 */
	render() {
		return (
			<Modal show toggle={this._closeModal}>
				<SetupBlockingDropdown settingsData={this.props} actions={this.props.actions} handleDoneClick={this._closeModal} />
			</Modal>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
SetupBlockingDropdownContainer.propTypes = {
	sendMountActions: PropTypes.bool.isRequired,
};

export default withRouter(SetupBlockingDropdownContainer);
