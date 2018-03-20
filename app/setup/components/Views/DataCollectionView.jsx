/**
 * Data Collection View Component
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
import globals from '../../../../src/classes/Globals';

const { IS_CLIQZ } = globals;
const IS_EDGE = (globals.BROWSER_INFO.name === 'edge');

/**
 * @class Implement the #data-collection step of the setup flow
 * @extends Component
 * @memberof SetupViews
 */
class DataCollectionView extends Component {
	/**
	 * Lifecycle event
	 */
	componentWillMount() {
		this.props.actions.updateTopContentData({
			image: '/app/images/setup/circles/data-collection.svg',
			title: t('setup_data_view_title'),
		});
		this.props.actions.resetNavigationNextButton();
	}

	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		this.props.actions.updateDataCollection(true);
		this.props.actions.setupStep({ key: 'setup_step', value: 5 });
	}

	/**
	 * handles the onChange property for toggling the data collection checkbox
	 * @param  {Object} event Event created when toggling the checkbox
	 */
	_handleDataCollection = (event) => {
		this.props.actions.updateDataCollection(event.target.checked);
	}

	/**
	 * Wrapper function for dangerouslySetInnerHTML. Provides extra security
	 * @return {Object}
	 */
	createDescriptionMarkup() {
		return { __html: (IS_EDGE || IS_CLIQZ) ? t('setup_data_view_desc_no_human_web') : t('setup_data_view_desc') };
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the #data-collection step of the setup flow
	 */
	render() {
		return (
			<div id="data-collection-view">
				<div className="row align-center">
					<div className="column medium-8">
						<h3 dangerouslySetInnerHTML={this.createDescriptionMarkup()} />
						<p>
							<label>
								<input
									type="checkbox"
									id="data-collection-input"
									checked={this.props.enabled}
									onChange={this._handleDataCollection}
								/>
								{ t('setup_data_view_checkbox') }
							</label>
						</p>
					</div>
				</div>
			</div>
		);
	}
}

export default DataCollectionView;
