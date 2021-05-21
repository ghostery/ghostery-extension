/**
 * Dawn Hub onboarding flow Choose Plan View Component
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

import React, { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import RadioButton from '../../../../shared-components/RadioButton';
import globals from '../../../../../src/classes/Globals';
import { BASIC, PLUS, PREMIUM } from '../../../../hub/Views/UpgradePlanView/UpgradePlanViewConstants';
import {
	CHOOSE_PLAN,
	ONBOARDING,
	FREE_USER_NO_TRIAL,
	FREE_USER_PLUS_TRIAL,
	FREE_USER_PLUS_SUBSCRIPTION,
	FREE_USER_PREMIUM_SUBSCRIPTION,
	PLUS_SUBSCRIBER_KEEP_SUBSCRIPTION,
	PLUS_SUBSCRIBER_PREMIUM_SUBSCRIPTION,
	PREMIUM_SUBSCRIBER_KEEP_SUBSCRIPTION
} from '../../OnboardingView/OnboardingConstants';
import { SEARCH_GHOSTERY } from '../Step3_ChooseDefaultSearchView/ChooseDefaultSearchConstants';

const glowFreeTrialLink = `${globals.GLOWSTERY_BASE_URL}/account?utm_source=dawn&utm_medium=introhub&utm_campaign=onboarding`;
const plusCheckoutLink = `${globals.CHECKOUT_BASE_URL}/plus?utm_source=dawn&utm_medium=introhub&utm_campaign=onboarding`;
const premiumCheckoutLink = `${globals.CHECKOUT_BASE_URL}/premium?utm_source=dawn&utm_medium=introhub&utm_campaign=onboarding`;

const searchPromo = () => (
	<div className="ChoosePlanView__searchPromoContainer">
		<div className="ChoosePlanView__searchLogo" />
		<div className="ChoosePlanView__adFree">{ t('ghostery_dawn_onboarding_ad_free_with_ghostery_plus_subscription') }</div>
		<div className="ChoosePlanView__adFreePromo">
			{ `(${t('ghostery_dawn_onboarding_ad_free_promo')})` }
		</div>
		<div className="ChoosePlanView__adFreePromoDescription">{ t('ghostery_dawn_onboarding_ad_free_promo_description') }</div>
	</div>
);

const cardSubCopy = copy => (
	<div className="ChoosePlanView__cardSubCopy">
		<span className="check blue" />
		{copy}
	</div>
);

const basicCard = (checked, handleClick) => {
	const cardClassNames = ClassNames('ChoosePlanView__card basic', {
		checked
	});
	return (
		<div className="ChoosePlanView__cardOuter">
			<div className={cardClassNames} onClick={handleClick} data-equalizer-watch>
				<div className="ChoosePlanView__radioButtonContainer">
					<RadioButton checked={checked} handleClick={handleClick} altDesign />
				</div>
				<div className="card-header-background-free" />
				<div className="ghostery-free-image-container">
					<div className="ghostery-free-image text-center" title="Ghostery Free" alt="Ghostery Free" />
				</div>
				<h2>Ghostery</h2>
				<div className="ChoosePlanView__price">
					<p className="ChoosePlanView__price-blue-alt font-size-36">{t('hub_upgrade_plan_free')}</p>
				</div>
				<p className="card-sub-header"><strong>{t('hub_upgrade_basic_protection')}</strong></p>
				<div className="ChoosePlanView__valuePropList basic">
					{cardSubCopy(t('ghostery_dawn_onboarding_private_search'))}
					{cardSubCopy(t('ghostery_dawn_onboarding_tracker_protection'))}
					{cardSubCopy(t('ghostery_dawn_onboarding_speedy_page_loads'))}
					{cardSubCopy(t('ghostery_dawn_onboarding_intelligence_technology'))}
				</div>
			</div>
		</div>
	);
};

class ChoosePlanView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedPlan: '',
			expanded: false,
			readyToRender: false, // after the component mounts, we need to setDefaultPlan()
		};
	}

	componentDidMount() {
		this.setDefaultPlan();
	}

	isBasicUser = () => {
		const { user } = this.props;

		return (!user || (user && !user.plusAccess && !user.premiumAccess));
	}

	isPlusUser = () => {
		const { user } = this.props;

		return (user && user.plusAccess && !user.premiumAccess) || false;
	}

	isPremiumUser = () => {
		const { user } = this.props;

		return (user && user.premiumAccess) || false;
	}

	isBasicPlanChecked = () => {
		const { selectedPlan } = this.state;
		return (selectedPlan === BASIC);
	};

	isPlusPlanChecked = () => {
		const { selectedPlan } = this.state;
		return (selectedPlan === PLUS);
	};

	isPremiumPlanChecked = () => {
		const { selectedPlan } = this.state;
		return (selectedPlan === PREMIUM);
	};

	setDefaultPlan = () => {
		const { defaultSearch } = this.props;

		const isBasic = this.isBasicUser();
		const isPlus = this.isPlusUser();
		const isPremium = this.isPremiumUser();
		const basicGlow = isBasic && defaultSearch === SEARCH_GHOSTERY;

		if (isPremium) {
			this.selectPremiumPlan();
		} else if (isPlus || basicGlow) {
			this.selectPlusPlan();
		} else {
			this.selectBasicPlan();
		}

		this.setState({
			expanded: basicGlow,
			readyToRender: true,
		});
	}

	selectBasicPlan = () => this.setState({ selectedPlan: BASIC });

	selectPlusPlan = () => this.setState({ selectedPlan: PLUS });

	selectPremiumPlan = () => this.setState({ selectedPlan: PREMIUM });

	toggleSection = () => {
		const { expanded } = this.state;
		if (expanded) {
			this.setState({ expanded: !expanded });
		} else {
			this.setState({ expanded: !expanded });
		}
	};

	renderTitleText = () => {
		if (this.isPremiumUser()) return t('ghostery_dawn_onboarding_already_premium_subscriber');
		if (this.isPlusUser()) return t('ghostery_dawn_onboarding_already_plus_subscriber');
		return t('ghostery_dawn_onboarding_your_privacy_plan');
	};

	renderSubtitleText = (selectedGhosteryGlow) => {
		// Note that the order matters!
		if (this.isPremiumUser()) return '';
		if (this.isPlusUser()) return t('ghostery_dawn_onboarding_keep_your_current_plan_or_upgrade');
		if (selectedGhosteryGlow) return t('ghostery_dawn_onboarding_based_on_your_privacy_preferences');
		return t('ghostery_dawn_onboarding_choose_an_option');
	};

	setSetupStepAndMoveToSuccessView = (dawn_setup_number) => {
		const { actions, history } = this.props;
		const { setSetupStep } = actions;
		setSetupStep({ setup_step: CHOOSE_PLAN, dawn_setup_number, origin: ONBOARDING });
		history.push('/onboarding/5');
	}

	plusCard = (checked, handleClick, showCTAButton = false) => {
		const { actions } = this.props;
		const { setSetupStep } = actions;
		const cardClassNames = ClassNames('ChoosePlanView__card plus', {
			checked
		});
		return (
			<Fragment>
				<div className="ChoosePlanView__cardOuter">
					<div className={cardClassNames} onClick={handleClick} data-equalizer-watch>
						<div className="ChoosePlanView__radioButtonContainer">
							<RadioButton checked={checked} handleClick={handleClick} altDesign />
						</div>
						<div className="ghostery-plus-image-container">
							<div className="ghostery-plus-image" title="Ghostery Plus" alt="Ghostery Plus" />
						</div>
						<h2>Ghostery Plus</h2>
						<div className="ChoosePlanView__price">
							<Fragment>
								<p className="ChoosePlanView__price-gold font-size-36">$4.99</p>
								<p className="ChoosePlanView__price-gold sub-text font-size-12">{t('per_month')}</p>
							</Fragment>
						</div>
						<p className="card-sub-header"><strong>{t('hub_upgrade_additional_protection')}</strong></p>
						<div className="ChoosePlanView__valuePropList">
							{cardSubCopy(t('ghostery_dawn_onboarding_private_search'))}
							{cardSubCopy(t('ghostery_dawn_onboarding_tracker_protection'))}
							{cardSubCopy(t('ghostery_dawn_onboarding_speedy_page_loads'))}
							{cardSubCopy(t('ghostery_dawn_onboarding_intelligence_technology'))}
							{cardSubCopy(t('ghostery_dawn_onboarding_ad_free'))}
							{cardSubCopy(t('ghostery_dawn_onboarding_supports_ghosterys_mission'))}
						</div>
					</div>
				</div>
				{showCTAButton && (
					<div className="ChoosePlanView__searchCTAButtonContainer">
						<NavLink className="ChoosePlanView__searchCTAButton" to="/onboarding/5" onClick={() => setSetupStep({ setup_step: CHOOSE_PLAN, dawn_setup_number: PLUS_SUBSCRIBER_KEEP_SUBSCRIPTION, origin: ONBOARDING })}>
							<span>{t('ghostery_dawn_onboarding_keep')}</span>
						</NavLink>
					</div>
				)}
			</Fragment>
		);
	};

	premiumCard = (checked, handleClick, showCTAButton = false) => {
		const cardClassNames = ClassNames('ChoosePlanView__card premium', {
			checked
		});
		return (
			<Fragment>
				<div className="ChoosePlanView__cardOuter">
					<div className={cardClassNames} onClick={handleClick} data-equalizer-watch>
						<div className="ChoosePlanView__radioButtonContainer">
							<RadioButton checked={checked} handleClick={handleClick} altDesign />
						</div>
						<div className="ghostery-premium-image-container">
							<div className="ghostery-premium-image card-image-top" title="Ghostery Premium" alt="Ghostery Premium" />
						</div>
						<div className="ghostery-premium-image-background" />
						<h2>Ghostery Premium</h2>
						<div className="ChoosePlanView__price">
							<Fragment>
								<p className="ChoosePlanView__price-purple font-size-36">$11.99</p>
								<p className="ChoosePlanView__price-purple sub-text font-size-12">{t('per_month')}</p>
							</Fragment>
						</div>
						<p className="card-sub-header"><strong>{t('hub_upgrade_maximum_protection')}</strong></p>
						<div className="ChoosePlanView__valuePropList">
							{cardSubCopy(t('ghostery_dawn_onboarding_private_search'))}
							{cardSubCopy(t('ghostery_dawn_onboarding_tracker_protection'))}
							{cardSubCopy(t('ghostery_dawn_onboarding_speedy_page_loads'))}
							{cardSubCopy(t('ghostery_dawn_onboarding_intelligence_technology'))}
							{cardSubCopy(t('ghostery_dawn_onboarding_ad_free'))}
							{cardSubCopy(t('ghostery_dawn_onboarding_supports_ghosterys_mission'))}
							{cardSubCopy('VPN')}
							{cardSubCopy(t('ghostery_dawn_onboarding_unlimited_bandwidth'))}
						</div>
					</div>
				</div>
				{showCTAButton && (
					<div className="ChoosePlanView__searchCTAButtonContainer">
						<a className="ChoosePlanView__premiumCTAButton" href={premiumCheckoutLink} target="_blank" rel="noreferrer" onClick={() => this.setSetupStepAndMoveToSuccessView(PLUS_SUBSCRIBER_PREMIUM_SUBSCRIPTION)}>{t('ghostery_dawn_onboarding_upgrade')}</a>
					</div>
				)}
			</Fragment>
		);
	};

	render() {
		const { readyToRender } = this.state;
		if (!readyToRender) return null;

		const {
			actions,
			defaultSearch,
		} = this.props;
		const { setSetupStep } = actions;
		const { expanded, selectedPlan } = this.state;

		const isBasic = this.isBasicUser();
		const isPlus = this.isPlusUser();
		const isPremium = this.isPremiumUser();

		const arrowClassNames = ClassNames('ChoosePlanView__arrow', {
			up: !expanded,
			down: expanded
		});

		const selectedGhosteryGlow = (defaultSearch === SEARCH_GHOSTERY);

		return (
			<Fragment>
				<div className="ChoosePlanView__relativeContainer">
					<div className="ChoosePlanView__backContainer">
						<span className="ChoosePlanView__caret left" />
						<NavLink to="/onboarding/3">
							<span className="ChoosePlanView__back">{t('ghostery_dawn_onboarding_back')}</span>
						</NavLink>
					</div>
				</div>
				<div className="ChoosePlanView">
					<div className="ChoosePlanView__yourPrivacyPlan">{this.renderTitleText()}</div>
					<div className="ChoosePlanView__subtitle">{this.renderSubtitleText(selectedGhosteryGlow)}</div>
					{selectedGhosteryGlow && isBasic && (
						<Fragment>
							{searchPromo()}
							<div className="ChoosePlanView__searchCTAButtonContainer">
								<a className="ChoosePlanView__searchCTAButton" href={glowFreeTrialLink} target="_blank" rel="noreferrer" onClick={() => this.setSetupStepAndMoveToSuccessView(FREE_USER_PLUS_TRIAL)}>{t('ghostery_dawn_onboarding_start_trial')}</a>
							</div>
							<div className="ChoosePlanView__seeAllPlans" onClick={this.toggleSection}>{t('ghostery_dawn_onboarding_see_all_plans')}</div>
							<div className={arrowClassNames} onClick={this.toggleSection} />
						</Fragment>
					)}
					{((isBasic && !selectedGhosteryGlow) || expanded || isPlus || isPremium) && (
						<div>
							{(isPlus) ? (
								<div className="ChoosePlanView__keepOrUpgradeContainer row align-center align-middle">
									<div className="small-12 medium-12 large-4">
										{this.plusCard(this.isPlusPlanChecked(), this.selectPlusPlan, isPlus)}
									</div>
									<div className="ChoosePlanView__or small-12 large-2">{t('ghostery_dawn_onboarding_or')}</div>
									<div className="small-12 medium-12 large-4">
										{this.premiumCard(this.isPremiumPlanChecked(), this.selectPremiumPlan, isPlus)}
									</div>
								</div>
							) : (
								<div className="ChoosePlanView__plansContainer row align-spaced">
									{isBasic && (
										basicCard(this.isBasicPlanChecked(), this.selectBasicPlan)
									)}
									{!isPremium && (
										<Fragment>
											{this.plusCard(this.isPlusPlanChecked(), this.selectPlusPlan)}
										</Fragment>
									)}
									{this.premiumCard(this.isPremiumPlanChecked(), this.selectPremiumPlan)}
								</div>
							)}
							{(isBasic && (
								<div className="ChoosePlanView__ctaButtonContainer">
									{(selectedPlan === BASIC) && (
										<NavLink className="ChoosePlanView__searchCTAButton" to="/onboarding/5" onClick={() => setSetupStep({ setup_step: CHOOSE_PLAN, dawn_setup_number: FREE_USER_NO_TRIAL, origin: ONBOARDING })}>
											<span>{t('next')}</span>
										</NavLink>
									)}
									{selectedPlan === PLUS && (
										<a className="ChoosePlanView__searchCTAButton" onClick={() => this.setSetupStepAndMoveToSuccessView(FREE_USER_PLUS_SUBSCRIPTION)} href={plusCheckoutLink} target="_blank" rel="noreferrer">{t('next')}</a>
									)}
									{selectedPlan === PREMIUM && (
										<a className="ChoosePlanView__searchCTAButton" onClick={() => this.setSetupStepAndMoveToSuccessView(FREE_USER_PREMIUM_SUBSCRIPTION)} href={premiumCheckoutLink} target="_blank" rel="noreferrer">{t('next')}</a>
									)}
								</div>
							))}
							{isPremium && (
								<div className="ChoosePlanView__searchCTAButtonContainer">
									<NavLink className="ChoosePlanView__searchCTAButton" to="/onboarding/5" onClick={() => setSetupStep({ setup_step: CHOOSE_PLAN, dawn_setup_number: PREMIUM_SUBSCRIBER_KEEP_SUBSCRIPTION, origin: ONBOARDING })}>
										<span>{t('next')}</span>
									</NavLink>
								</div>
							)}
						</div>
					)}
				</div>
			</Fragment>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
ChoosePlanView.propTypes = {
	user: PropTypes.shape({
		plusAccess: PropTypes.bool,
		premiumAccess: PropTypes.bool,
	}),
	defaultSearch: PropTypes.string.isRequired,
};

// Default props used in the Plus View
ChoosePlanView.defaultProps = {
	user: {
		plusAccess: false,
		premiumAccess: false,
	},
};

export default ChoosePlanView;
