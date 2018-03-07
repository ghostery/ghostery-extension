/**
 * Custom Block View Component
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
import { Link } from 'react-router-dom';
import { debounce } from 'underscore';
import classNames from 'classnames';
import GlobalBlocking from '../../../panel/components/Settings/GlobalBlocking';

/**
 * @class Implement the dropdown when the user chooses custom in the #blocking
 * part of the setup flow. Displays the list of trackers with options to toggle
 * their global blocking status
 * @extends Component
 * @memberof SetupViews
 */
class DataCollectionView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			slide: false,
			showToast: false,
			toastText: ''
		};

		// event bindings
		this.showToast = this.showToast.bind(this);
		this.hideToast = this.hideToast.bind(this);
	}

	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		this.props.actions.getSettingsData().then(() => {
			this.setState({
				slide: true,
			});
		});
	}

	/**
	 * Exits the custom blocking view and goes back to #blocking
	 */
	_exit = () => {
		this.props.history.push('/blocking');
	}

	/**
	 * Implement alert which is currently used to inform
	 * that altered settings were successfully saved.
	 */
	showToast(data) {
		this.setState({
			showToast: true,
			toastText: data.text
		});
		this.hideToast();
	}

	/**
	 * Hide alert in 3 sec. after it has been shown.
	 */
	hideToast = debounce(() => {
		this.setState({
			showToast: false,
			toastText: ''
		});
	}, 3000);

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the custom blocking dropdown
	 */
	render() {
		const viewClasses = classNames({
			row: true,
			collapse: true,
			slide: this.state.slide,
		});
		return (
			<div id="custom-block-view-container">
				<div id="custom-block-view-screen" onClick={this._exit} />
				<div id="custom-block-view" className={viewClasses}>
					<div className="columns small-12">
						<div className="callout-container">
							<div className={`callout toast success ${this.state.showToast ? '' : 'hide'}`}>
								<div className="callout-text">{this.state.toastText}</div>
							</div>
						</div>
						<GlobalBlocking settingsData={this.props} actions={this.props.actions} showToast={this.showToast} language={this.props.language} />
					</div>
					<div className="columns small-12 text-right done-container">
						<button className="button ghostery-button" onClick={this._exit}>{ t('setup_button_done') }</button>
					</div>
				</div>
			</div>
		);
	}
}

export default DataCollectionView;
