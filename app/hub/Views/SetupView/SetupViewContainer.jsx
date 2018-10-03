/**
 * Setup View Container
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
import { NavLink } from 'react-router-dom';
import QueryString from 'query-string';
import PropTypes from 'prop-types';
import SetupView from './SetupView';
import { Modal, ToggleCheckbox } from '../../../shared-components';
import { BLOCKING_POLICY_RECOMMENDED } from './SetupViewConstants';

// Component Views
import SetupBlockingView from '../SetupViews/SetupBlockingView';
import SetupBlockingDropdown from '../SetupViews/SetupBlockingDropdown';
import SetupAntiSuiteView from '../SetupViews/SetupAntiSuiteView';
import SetupHumanWebView from '../SetupViews/SetupHumanWebView';
import SetupDoneView from '../SetupViews/SetupDoneView';

import globals from '../../../../src/classes/Globals';

const isEdge = (globals.BROWSER_INFO.name === 'edge');

/**
 * @class Implement the Setup View for the Ghostery Hub
 * @extends Component
 * @memberof HubContainers
 */
class SetupViewContainer extends Component {
	constructor(props) {
		super(props);
		this.state = {
			sendMountActions: false,
			showModal: false,
		};

		if (!props.preventRedirect) {
			this.props.history.push('/setup/1');
		}

		const title = t('hub_setup_page_title');
		window.document.title = title;

		this.props.actions.initSetupProps(this.props.setup);
		this.props.actions.getSetupShowWarningOverride().then((data) => {
			const { setup_show_warning_override } = data;
			const { justInstalled } = QueryString.parse(window.location.search);

			if (justInstalled !== 'true' && setup_show_warning_override) {
				this._toggleModal();
			} else {
				const { origin, pathname, hash } = window.location;
				window.history.pushState({}, '', `${origin}${pathname}${hash}`);
				this._setDefaultSettings();
			}
		});
	}

	/**
	 * Function to persist the default settings to background
	 */
	_setDefaultSettings() {
		this.setState({ sendMountActions: true });
		this.props.actions.setBlockingPolicy({ blockingPolicy: BLOCKING_POLICY_RECOMMENDED });
		this.props.actions.setAntiTracking({ enable_anti_tracking: true });
		this.props.actions.setAdBlock({ enable_ad_block: true });
		this.props.actions.setSmartBlocking({ enable_smart_blocking: true });
		if (!isEdge) {
			this.props.actions.setGhosteryRewards({ enable_ghostery_rewards: true });
			this.props.actions.setHumanWeb({ enable_human_web: true });
		}
	}

	/**
	* Function to handle clicking yes on the Modal
	*/
	_answerModalYes = () => {
		this._setDefaultSettings();
		this._toggleModal();
	}

	/**
	* Function to toggle the Modal
	*/
	_toggleModal = () => {
		const { showModal } = this.state;
		this.setState({
			showModal: !showModal,
		});
	}

	/**
	* Function to toggle the Ask Again Checkbox
	*/
	_toggleCheckbox = () => {
		const { setup_show_warning_override } = this.props.setup;
		this.props.actions.setSetupShowWarningOverride({
			setup_show_warning_override: !setup_show_warning_override,
		});
	}

