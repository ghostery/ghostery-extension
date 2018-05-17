/**
 * Additional Features View Component
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
import { ToggleSlider } from '../../../panel/components/BuildingBlocks';

const { IS_CLIQZ } = globals;

/**
 * @class Implement the #additional-features part of the Setup flow.
 * Offers choices to toggle on/off Cliqz's features: Enhanced Anti-Tracking,
 * Enhanced Ad Blocking, Smart Blocking
 * @extends Component
 * @memberof SetupViews
 */
class AdditionalFeaturesView extends Component {
	componentWillMount() {
		this.props.actions.updateTopContentData({
			image: '/app/images/setup/circles/shield-stop-lightbulb.svg',
			title: t('setup_additional_view_title'),
		});
		this.props.actions.resetNavigationNextButton();
	}

	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		this._save();
		this.props.actions.setupStep({ key: 'setup_step', value: 2 });
	}

	/**
	 * Function to handle Toggle events and call an action
	 * @param  {Object} event The event created by the onChange property
	 */
	_handleAntiTrack = (event) => {
		if (!IS_CLIQZ) {
			this.props.actions.updateAntiTrack(event.target.checked);
		}
	}

	/**
	 * Function to handle Toggle events and call an action
	 * @param  {Object} event The event created by the onChange property
	 */
	_handleSmartBlock = (event) => {
		this.props.actions.updateSmartBlock(event.target.checked);
	}

	/**
	 * Function to handle Toggle events and call an action
	 * @param  {Object} event The event created by the onChange property
	 */
	_handleAdBlock = (event) => {
		if (!IS_CLIQZ) {
			this.props.actions.updateAdBlock(event.target.checked);
		}
	}

	/**
	 * Calls actions to save feature toggle status
	 */
	_save = () => {
		this.props.actions.updateAntiTrack(this.props.antiTrack);
		this.props.actions.updateAdBlock(this.props.adBlock);
		this.props.actions.updateSmartBlock(this.props.smartBlock);
	}

	/**
	 * Gets the text for a feature
	 * @return {Object}
	 */
	createAntiTrackDescriptionMarkup() {
		return { __html: IS_CLIQZ ? t('setup_feature_active_in_cliqz') : t('setup_additional_view_antitrack_desc') };
	}

	/**
	 * The html for for the Enhanced AdBlock description
	 * @return {Object}
	 */
	createAdBlockDescriptionMarkup() {
		return { __html: IS_CLIQZ ? t('setup_feature_active_in_cliqz') : t('setup_additional_view_adblock_desc') };
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the #additional-features step of the setup flow
	 */
	render() {
		return (
			<div id="additional-features-view" className="row align-center">
				<div className="columns medium-12 large-8">
					<div className="row align-center align-middle cliqz-feature">
						<div className="columns shrink">
							<div className="cliqz-controls">
								<button className={`controls-trust anti-track-btn ${this.props.antiTrack ? 'active' : ''}`} />
							</div>
						</div>
						<div className="columns shrink">
							<ToggleSlider
								className="AdditionalFeatures--add-padding"
								isDisabled={IS_CLIQZ}
								isChecked={this.props.antiTrack}
								onChange={this._handleAntiTrack}
							/>
						</div>
						<div className="columns small-12 medium-8">
							<h4 style={IS_CLIQZ ? { color: '#979797' } : {}}>{ t('setup_additional_view_antitrack_title') }</h4>
							<h6 className={`enabled ${!this.props.antiTrack ? 'hide' : ''}`}>{ t('setup_additional_view_enabled') }</h6>
							<p dangerouslySetInnerHTML={this.createAntiTrackDescriptionMarkup()} />
						</div>
					</div>
					<div className="row align-center align-middle cliqz-feature">
						<div className="columns shrink">
							<div className="cliqz-controls">
								<button className={`controls-trust ad-block-btn ${this.props.adBlock ? 'active' : ''}`} />
							</div>
						</div>
						<div className="columns shrink">
							<ToggleSlider
								className="AdditionalFeatures--add-padding"
								isDisabled={IS_CLIQZ}
								isChecked={this.props.adBlock}
								onChange={this._handleAdBlock}
							/>
						</div>
						<div className="columns small-12 medium-8">
							<h4 style={IS_CLIQZ ? { color: '#979797' } : {}}>{ t('setup_additional_view_adblock_title') }</h4>
							<h6 className={`enabled ${!this.props.adBlock ? 'hide' : ''}`}>{ t('setup_additional_view_enabled') }</h6>
							<p dangerouslySetInnerHTML={this.createAdBlockDescriptionMarkup()} />
						</div>
					</div>
					<div className="row align-center align-middle cliqz-feature">
						<div className="columns shrink">
							<div className="cliqz-controls">
								<button className={`controls-trust smart-block-btn ${this.props.smartBlock ? 'active' : ''}`} />
							</div>
						</div>
						<div className="columns shrink">
							<ToggleSlider
								className="AdditionalFeatures--add-padding"
								isDisabled={IS_CLIQZ}
								isChecked={this.props.smartBlock}
								onChange={this._handleSmartBlock}
							/>
						</div>
						<div className="columns small-12 medium-8">
							<h4>{ t('setup_additional_view_smartblock_title') }</h4>
							<h6 className={`enabled ${!this.props.smartBlock ? 'hide' : ''}`}>{ t('setup_additional_view_enabled') }</h6>
							<p>{ t('setup_additional_view_smartblock_desc') }</p>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default AdditionalFeaturesView;
