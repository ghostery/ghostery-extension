/**
 * Plan View Component
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

import React, { Fragment } from 'react';
import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import RadioButton from '../../../panel/components/BuildingBlocks/RadioButton';
import globals from '../../../../src/classes/Globals';

const BASIC = 0;
const PLUS = 1;
const PREMIUM = 2;

const plusCheckoutLink = `${globals.CHECKOUT_BASE_URL}/plus`;
const premiumCheckoutLink = `${globals.CHECKOUT_BASE_URL}/premium`;

const searchPromo = () => (
	<div className="PlanView__searchPromoContainer">
		<div className="PlanView__searchLogo" />
		<div className="PlanView__adFree">{ t('hub_plan_ad_free_with_ghostery_plus_subscription') }</div>
		<div className="PlanView__adFreePromo">{ t('hub_plan_ad_free_promo') }</div>
		<div className="PlanView__adFreePromoDescription">{ t('hub_plan_ad_free_promo_description') }</div>
	</div>
);

const basicCard = (checked, handleClick) => {
	const cardClassNames = ClassNames('PlanView__card basic', {
		checked
	});
	return (
		<div className="PlanView__cardOuter">
			<div className={cardClassNames} onClick={handleClick} data-equalizer-watch>
				<div className="PlanView__radioButtonContainer">
					<RadioButton checked={checked} handleClick={handleClick} altDesign />
				</div>
				<div className="card-header-background-free" />
				<div className="ghostery-free-image-container">
					<div className="ghostery-free-image text-center" title="Ghostery Free" alt="Ghostery Free" />
				</div>
				<h2>Ghostery</h2>
				<div className="PlanView__price">
					<p className="PlanView__price-blue-alt font-size-36">{t('hub_upgrade_plan_free')}</p>
				</div>
				<p className="card-sub-header"><strong>{t('hub_upgrade_basic_protection')}</strong></p>
				<div className="PlanView__valuePropList basic">
					<div className="PlanView__cardSubCopy">
						<span className="check blue" />
						{t('hub_plan_private_search')}
					</div>
					<div className="PlanView__cardSubCopy">
						<span className="check blue" />
						{t('hub_plan_tracker_protection')}
					</div>
					<div className="PlanView__cardSubCopy">
						<span className="check blue" />
						{t('hub_plan_speedy_page_loads')}
					</div>
					<div className="PlanView__cardSubCopy">
						<span className="check blue" />
						{t('hub_plan_intelligence_technology')}
					</div>
				</div>
			</div>
		</div>
	);
};

const plusCard = (checked, handleClick, showCTAButton = false) => {
	const cardClassNames = ClassNames('PlanView__card plus', {
		checked
	});
	return (
		<Fragment>
			<div className="PlanView__cardOuter">
				<div className={cardClassNames} onClick={handleClick} data-equalizer-watch>
					<div className="PlanView__radioButtonContainer">
						<RadioButton checked={checked} handleClick={handleClick} altDesign />
					</div>
					<div className="ghostery-plus-image-container">
						<div className="ghostery-plus-image" title="Ghostery Plus" alt="Ghostery Plus" />
					</div>
					<h2>Ghostery Plus</h2>
					<div className="PlanView__price">
						<Fragment>
							<p className="PlanView__price-gold font-size-36">$4.99</p>
							<p className="PlanView__price-gold sub-text font-size-12">{t('per_month')}</p>
						</Fragment>
					</div>
					<p className="card-sub-header"><strong>{t('hub_upgrade_additional_protection')}</strong></p>
					<div className="PlanView__valuePropList">
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							{t('hub_plan_private_search')}
						</div>
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							{t('hub_plan_tracker_protection')}
						</div>
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							{t('hub_plan_speedy_page_loads')}
						</div>
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							{t('hub_plan_intelligence_technology')}
						</div>
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							{t('hub_plan_ad_free')}
						</div>
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							{t('hub_plan_supports_ghosterys_mission')}
						</div>
					</div>
				</div>
			</div>
			{showCTAButton && (
				// Route to next screen
				<button className="PlanView__searchCTAButton" type="button">{t('hub_plan_keep')}</button>
			)}
		</Fragment>
	);
};

const premiumCard = (checked, handleClick, showCTAButton = false) => {
	const cardClassNames = ClassNames('PlanView__card premium', {
		checked
	});
	return (
		<Fragment>
			<div className="PlanView__cardOuter">
				<div className={cardClassNames} onClick={handleClick} data-equalizer-watch>
					<div className="PlanView__radioButtonContainer">
						<RadioButton checked={checked} handleClick={handleClick} altDesign />
					</div>
					<div className="ghostery-premium-image-container">
						<div className="ghostery-premium-image card-image-top" title="Ghostery Premium" alt="Ghostery Premium" />
					</div>
					<div className="ghostery-premium-image-background" />
					<h2>Ghostery Premium</h2>
					<div className="PlanView__price">
						<Fragment>
							<p className="PlanView__price-purple sub-text font-size-36">$11.99</p>
							<p className="PlanView__price-purple sub-text font-size-12">{t('per_month')}</p>
						</Fragment>
					</div>
					<p className="card-sub-header"><strong>{t('hub_upgrade_maximum_protection')}</strong></p>
					<div className="PlanView__valuePropList">
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							{t('hub_plan_private_search')}
						</div>
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							{t('hub_plan_tracker_protection')}
						</div>
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							{t('hub_plan_speedy_page_loads')}
						</div>
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							{t('hub_plan_intelligence_technology')}
						</div>
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							{t('hub_plan_ad_free')}
						</div>
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							{t('hub_plan_supports_ghosterys_mission')}
						</div>
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							VPN
						</div>
						<div className="PlanView__cardSubCopy">
							<span className="check blue" />
							{t('hub_plan_unlimited_bandwidth')}
						</div>
					</div>
				</div>
			</div>
			{showCTAButton && (
				<a className="PlanView__premiumCTAButton" href={premiumCheckoutLink} target="_blank" rel="noreferrer">{t('hub_plan_upgrade')}</a>
			)}
		</Fragment>
	);
};

class PlanView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedPlan: -1,
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

		if (isPremium) return t('hub_plan_already_premium_subscriber');
		if (isPlus) return t('hub_plan_already_plus_subscriber');
		return t('hub_plan_your_privacy_plan');
	};

	renderSubtitleText = (fromSearchSelectionScreen) => {
		const { user } = this.props;
		const isPlus = (user && user.plusAccess) || false;
		const isPremium = (user && user.premiumAccess) || false;

		if (fromSearchSelectionScreen) return t('hub_plan_based_on_your_privacy_preferences');
		if (isPremium) return '';
		if (isPlus) return t('hub_plan_keep_your_current_plan_or_upgrade');
		return t('hub_plan_choose_an_option');
	};

	render() {
		// shouldShowSearchPromo should be true if the user did not select ghostery search in the previosu step
		const { user, shouldShowSearchPromo } = this.props;
		const { expanded, selectedPlan } = this.state;

		const isBasic = !user;
		const isPlus = (user && user.plusAccess && !user.premiumAccess) || false;
		const isPremium = (user && user.premiumAccess) || false;
		const isBasicOrPremium = isBasic || isPremium;

		const arrowClassNames = ClassNames('PlanView__arrow', {
			up: !expanded,
			down: expanded
		});

		return (
			<div className="PlanView">
				<div className="PlanView__yourPrivacyPlan">{this.renderTitleText()}</div>
				<div className="PlanView__subtitle">{this.renderSubtitleText(shouldShowSearchPromo)}</div>
				{shouldShowSearchPromo && isBasic && (
					<Fragment>
						{searchPromo()}
						<a className="PlanView__searchCTAButton" href={`${globals.CHECKOUT_BASE_URL}/plus`} target="_blank" rel="noreferrer">{t('hub_plan_start_trial')}</a>
						<div className="PlanView__seeAllPlans" onClick={this.toggleSection}>{t('hub_plan_see_all_plans')}</div>
						<div className={arrowClassNames} onClick={this.toggleSection} />
					</Fragment>
				)}
				{((isBasic && !shouldShowSearchPromo) || expanded || isPlus || isPremium) && (
					<div>
						{(isPlus) ? (
							<div className="PlanView__keepOrUpgradeContainer row align-center align-middle">
								<div className="small-12 medium-12 large-4">
									{plusCard(this.isPlusPlanChecked(), this.selectPlusPlan, isPlus)}
								</div>
								<div className="PlanView__or small-12 large-2">{t('hub_plan_or')}</div>
								<div className="small-12 medium-12 large-4">
									{premiumCard(this.isPremiumPlanChecked(), this.selectPremiumPlan, isPlus)}
								</div>
							</div>
						) : (
							<div className="PlanView__plansContainer row align-spaced">
								{isBasic && (
									basicCard(this.isBasicPlanChecked(), this.selectBasicPlan)
								)}
								{!isPremium && (
									<Fragment>
										{plusCard(this.isPlusPlanChecked(), this.selectPlusPlan)}
									</Fragment>
								)}
								{premiumCard(this.isPremiumPlanChecked(), this.selectPremiumPlan)}
							</div>
						)}
						{(isBasic && (
							<div className="PlanView__ctaButtonContainer">
								{(selectedPlan === BASIC) && (
									// Change to route to next page
									<button className="PlanView__searchCTAButton" type="button">{t('next')}</button>
								)}
								{selectedPlan === PLUS && (
									<a className="PlanView__searchCTAButton" href={plusCheckoutLink} target="_blank" rel="noreferrer">{t('next')}</a>
								)}
								{selectedPlan === PREMIUM && (
									<a className="PlanView__premiumCTAButton" href={premiumCheckoutLink} target="_blank" rel="noreferrer">{t('next')}</a>
								)}
							</div>
						))}
						{isPremium && (
							// Change to route to next page
							<button className="PlanView__searchCTAButton" type="button">{t('next')}</button>
						)}
					</div>
				)}
			</div>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
PlanView.propTypes = {
	user: PropTypes.shape({
		plusAccess: PropTypes.bool,
		premiumAccess: PropTypes.bool,
	}),
	shouldShowSearchPromo: PropTypes.bool.isRequired,
};

// Default props used in the Plus View
PlanView.defaultProps = {
	user: {
		plusAccess: false,
		premiumAccess: false,
	},
};

export default PlanView;
