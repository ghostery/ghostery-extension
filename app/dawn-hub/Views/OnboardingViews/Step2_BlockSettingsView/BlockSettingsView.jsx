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
import {
	BLOCKING_POLICY_RECOMMENDED,
	BLOCKING_POLICY_NOTHING,
	BLOCKING_POLICY_EVERYTHING
} from '../../../../shared-hub/constants/BlockingPolicyConstants';

/**
 * @class Implement the Block Settings View for the Dawn Hub onboarding flow
 * @extends Component
 * @memberof DawnHubViews
 */
class BlockSettingsView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			kindsOfTrackers: null,
			enable_ad_block: null,
			enable_anti_tracking: null,
			enable_smart_block: null
		};
	}

	componentDidMount() {
		const { setupLifecycle: { blockSetupSeen } } = this.props;

		if (blockSetupSeen) {
			const {
				enable_anti_tracking,
				enable_ad_block,
				enable_smart_block,
				blockingPolicy
			} = this.props;

			this.setState({
				kindsOfTrackers: blockingPolicy,
				enable_ad_block,
				enable_anti_tracking,
				enable_smart_block
			});
		}
	}

	enumerateBlockingPolicy = (blockingPolicy) => {
		let decodedPolicy;
		switch (blockingPolicy) {
			case BLOCKING_POLICY_EVERYTHING:
				decodedPolicy = 1;
				break;
			case BLOCKING_POLICY_RECOMMENDED:
				decodedPolicy = 2;
				break;
			case BLOCKING_POLICY_NOTHING:
				decodedPolicy = 3;
				break;
			default:
				break;
		}
		return decodedPolicy;
	}

	toggleRecommendedChoices = (value) => {
		if (value === true) {
			this.setState({
				enable_ad_block: true,
				kindsOfTrackers: BLOCKING_POLICY_RECOMMENDED,
				enable_anti_tracking: true,
				enable_smart_block: true
			});
		} else {
			this.setState({
				enable_ad_block: null,
				kindsOfTrackers: null,
				enable_anti_tracking: null,
				enable_smart_block: null
			});
		}
	}

	recommendedChoicesActive = () => {
		const {
			enable_anti_tracking,
			enable_ad_block,
			enable_smart_block,
			kindsOfTrackers
		} = this.state;
		if (kindsOfTrackers === BLOCKING_POLICY_RECOMMENDED && enable_ad_block === true && enable_anti_tracking === true && enable_smart_block === true) {
			return true;
		}
		return false;
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
		const partTwo = this.enumerateBlockingPolicy(kindsOfTrackers);
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
				setAdBlock, setAntiTracking, setSmartBlocking, setBlockingPolicy, setSetupStep, setBlockSetupSeen
			} = actions;
			const { history } = this.props;

			setAdBlock({ enable_ad_block });
			setAntiTracking({ enable_anti_tracking });
			setSmartBlocking({ enable_smart_block });

			setBlockingPolicy({ blockingPolicy: kindsOfTrackers });

			setSetupStep({
				setup_step: BLOCK_SETTINGS,
				dawn_setup_number: this.buildSetupNumberString(),
				origin: ONBOARDING
			});
			setBlockSetupSeen(true);
			history.push('/onboarding/3');
		} else {
			setToast({
				toastMessage: t('ghostery_dawn_hub_blocking_settings_view_toast_error_message'),
				toastClass: 'alert'
			});
		}
	}

	renderQuestion = (question, tooltip = null) => {
		if (tooltip) {
			return (
				<li className="BlockSettingsView_question">
					<div className="BlockSettingsView_questionBlock">
						{question}
						<div className="BlockSettingsView__infoIcon g-tooltip">
							<Tooltip header={tooltip} position="top" delay="300" isOnboardingHub />
						</div>
					</div>
				</li>
			);
		}
		return (
			<li className="BlockSettingsView_question">{question}</li>
		);
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
			enable_ad_block, kindsOfTrackers, enable_anti_tracking, enable_smart_block
		} = this.state;

		const recommendedChoicesActive = this.recommendedChoicesActive();

		return (
			<Fragment>
				<div className="BlockSettingsView__relativeContainer">
					<div className="BlockSettingsView__backContainer">
						<span className="BlockSettingsView__caret left" />
						<NavLink to="/onboarding/1">
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
								checked={recommendedChoicesActive}
								onChange={() => this.toggleRecommendedChoices(!recommendedChoicesActive)}
							/>
							<div className="BlockSettingsView_checkboxLabel" onClick={() => this.toggleRecommendedChoices(!recommendedChoicesActive)}>{t('ghostery_dawn_onboarding_recommended_choices')}</div>
						</div>
						<ol>
							{this.renderQuestion(t('ghostery_dawn_onboarding_question_block_ads'))}
							{this.renderAnswerBlock((enable_ad_block === true), 'enable_ad_block', true, t('hub_setup_modal_button_yes'))}
							{this.renderAnswerBlock((enable_ad_block === false), 'enable_ad_block', false, t('hub_setup_modal_button_no'))}
							{this.renderQuestion(t('ghostery_dawn_onboarding_question_kinds_of_trackers'), t('ghostery_dawn_onboarding_info_blocking_all'))}
							{this.renderAnswerBlock((kindsOfTrackers === BLOCKING_POLICY_EVERYTHING), 'kindsOfTrackers', BLOCKING_POLICY_EVERYTHING, t('ghostery_dawn_onboarding_kinds_of_trackers_all'))}
							{this.renderAnswerBlock((kindsOfTrackers === BLOCKING_POLICY_RECOMMENDED), 'kindsOfTrackers', BLOCKING_POLICY_RECOMMENDED, t('ghostery_dawn_onboarding_kinds_of_trackers_ad_and_analytics'))}
							{this.renderAnswerBlock((kindsOfTrackers === BLOCKING_POLICY_NOTHING), 'kindsOfTrackers', BLOCKING_POLICY_NOTHING, t('ghostery_dawn_onboarding_kinds_of_trackers_none'))}
							{this.renderQuestion(t('ghostery_dawn_onboarding_question_anti_tracking'), t('ghostery_dawn_onboarding_info_anti_tracking'))}
							{this.renderAnswerBlock((enable_anti_tracking === true), 'enable_anti_tracking', true, t('hub_setup_modal_button_yes'))}
							{this.renderAnswerBlock((enable_anti_tracking === false), 'enable_anti_tracking', false, t('hub_setup_modal_button_no'))}
							{this.renderQuestion(t('ghostery_dawn_onboarding_question_smart_browsing'), t('ghostery_dawn_onboarding_info_smart_browsing'))}
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
		setAntiTracking: PropTypes.func.isRequired,
		setAdBlock: PropTypes.func.isRequired,
		setSmartBlocking: PropTypes.func.isRequired,
		setBlockingPolicy: PropTypes.func.isRequired,
		setToast: PropTypes.func.isRequired,
		setSetupStep: PropTypes.func.isRequired,
		setBlockSetupSeen: PropTypes.func.isRequired,
	}).isRequired,
	setupLifecycle: PropTypes.shape({
		blockSetupSeen: PropTypes.bool.isRequired,
	}).isRequired,
	enable_ad_block: PropTypes.bool.isRequired,
	enable_anti_tracking: PropTypes.bool.isRequired,
	enable_smart_block: PropTypes.bool.isRequired,
	blockingPolicy: PropTypes.string.isRequired
};
