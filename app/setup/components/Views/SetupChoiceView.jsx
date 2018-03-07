/**
 * Setup Choice View Component
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
 * @class Implement the first step in the Setup flow
 * Offers a choice between choosing One Click Setup or Custom Setup
 * @extends Component
 * @memberof SetupViews
 */
class SetupChoiceView extends Component {
	/**
	* Lifecycle event
	*/
	componentWillMount() {
		this.props.actions.updateTopContentData({
			image: '/app/images/setup/circles/heart-dialog.svg',
			title: t('setup_choice_view_title'),
		});
		this.props.actions.resetNavigationNextButton();
	}

	/**
	* Lifecycle event
	*/
	componentDidMount() {

		// this.props.actions.setupStep({key:'setup_step', value: 0});
	}

	/**
	 * Handles the click event for choosing One Click Setup
	 */
	_oneClickSetup = () => {
		// do nothing so that on new installs, nothing is blocked.
		// And on upgrades, selcted_app_ids is unchanged.
		// this.props.actions.blockNone();
		this.props.actions.updateAntiTrack(true);
		this.props.actions.updateSmartBlock(true);
		this.props.actions.updateAdBlock(true);
		this.props.actions.updateDataCollection(this.dataCollectionInput.checked);
		this.props.actions.updateDisplayMode(false);
		this.props.actions.disableShowAlert();

		this.props.actions.setupStep({ key: 'setup_path', value: 1 });
	}

	/**
	 * Handles the click event for choosing One Custom Setup
	 */
	_customSetup = () => {
		this.props.actions.setupStep({ key: 'setup_path', value: 2 });
	}

	/**
	 * Handles the onChange property when clicking the Data Collection checkbox
	 * @param  {Event} event
	 */
	_handleDataCollection = (event) => {
		this.props.actions.updateDataCollection(event.target.checked);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the #additional-features step of the setup flow
	 */
	render() {
		return (
			<div id="setup-choice-view" className="row align-center">
				<div className="columns small-12 medium-9 large-6">
					<div className="row small-up-2 align-center">
						<div className="columns one-click">
							<Link to="/done" className="button box-link selectable" onClick={this._oneClickSetup}>
								<img src="/app/images/setup/circles/lines.svg" />
								<span className="text">{ t('setup_choice_view_one_click') }</span>
							</Link>
							<div className="box-link-text">
								<input
									ref={(ref) => { this.dataCollectionInput = ref; }}
									type="checkbox"
									id="data-collection-input"
									checked={this.props.dataCollection.enabled}
									onChange={this._handleDataCollection}
								/>
								<label htmlFor="data-collection-input">
									{ (IS_EDGE || IS_CLIQZ) ?
										t('setup_choice_view_share_data_no_human_web') :
										t('setup_choice_view_share_data')
									}
									<br />
									<a href="https://www.ghostery.com/faqs/" target="_blank" rel="noopener noreferrer">
										{ t('setup_choice_view_learn_more') }
									</a>
								</label>
							</div>
						</div>
						<div className="columns custom">
							<Link to="/blocking" className="button box-link selectable" onClick={this._customSetup}>
								<img src="/app/images/setup/circles/clipboard.svg" />
								<span className="text">{ t('setup_choice_view_custom_setup') }</span>
							</Link>
							<div className="box-link-text">
								<label>{ t('setup_choice_view_answer_questions') }</label>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default SetupChoiceView;
