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

import React, { Fragment, useRef, useEffect } from 'react';
import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import QueryString from 'query-string';
import globals from '../../../../src/classes/Globals';
import RadioButton from '../../../panel/components/BuildingBlocks/RadioButton';

const BASIC = 0;
const PLUS = 1;
const PREMIUM = 2;

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
			<div className={cardClassNames} onClick={handleClick} cdata-equalizer-watch>
				<div className="PlanView__radioButtonContainer">
					<RadioButton checked={checked} handleClick={handleClick} />
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
						{t('hub_plan_private_search')}
					</div>
					<div className="PlanView__cardSubCopy">
						{t('hub_plan_tracker_protection')}
					</div>
					<div className="PlanView__cardSubCopy">
						{t('hub_plan_speedy_page_loads')}
					</div>
					<div className="PlanView__cardSubCopy">
						{t('hub_plan_intelligence_technology')}
					</div>
				</div>
			</div>
		</div>
	);
};

const plusCard = (checked, handleClick) => {
	const cardClassNames = ClassNames('PlanView__card plus', {
		checked
	});
	return (
		<div className="PlanView__cardOuter">
			<div className={cardClassNames} onClick={handleClick} data-equalizer-watch>
				<div className="PlanView__radioButtonContainer">
					<RadioButton checked={checked} handleClick={handleClick} />
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
	);
};

const premiumCard = (checked, handleClick) => {
	const cardClassNames = ClassNames('PlanView__card premium', {
		checked
	});
	return (
		<div className="PlanView__cardOuter">
			<div className={cardClassNames} onClick={handleClick} data-equalizer-watch>
				<div className="PlanView__radioButtonContainer">
					<RadioButton checked={checked} handleClick={handleClick} />
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
	);
};

class PlanView extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			selectedPlan: 0
		};
		this.plansRef = React.createRef();
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

	scrollToPlans = () => {
		this.plansRef.current.scrollIntoView({ behavior: 'smooth' });
	};

	render() {
		return (
			<div>
				<div className="PlanView__yourPrivacyPlan">{t('hub_plan_your_privacy_plan')}</div>
				<div className="PlanView__subtitle">{t('hub_plan_based_on_your_privacy_preferences')}</div>
				{searchPromo()}
				<div className="PlanView__searchCTAButton">{t('hub_plan_start_trial')}</div>
				<div className="PlanView__seeAllPlans" onClick={this.scrollToPlans}>{t('hub_plan_see_all_plans')}</div>
				<div className="PlanView__arrowDown" onClick={this.scrollToPlans} />
				<div className="PlanView__plansContainer" ref={this.plansRef}>
					{basicCard(this.isBasicPlanChecked(), this.selectBasicPlan)}
					{plusCard(this.isPlusPlanChecked(), this.selectPlusPlan)}
					{premiumCard(this.isPremiumPlanChecked(), this.selectPremiumPlan)}
				</div>
				<div className="PlanView__searchCTAButton">{t('hub_plan_start_trial')}</div>
			</div>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
PlanView.propTypes = {};

// Default props used on the Home View
PlanView.defaultProps = {};

export default PlanView;
