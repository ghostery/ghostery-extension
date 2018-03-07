/**
 * Display View Component
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

/**
 * @class Implement the #display step in the Setup flow.
 * Offers two choices: simple view and detailed view
 * @extends Component
 * @memberof SetupViews
 */
class DisplayView extends Component {
	/**
	* Lifecycle event
	*/
	componentWillMount() {
		this.props.actions.updateTopContentData({
			image: '/app/images/setup/circles/displays.svg',
			title: t('setup_display_view_title'),
		});
		this.props.actions.resetNavigationNextButton();
	}

	/**
	* Lifecycle event
	*/
	componentDidMount() {
		this._save();
		this.props.actions.setupStep({ key: 'setup_step', value: 3 });
	}

	/**
	* handles the onChange property for toggling the data collection checkbox
	* @param  {Object} event Event created when toggling the checkbox
	*/
	_handleChange = (event) => {
		this._save(event.target.value);
	}

	/**
	 * Function to handle saving when choosing between view styles
	 * @param  {string} value The type of view styles: simple or detailed
	 */
	_save(value) {
		switch (value || this.props.displayMode) {
			case 'simple':
				this.props.actions.updateDisplayMode(false);
				break;
			case 'detailed':
				this.props.actions.updateDisplayMode(true);
				break;
			default: break;
		}
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the display view
	 */
	render() {
		return (
			<div id="display-view" className="row align-center">
				<div className="columns small-12 medium-12 large-9">
					<div className="row small-up-1 medium-up-2">
						<div className="columns">
							<label htmlFor="simple-display-input">
								<span className={`${this.props.displayMode === 'simple' ? 'selected' : ''} box-link selectable`} onClick={() => this._save(false)}>
									<img src="/app/images/setup/panel-simple.png" />
									<span className="text">{ t('setup_display_view_simple') }</span>
								</span>
								<div className="box-link-text show-for-medium">{ t('setup_display_view_simple_desc') }</div>
							</label>
							<input type="radio" name="display-mode" value="simple" id="simple-display-input" checked={this.props.displayMode === 'simple'} onChange={this._handleChange} />
						</div>
						<div className="columns">
							<label htmlFor="detailed-display-input">
								<span to="/blocking" className={`${this.props.displayMode !== 'simple' ? 'selected' : ''} box-link selectable`}>
									<img src="/app/images/setup/panel-detailed.png" />
									<span className="text">{ t('setup_display_view_detailed') }</span>
								</span>
								<div className="box-link-text show-for-medium">{ t('setup_display_view_detailed_desc') }</div>
							</label>
							<input type="radio" name="display-mode" value="detailed" id="detailed-display-input" checked={this.props.displayMode !== 'simple'} onChange={this._handleChange} />
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default DisplayView;
