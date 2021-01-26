/**
 * Ghostery Browser Hub Choose Plan View Component
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
import { CHOOSE_PLAN, ONBOARDING } from '../../OnboardingView/OnboardingConstants';
import { SEARCH_GHOSTERY } from '../Step3_ChooseDefaultSearchView/ChooseDefaultSearchConstants';

const plusCheckoutLink = `${globals.CHECKOUT_BASE_URL}/en/plus`;
const premiumCheckoutLink = `${globals.CHECKOUT_BASE_URL}/en/premium`;

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
					<div className="ChoosePlanView__cardSubCopy">
						<span className="check blue" />
						{t('ghostery_dawn_onboarding_private_search')}
					</div>
					<div className="ChoosePlanView__cardSubCopy">
						<span className="check blue" />
						{t('ghostery_dawn_onboarding_tracker_protection')}
					</div>
					<div className="ChoosePlanView__cardSubCopy">
						<span className="check blue" />
						{t('ghostery_dawn_onboarding_speedy_page_loads')}
					</div>
					<div className="ChoosePlanView__cardSubCopy">
						<span className="check blue" />
						{t('ghostery_dawn_onboarding_intelligence_technology')}
					</div>
				</div>
			</div>
		</div>
	);
};

const premiumCard = (checked, handleClick, showCTAButton = false) => {
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
						<div className="ChoosePlanView__cardSubCopy">
							<span className="check blue" />
							{t('ghostery_dawn_onboarding_private_search')}
						</div>
						<div className="ChoosePlanView__cardSubCopy">
							<span className="check blue" />
							{t('ghostery_dawn_onboarding_tracker_protection')}
						</div>
						<div className="ChoosePlanView__cardSubCopy">
							<span className="check blue" />
							{t('ghostery_dawn_onboarding_speedy_page_loads')}
						</div>
						<div className="ChoosePlanView__cardSubCopy">
							<span className="check blue" />
							{t('ghostery_dawn_onboarding_intelligence_technology')}
						</div>
						<div className="ChoosePlanView__cardSubCopy">
							<span className="check blue" />
							{t('ghostery_dawn_onboarding_ad_free')}
						</div>
						<div className="ChoosePlanView__cardSubCopy">
							<span className="check blue" />
							{t('ghostery_dawn_onboarding_supports_ghosterys_mission')}
						</div>
						<div className="ChoosePlanView__cardSubCopy">
							<span className="check blue" />
							VPN
						</div>
						<div className="ChoosePlanView__cardSubCopy">
							<span className="check blue" />
							{t('ghostery_dawn_onboarding_unlimited_bandwidth')}
						</div>
					</div>
				</div>
			</div>
			{showCTAButton && (
				<a className="ChoosePlanView__premiumCTAButton" href={premiumCheckoutLink} target="_blank" rel="noreferrer">{t('ghostery_dawn_onboarding_upgrade')}</a>
			)}
		</Fragment>
	);
};

class ChoosePlanView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedPlan: '',
			expanded: false
		};
		// User object doesn't get populated immediately, let's delay the first render
		setTimeout(this.setDefaultPlan, 200);
	}

	setDefaultPlan = () => {
		const { user } = this.props;
		const isPlus = (user && user.plusAccess) || false;
		const isPremium = (user && user.premiumAccess) || false;

		if (isPremium) {
			this.selectPremiumPlan();
			return;
		}
		if (isPlus) {
			this.selectPlusPlan();
			return;
		}
		this.selectBasicPlan();
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
		const { user } = this.props;
		const isPlus = (user && user.plusAccess) || false;
		const isPremium = (user && user.premiumAccess) || false;

		if (isPremium) return t('ghostery_dawn_onboarding_already_premium_subscriber');
		if (isPlus) return t('ghostery_dawn_onboarding_already_plus_subscriber');
		return t('ghostery_dawn_onboarding_your_privacy_plan');
	};

	renderSubtitleText = (selectedGhosteryGlow) => {
		const { user } = this.props;
		const isPlus = (user && user.plusAccess) || false;
		const isPremium = (user && user.premiumAccess) || false;

		if (selectedGhosteryGlow) return t('ghostery_dawn_onboarding_based_on_your_privacy_preferences');
		if (isPremium) return '';
		if (isPlus) return t('ghostery_dawn_onboarding_keep_your_current_plan_or_upgrade');
		return t('ghostery_dawn_onboarding_choose_an_option');
	};

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
							<div className="ChoosePlanView__cardSubCopy">
								<span className="check blue" />
								{t('ghostery_dawn_onboarding_private_search')}
							</div>
							<div className="ChoosePlanView__cardSubCopy">
								<span className="check blue" />
								{t('ghostery_dawn_onboarding_tracker_protection')}
							</div>
							<div className="ChoosePlanView__cardSubCopy">
								<span className="check blue" />
								{t('ghostery_dawn_onboarding_speedy_page_loads')}
							</div>
							<div className="ChoosePlanView__cardSubCopy">
								<span className="check blue" />
								{t('ghostery_dawn_onboarding_intelligence_technology')}
							</div>
							<div className="ChoosePlanView__cardSubCopy">
								<span className="check blue" />
								{t('ghostery_dawn_onboarding_ad_free')}
							</div>
							<div className="ChoosePlanView__cardSubCopy">
								<span className="check blue" />
								{t('ghostery_dawn_onboarding_supports_ghosterys_mission')}
							</div>
						</div>
					</div>
				</div>
				{showCTAButton && (
					<NavLink className="ChoosePlanView__searchCTAButton" to="/onboarding/5" onClick={() => setSetupStep({ setup_step: CHOOSE_PLAN, origin: ONBOARDING })}>
						<span>{t('ghostery_dawn_onboarding_keep')}</span>
					</NavLink>
				)}
			</Fragment>
		);
	};

	render() {
		const {
			actions,
			defaultSearch,
			loggedIn,
			next,
			user,
		} = this.props;
		const { setSetupStep } = actions;
		const { expanded, selectedPlan } = this.state;

		const isBasic = !user || (user && !user.plusAccess && !user.premiumAccess);
		const isPlus = (user && user.plusAccess && !user.premiumAccess) || false;
		const isPremium = (user && user.premiumAccess) || false;

		const arrowClassNames = ClassNames('ChoosePlanView__arrow', {
			up: !expanded,
			down: expanded
		});

		const selectedGhosteryGlow = (defaultSearch === SEARCH_GHOSTERY);

		return (
			<div>
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
							{/* TODO: For the CTA button below,
								1. WIP - what 7-day trial? If user is signed in, activate the user’s 7-day free trial for the Ghostery Search Plus plan
									and move them to Step 5 if signed in
								2. DONE If user is signed out, clicking this should take them to Step 4b
							*/}
							{loggedIn && (
								<a className="ChoosePlanView__searchCTAButton" href={plusCheckoutLink} target="_blank" rel="noreferrer">{t('ghostery_dawn_onboarding_start_trial')}</a>
							)}
							{!loggedIn && (
								<div className="ChoosePlanView__searchCTAButton" onClick={() => next()}>{t('ghostery_dawn_onboarding_start_trial')}</div>
							)}
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
										{premiumCard(this.isPremiumPlanChecked(), this.selectPremiumPlan, isPlus)}
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
									{premiumCard(this.isPremiumPlanChecked(), this.selectPremiumPlan)}
								</div>
							)}
							{(isBasic && (
								<div className="ChoosePlanView__ctaButtonContainer">
									{(selectedPlan === BASIC) && (
										<NavLink className="ChoosePlanView__searchCTAButton" to="/onboarding/5" onClick={() => setSetupStep({ setup_step: CHOOSE_PLAN, origin: ONBOARDING })}>
											<span>{t('next_or_start_trial')}</span>
										</NavLink>
									)}
									{selectedPlan === PLUS && (
										<a className="ChoosePlanView__searchCTAButton" href={plusCheckoutLink} target="_blank" rel="noreferrer">{t('next_or_start_trial')}</a>
									)}
									{selectedPlan === PREMIUM && (
										<a className="ChoosePlanView__searchCTAButton" href={premiumCheckoutLink} target="_blank" rel="noreferrer">{t('next_or_start_trial')}</a>
									)}
								</div>
							))}
							{isPremium && (
								<NavLink className="ChoosePlanView__searchCTAButton" to="/onboarding/5" onClick={() => setSetupStep({ setup_step: CHOOSE_PLAN, origin: ONBOARDING })}>
									<span>{t('next')}</span>
								</NavLink>
							)}
						</div>
					)}
				</div>
			</div>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
ChoosePlanView.propTypes = {
	user: PropTypes.shape({
		plusAccess: PropTypes.bool,
		premiumAccess: PropTypes.bool,
	}),
	defaultSearch: PropTypes.bool.isRequired,
};

// Default props used in the Plus View
ChoosePlanView.defaultProps = {
	user: {
		plusAccess: false,
		premiumAccess: false,
	},
};

export default ChoosePlanView;
