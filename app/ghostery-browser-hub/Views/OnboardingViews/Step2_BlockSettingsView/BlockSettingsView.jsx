/**
 * Ghostery Browser Hub Block Settings View Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

import Tooltip from '../../../../shared-components/Tooltip';
import RadioButton from '../../../../shared-components/RadioButton/RadioButton';
import ToggleCheckbox from '../../../../shared-components/ToggleCheckbox/ToggleCheckbox';
import { CHOOSE_DEFAULT_SEARCH, ONBOARDING } from '../../OnboardingView/OnboardingConstants';

/**
 * @class Implement the Block Settings View for the Ghostery Browser Hub
 * @extends Component
 * @memberof HubComponents
 */
class BlockSettingsView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			recommendedChoices: false,
			blockAds: null,
			kindsOfTrackers: null,
			antiTracking: null,
			smartBrowsing: null
		};
	}

	toggleRecommendedChoices = (value) => {
		if (value === true) {
			this.setState({
				recommendedChoices: true,
				blockAds: true,
				kindsOfTrackers: 2,
				antiTracking: true,
				smartBrowsing: true
			});
		} else {
			this.setState({
				recommendedChoices: false,
				blockAds: null,
				kindsOfTrackers: null,
				antiTracking: null,
				smartBrowsing: null
			});
		}
	}

	handleAnswerChange = (category, answer) => {
		this.setState({ [category]: answer });
	}

	// Refer to https://ghostery.atlassian.net/wiki/spaces/BI/pages/488079383/Ghostery+Browser+-+Onboarding+Pings for setup_number string formatting
	buildSetupNumberString = () => {
		const {
			blockAds,
			kindsOfTrackers,
			antiTracking,
			smartBrowsing
		} = this.state;

		const partOne = (blockAds) ? '1' : '2';
		const partTwo = kindsOfTrackers.toString();
		const partThree = (antiTracking) ? '1' : '2';
		const partFour = (smartBrowsing) ? '1' : '2';

		return partOne + partTwo + partThree + partFour;
	}

	handleSubmit = () => {
		const {
			blockAds, kindsOfTrackers, antiTracking, smartBrowsing
		} = this.state;

		const { actions } = this.props;
		const { setToast } = actions;

		// Will only change user settings if all questions are answered
		if (blockAds !== null && kindsOfTrackers !== null && antiTracking !== null && smartBrowsing !== null) {
			setToast({
				toastMessage: '',
				toastClass: ''
			});

			const {
				setAdBlock, setAntiTracking, setSmartBlocking, setBlockingPolicy, setSetupStep
			} = actions;
			const { history } = this.props;

			setAdBlock(blockAds);
			setAntiTracking(antiTracking);
			setSmartBlocking(smartBrowsing);

			let blockingPolicy;
			switch (kindsOfTrackers) {
				case 1:
					blockingPolicy = 'BLOCKING_POLICY_EVERYTHING';
					break;
				case 2:
					blockingPolicy = 'BLOCKING_POLICY_RECOMMENDED';
					break;
				case 3:
					blockingPolicy = 'BLOCKING_POLICY_NOTHING';
					break;
				default:
					break;
			}
			setBlockingPolicy({ blockingPolicy });

			setSetupStep({
				setup_step: CHOOSE_DEFAULT_SEARCH,
				setup_number: this.buildSetupNumberString(),
				origin: ONBOARDING
			});
			history.push('/onboarding/3');
		} else {
			setToast({
				toastMessage: t('ghostery_dawn_hub_blocking_settings_view_toast_error_message'),
				toastClass: 'alert'
			});
		}
	}

	renderAnswerBlock = (checked, category, answer, label) => (
		<div className="BlockSettingsView_answerBlock" onClick={() => this.handleAnswerChange(category, answer)}>
			<div className="BlockSettingsView__radioButtonContainer">
				<RadioButton checked={checked} altDesign onClick={() => {}} />
			</div>
			<div className="BlockSettingsView_answerText">{label}</div>
		</div>
	);

	render() {
		const {
			recommendedChoices, blockAds, kindsOfTrackers, antiTracking, smartBrowsing
		} = this.state;
		const { actions } = this.props;
		const { logout } = actions;
		return (
			<Fragment>
				<div className="BlockSettingsView__relativeContainer">
					<div className="BlockSettingsView__backContainer">
						<span className="BlockSettingsView__caret left" />
						<NavLink to="/onboarding/1" onClick={() => logout()}>
							<span className="BlockSettingsView__back">{t('ghostery_dawn_onboarding_back')}</span>
						</NavLink>
					</div>
				</div>
				<div className="BlockSettingsView__container">
					<div className="BlockSettingsView__title">{t('ghostery_dawn_onboarding_which_privacy_plan')}</div>
					<div className="BlockSettingsView__subtitle">{t('ghostery_dawn_onboarding_tell_us_your_preferences')}</div>
					<div className="BlockSettingsView_formBlock">
						<div className="BlockSettingsView_checkboxBlock">
							<ToggleCheckbox
								className="BlockSettingsView_checkbox"
								checked={recommendedChoices}
								onChange={() => this.toggleRecommendedChoices(!recommendedChoices)}
							/>
							<div className="BlockSettingsView_checkboxLabel" onClick={() => this.toggleRecommendedChoices(!recommendedChoices)}>{t('ghostery_dawn_onboarding_recommended_choices')}</div>
						</div>
						<ol>
							<li className="BlockSettingsView_question">{t('ghostery_dawn_onboarding_question_block_ads')}</li>
							{this.renderAnswerBlock((blockAds === true), 'blockAds', true, t('hub_setup_modal_button_yes'))}
							{this.renderAnswerBlock((blockAds === false), 'blockAds', false, t('hub_setup_modal_button_no'))}
							<li className="BlockSettingsView_question">
								<div className="BlockSettingsView_questionBlock">
									{t('ghostery_dawn_onboarding_question_kinds_of_trackers')}
									<div className="BlockSettingsView__infoIcon g-tooltip">
										<Tooltip header={t('ghostery_dawn_onboarding_info_blocking_all')} position="top" delay="300" isOnboardingHub />
									</div>
								</div>
							</li>
							{this.renderAnswerBlock((kindsOfTrackers === 0), 'kindsOfTrackers', 0, t('ghostery_dawn_onboarding_kinds_of_trackers_all'))}
							{this.renderAnswerBlock((kindsOfTrackers === 1), 'kindsOfTrackers', 1, t('ghostery_dawn_onboarding_kinds_of_trackers_ad_and_analytics'))}
							{this.renderAnswerBlock((kindsOfTrackers === 2), 'kindsOfTrackers', 2, t('ghostery_dawn_onboarding_kinds_of_trackers_none'))}
							<li className="BlockSettingsView_question">
								<div className="BlockSettingsView_questionBlock">
									{t('ghostery_dawn_onboarding_question_anti_tracking')}
									<div className="BlockSettingsView__infoIcon g-tooltip">
										<Tooltip header={t('ghostery_dawn_onboarding_info_anti_tracking')} position="top" delay="300" isOnboardingHub />
									</div>
								</div>
							</li>
							{this.renderAnswerBlock((antiTracking === true), 'antiTracking', true, t('hub_setup_modal_button_yes'))}
							{this.renderAnswerBlock((antiTracking === false), 'antiTracking', false, t('hub_setup_modal_button_no'))}
							<li className="BlockSettingsView_question">
								<div className="BlockSettingsView_questionBlock">
									{t('ghostery_dawn_onboarding_question_smart_browsing')}
									<div className="BlockSettingsView__infoIcon g-tooltip">
										<Tooltip header={t('ghostery_dawn_onboarding_info_smart_browsing')} position="top" delay="300" isOnboardingHub />
									</div>
								</div>
							</li>
							{this.renderAnswerBlock((smartBrowsing === true), 'smartBrowsing', true, t('hub_setup_modal_button_yes'))}
							{this.renderAnswerBlock((smartBrowsing === false), 'smartBrowsing', false, t('hub_setup_modal_button_no'))}
						</ol>
					</div>
					<button
						className="BlockSettingsView__ctaButton"
						type="button"
						onClick={() => this.handleSubmit()}
					>
						{t('next')}
					</button>
				</div>
			</Fragment>
		);
	}
}

export default BlockSettingsView;

// PropTypes ensure we pass required props of the correct type
BlockSettingsView.propTypes = {
	actions: PropTypes.shape({
		logout: PropTypes.func.isRequired,
		setAntiTracking: PropTypes.func.isRequired,
		setAdBlock: PropTypes.func.isRequired,
		setSmartBlocking: PropTypes.func.isRequired,
		setBlockingPolicy: PropTypes.func.isRequired,
		setToast: PropTypes.func.isRequired,
		setSetupStep: PropTypes.func.isRequired,
	}).isRequired,
};
