/**
 * Ghostery Browser Hub Block Settings View Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Fragment, Component } from 'react';
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
				kindsOfTrackers: 1,
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
				case 0:
					blockingPolicy = 'BLOCKING_POLICY_EVERYTHING';
					break;
				case 1:
					blockingPolicy = 'BLOCKING_POLICY_RECOMMENDED';
					break;
				case 2:
					blockingPolicy = 'BLOCKING_POLICY_NOTHING';
					break;
				default:
					break;
			}
			setBlockingPolicy({ blockingPolicy });

			setSetupStep({ setup_step: CHOOSE_DEFAULT_SEARCH, origin: ONBOARDING });
			history.push('/onboarding/3');
		} else {
			setToast({
				toastMessage: t('ghostery_browser_hub_blocking_settings_view_toast_error_message'),
				toastClass: 'alert'
			});
		}
	}

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
							<span className="BlockSettingsView__back">{t('ghostery_browser_hub_onboarding_back')}</span>
						</NavLink>
					</div>
				</div>
				<div className="BlockSettingsView__container">
					<div className="BlockSettingsView__title">{t('ghostery_browser_hub_onboarding_which_privacy_plan')}</div>
					<div className="BlockSettingsView__subtitle">{t('ghostery_browser_hub_onboarding_tell_us_your_preferences')}</div>
					<div className="BlockSettingsView_formBlock">
						<div className="BlockSettingsView_checkboxBlock">
							<ToggleCheckbox
								className="BlockSettingsView_checkbox"
								checked={recommendedChoices}
								onChange={() => this.toggleRecommendedChoices(!recommendedChoices)}
							/>
							<div>{t('ghostery_browser_hub_onboarding_recommended_choices')}</div>
						</div>
						<ol>
							<li className="BlockSettingsView_question">{t('ghostery_browser_hub_onboarding_question_block_ads')}</li>
							<div className="BlockSettingsView_answerBlock">
								<div className="BlockSettingsView__radioButtonContainer">
									<RadioButton checked={blockAds === true} handleClick={() => this.handleAnswerChange('blockAds', true)} altDesign />
								</div>
								<div className="BlockSettingsView_answerText">{t('hub_setup_modal_button_yes')}</div>
							</div>
							<div className="BlockSettingsView_answerBlock">
								<div className="BlockSettingsView__radioButtonContainer">
									<RadioButton checked={blockAds === false} handleClick={() => this.handleAnswerChange('blockAds', false)} altDesign />
								</div>
								<div className="BlockSettingsView_answerText">{t('hub_setup_modal_button_no')}</div>
							</div>
							<li className="BlockSettingsView_question">
								<div className="BlockSettingsView_questionBlock">
									{t('ghostery_browser_hub_onboarding_question_kinds_of_trackers')}
									<div className="BlockSettingsView__infoIcon g-tooltip">
										<Tooltip header={t('ghostery_browser_hub_onboarding_info_blocking_all')} position="top" delay="300" isOnboardingHub />
									</div>
								</div>
								<div className="BlockSettingsView_answerBlock">
									<div className="BlockSettingsView__radioButtonContainer">
										<RadioButton checked={kindsOfTrackers === 0} handleClick={() => this.handleAnswerChange('kindsOfTrackers', 0)} altDesign />
									</div>
									<div className="BlockSettingsView_answerText">{t('ghostery_browser_hub_onboarding_kinds_of_trackers_all')}</div>
								</div>
								<div className="BlockSettingsView_answerBlock">
									<div className="BlockSettingsView__radioButtonContainer">
										<RadioButton checked={kindsOfTrackers === 1} handleClick={() => this.handleAnswerChange('kindsOfTrackers', 1)} altDesign />
									</div>
									<div className="BlockSettingsView_answerText">{t('ghostery_browser_hub_onboarding_kinds_of_trackers_ad_and_analytics')}</div>
								</div>
								<div className="BlockSettingsView_answerBlock">
									<div className="BlockSettingsView__radioButtonContainer">
										<RadioButton checked={kindsOfTrackers === 2} handleClick={() => this.handleAnswerChange('kindsOfTrackers', 2)} altDesign />
									</div>
									<div className="BlockSettingsView_answerText">{t('ghostery_browser_hub_onboarding_kinds_of_trackers_none')}</div>
								</div>
								<li className="BlockSettingsView_question">
									<div className="BlockSettingsView_questionBlock">
										{t('ghostery_browser_hub_onboarding_question_anti_tracking')}
										<div className="BlockSettingsView__infoIcon g-tooltip">
											<Tooltip header={t('ghostery_browser_hub_onboarding_info_anti_tracking')} position="top" delay="300" isOnboardingHub />
										</div>
									</div>
								</li>
								<div className="BlockSettingsView_answerBlock">
									<div className="BlockSettingsView__radioButtonContainer">
										<RadioButton checked={antiTracking === true} handleClick={() => this.handleAnswerChange('antiTracking', true)} altDesign />
									</div>
									<div className="BlockSettingsView_answerText">{t('hub_setup_modal_button_yes')}</div>
								</div>
								<div className="BlockSettingsView_answerBlock">
									<div className="BlockSettingsView__radioButtonContainer">
										<RadioButton checked={antiTracking === false} handleClick={() => this.handleAnswerChange('antiTracking', false)} altDesign />
									</div>
									<div className="BlockSettingsView_answerText">{t('hub_setup_modal_button_no')}</div>
								</div>
								<li className="BlockSettingsView_question">
									<div className="BlockSettingsView_questionBlock">
										{t('ghostery_browser_hub_onboarding_question_smart_browsing')}
										<div className="BlockSettingsView__infoIcon g-tooltip">
											<Tooltip header={t('ghostery_browser_hub_onboarding_info_smart_browsing')} position="top" delay="300" isOnboardingHub />
										</div>
									</div>
								</li>
								<div className="BlockSettingsView_answerBlock">
									<div className="BlockSettingsView__radioButtonContainer">
										<RadioButton checked={smartBrowsing === true} handleClick={() => this.handleAnswerChange('smartBrowsing', true)} altDesign />
									</div>
									<div className="BlockSettingsView_answerText">{t('hub_setup_modal_button_yes')}</div>
								</div>
								<div className="BlockSettingsView_answerBlock">
									<div className="BlockSettingsView__radioButtonContainer">
										<RadioButton checked={smartBrowsing === false} handleClick={() => this.handleAnswerChange('smartBrowsing', false)} altDesign />
									</div>
									<div className="BlockSettingsView_answerText">{t('hub_setup_modal_button_no')}</div>
								</div>
							</li>
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
