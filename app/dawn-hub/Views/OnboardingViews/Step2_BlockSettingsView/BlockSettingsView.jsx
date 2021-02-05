/**
 * Dawn Hub onboarding flow Block Settings View Component
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
import { BLOCK_SETTINGS, ONBOARDING } from '../../OnboardingView/OnboardingConstants';

/**
 * @class Implement the Block Settings View for the Dawn Hub onboarding flow
 * @extends Component
 * @memberof DawnHubViews
 */
class BlockSettingsView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			recommendedChoices: false,
			enable_ad_block: null,
			kindsOfTrackers: null,
			enable_anti_tracking: null,
			enable_smart_block: null
		};
	}

	toggleRecommendedChoices = (value) => {
		if (value === true) {
			this.setState({
				recommendedChoices: true,
				enable_ad_block: true,
				kindsOfTrackers: 2,
				enable_anti_tracking: true,
				enable_smart_block: true
			});
		} else {
			this.setState({
				recommendedChoices: false,
				enable_ad_block: null,
				kindsOfTrackers: null,
				enable_anti_tracking: null,
				enable_smart_block: null
			});
		}
	}

	handleAnswerChange = (category, answer) => {
		this.setState({ [category]: answer });
	}

	// Refer to https://ghostery.atlassian.net/wiki/spaces/BI/pages/488079383/Ghostery+Browser+-+Onboarding+Pings for setup_number string formatting
	buildSetupNumberString = () => {
		const {
			enable_ad_block,
			kindsOfTrackers,
			enable_anti_tracking,
			enable_smart_block
		} = this.state;

		const partOne = (enable_ad_block) ? '1' : '2';
		const partTwo = kindsOfTrackers.toString();
		const partThree = (enable_anti_tracking) ? '1' : '2';
		const partFour = (enable_smart_block) ? '1' : '2';

		return `${partOne}${partTwo}${partThree}${partFour}`;
	}

	handleSubmit = () => {
		const {
			enable_ad_block, kindsOfTrackers, enable_anti_tracking, enable_smart_block
		} = this.state;

		const { actions } = this.props;
		const { setToast } = actions;

		// Will only change user settings if all questions are answered
		if (enable_ad_block !== null && kindsOfTrackers !== null && enable_anti_tracking !== null && enable_smart_block !== null) {
			setToast({
				toastMessage: '',
				toastClass: ''
			});

			const {
				setAdBlock, setAntiTracking, setSmartBlocking, setBlockingPolicy, setSetupStep
			} = actions;
			const { history } = this.props;

			setAdBlock({ enable_ad_block });
			setAntiTracking({ enable_anti_tracking });
			setSmartBlocking({ enable_smart_block });

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
				setup_step: BLOCK_SETTINGS,
				dawn_setup_number: this.buildSetupNumberString(),
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
				<RadioButton checked={checked} altDesign handleClick={() => {}} />
			</div>
			<div className="BlockSettingsView_answerText">{label}</div>
		</div>
	);

	render() {
		const {
			recommendedChoices, enable_ad_block, kindsOfTrackers, enable_anti_tracking, enable_smart_block
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
							{this.renderAnswerBlock((enable_ad_block === true), 'enable_ad_block', true, t('hub_setup_modal_button_yes'))}
							{this.renderAnswerBlock((enable_ad_block === false), 'enable_ad_block', false, t('hub_setup_modal_button_no'))}
							<li className="BlockSettingsView_question">
								<div className="BlockSettingsView_questionBlock">
									{t('ghostery_dawn_onboarding_question_kinds_of_trackers')}
									<div className="BlockSettingsView__infoIcon g-tooltip">
										<Tooltip header={t('ghostery_dawn_onboarding_info_blocking_all')} position="top" delay="300" isOnboardingHub />
									</div>
								</div>
							</li>
							{this.renderAnswerBlock((kindsOfTrackers === 1), 'kindsOfTrackers', 1, t('ghostery_dawn_onboarding_kinds_of_trackers_all'))}
							{this.renderAnswerBlock((kindsOfTrackers === 2), 'kindsOfTrackers', 2, t('ghostery_dawn_onboarding_kinds_of_trackers_ad_and_analytics'))}
							{this.renderAnswerBlock((kindsOfTrackers === 3), 'kindsOfTrackers', 3, t('ghostery_dawn_onboarding_kinds_of_trackers_none'))}
							<li className="BlockSettingsView_question">
								<div className="BlockSettingsView_questionBlock">
									{t('ghostery_dawn_onboarding_question_anti_tracking')}
									<div className="BlockSettingsView__infoIcon g-tooltip">
										<Tooltip header={t('ghostery_dawn_onboarding_info_anti_tracking')} position="top" delay="300" isOnboardingHub />
									</div>
								</div>
							</li>
							{this.renderAnswerBlock((enable_anti_tracking === true), 'enable_anti_tracking', true, t('hub_setup_modal_button_yes'))}
							{this.renderAnswerBlock((enable_anti_tracking === false), 'enable_anti_tracking', false, t('hub_setup_modal_button_no'))}
							<li className="BlockSettingsView_question">
								<div className="BlockSettingsView_questionBlock">
									{t('ghostery_dawn_onboarding_question_smart_browsing')}
									<div className="BlockSettingsView__infoIcon g-tooltip">
										<Tooltip header={t('ghostery_dawn_onboarding_info_smart_browsing')} position="top" delay="300" isOnboardingHub />
									</div>
								</div>
							</li>
							{this.renderAnswerBlock((enable_smart_block === true), 'enable_smart_block', true, t('hub_setup_modal_button_yes'))}
							{this.renderAnswerBlock((enable_smart_block === false), 'enable_smart_block', false, t('hub_setup_modal_button_no'))}
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
