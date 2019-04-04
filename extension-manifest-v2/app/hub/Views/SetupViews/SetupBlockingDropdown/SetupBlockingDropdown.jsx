/**
 * Setup Blocking Dropdown Component
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
import { debounce } from 'underscore';
import GlobalBlocking from '../../../../panel/components/Settings/GlobalBlocking';
import { ToastMessage } from '../../../../shared-components';

/**
 * @class Implement the Blocking Dropdown Component
 * @extends Component
 * @memberof HubComponents
 */
class SetupBlockingDropdown extends Component {
	constructor(props) {
		super(props);
		this.state = {
			showToast: false,
			toastText: '',
		};
	}

	/**
	 * Lifecycle Event
	 */
	componentWillUnmount() {
		this._hideToastDebounce.cancel();
	}

	/**
	 * Show an alert that settings were successfully saved
	 */
	_showToast = (data) => {
		this.setState({
			showToast: true,
			toastText: data.text
		});
		this._hideToastDebounce();
	}

	/**
	 * Hide the alert that settings were successfully saved
	 */
	_hideToast = () => {
		this.setState({
			showToast: false,
			toastText: '',
		});
	}

	/**
	 * Debounce the hide alert function after 3 seconds
	 */
	_hideToastDebounce = debounce(this._hideToast, 3000)

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Blocking Dropdown Component
	 */
	render() {
		const { showToast, toastText } = this.state;
		const { actions, handleDoneClick, settingsData } = this.props;

		return (
			<div className="SetupBlockingDropdown">
				{showToast && (
					<ToastMessage toastText={toastText} toastClass="success" />
				)}
				<GlobalBlocking settingsData={settingsData} actions={actions} showToast={this._showToast} hideToast={this._hideToastDebounce} language={settingsData.language} />
				<div className="SetupBlockingDropdown__buttonContainer flex-container flex-dir-row-reverse">
					<div className="button success" onClick={handleDoneClick}>
						{t('hub_setup_nav_done')}
					</div>
				</div>
			</div>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
SetupBlockingDropdown.propTypes = {
	actions: PropTypes.shape({
		filter: PropTypes.func.isRequired,
		showNotification: PropTypes.func.isRequired,
		toggleExpandAll: PropTypes.func.isRequired,
		updateBlockAllTrackers: PropTypes.func.isRequired,
		updateCategoryBlocked: PropTypes.func.isRequired,
		updateSearchValue: PropTypes.func.isRequired,
		updateTrackerBlocked: PropTypes.func.isRequired,
	}).isRequired,
	handleDoneClick: PropTypes.func.isRequired,
};

export default SetupBlockingDropdown;