	/**
	 * Helper render function for rendering the Modal's Children
	 * @return {JSX} JSX of the Setup Modal's Children
	 */
	_renderModalChildren() {
		const { setup_show_warning_override } = this.props.setup;

		return (
			<div className="SetupModal__content flex-container flex-dir-column align-middle">
				<div className="SetupModal__image" />
				<div className="SetupModal__text flex-child-grow">
					{t('hub_setup_enter_modal_text')}
				</div>
				<div className="SetupModal__buttonContainer full-width">
					<div className="full-width flex-container align-justify">
						<NavLink to="/" className="button success hollow">
							{t('hub_setup_modal_button_no')}
						</NavLink>
						<div className="button success hollow" onClick={this._answerModalYes}>
							{t('hub_setup_modal_button_yes')}
						</div>
					</div>
					<div className="flex-container align-center-middle">
						<ToggleCheckbox checked={!setup_show_warning_override} onChange={this._toggleCheckbox} />
						<div className="SetupModal__checkboxText" onClick={this._toggleCheckbox}>
							{t('hub_setup_modal_button_ask_again')}
						</div>
					</div>
				</div>
			</div>
		);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Setup View of the Hub app
	 */
	render() {
		const { showModal, sendMountActions } = this.state;
		const steps =
		[
			{
				index: 1,
				path: '/setup/1',
				bodyComponent: SetupBlockingView,
				headerProps: {
					title: t('hub_setup_header_title_blocking'),
					titleImage: '/app/images/hub/setup/ghosty-block-all.svg',
				},
			},
			{
				index: 2,
				path: '/setup/2',
				bodyComponent: SetupAntiSuiteView,
				headerProps: {
					title: t('hub_setup_header_title_antisuite'),
					titleImage: '/app/images/hub/setup/ghosty-shield-stop-lightbulb.svg',
				},
			},
			{
				index: 3,
				path: '/setup/3',
				bodyComponent: SetupHumanWebView,
				headerProps: {
					title: t('hub_setup_header_title_humanweb'),
					titleImage: '/app/images/hub/setup/ghosty-human-web.svg',
				},
			},
			{
				index: 4,
				path: '/setup/4',
				bodyComponent: SetupDoneView,
				headerProps: {
					title: t('hub_setup_header_title_done'),
					titleImage: '/app/images/hub/setup/ghosty-check-wrench.svg',
				},
			},
		];

		if (isEdge) {
			const index = steps.findIndex(item => item.headerProps.title === t('hub_setup_header_title_humanweb'));
			steps.splice(index, 1);
			for (let i = index; i < steps.length; i++) {
				const item = steps[i];
				item.index -= 1;
				item.path = `/setup/${item.index}`;
			}
		}

		const extraRoutes = [
			{
				name: '1/custom',
				path: '/setup/1/custom',
				component: SetupBlockingDropdown,
			}
		];

		return (
			<div className="full-height">
				<Modal show={showModal} >
					{this._renderModalChildren()}
				</Modal>
				<SetupView steps={steps} extraRoutes={extraRoutes} sendMountActions={sendMountActions} />
			</div>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
// Note: isRequired is not needed when a prop has a default value
SetupViewContainer.propTypes = {
	preventRedirect: PropTypes.bool,
	setup: PropTypes.shape({
		navigation: PropTypes.shape({
			activeIndex: PropTypes.number,
			hrefPrev: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			hrefNext: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			hrefDone: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			textPrev: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			textNext: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
			textDone: PropTypes.oneOfType([
				PropTypes.bool,
				PropTypes.string,
			]),
		}),
		setup_show_warning_override: PropTypes.bool,
		blockingPolicy: PropTypes.string,
		enable_anti_tracking: PropTypes.bool,
		enable_ad_block: PropTypes.bool,
		enable_smart_blocking: PropTypes.bool,
		enable_ghostery_rewards: PropTypes.bool,
		enable_human_web: PropTypes.bool,
	}),
	actions: PropTypes.shape({
		getSetupShowWarningOverride: PropTypes.func.isRequired,
		setSetupShowWarningOverride: PropTypes.func.isRequired,
		initSetupProps: PropTypes.func.isRequired,
		setSetupNavigation: PropTypes.func.isRequired,
		setBlockingPolicy: PropTypes.func.isRequired,
		setAntiTracking: PropTypes.func.isRequired,
		setAdBlock: PropTypes.func.isRequired,
		setSmartBlocking: PropTypes.func.isRequired,
		setGhosteryRewards: isEdge ? PropTypes.func : PropTypes.func.isRequired,
		setHumanWeb: isEdge ? PropTypes.func : PropTypes.func.isRequired,
		setSetupComplete: PropTypes.func.isRequired,
	}).isRequired,
};

// Default props used throughout the Setup flow
SetupViewContainer.defaultProps = {
	preventRedirect: false,
	setup: {
		navigation: {
			activeIndex: 0,
			hrefPrev: false,
			hrefNext: false,
			hrefDone: false,
			textPrev: false,
			textNext: false,
			textDone: false,
		},
		setup_show_warning_override: true,
		blockingPolicy: BLOCKING_POLICY_RECOMMENDED,
		enable_anti_tracking: true,
		enable_ad_block: true,
		enable_smart_blocking: true,
		enable_ghostery_rewards: true,
		enable_human_web: true,
	},
};

export default SetupViewContainer;
