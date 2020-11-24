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

const searchPromo = () => (
	<div className="PlanView__searchPromoContainer">
		<div className="PlanView__searchLogo" />
		<div className="PlanView__adFree">{ t('hub_plan_view_ad_free') }</div>
		<div className="PlanView__adFreePromo">{ t('hub_plan_view_ad_free_promo') }</div>
		<div className="PlanView__adFreePromoDescription">{ t('hub_plan_view_ad_free_promo_description') }</div>
	</div>
);

const basicCard = () => (
	<div className="card-outer">
		<div className="card basic" data-equalizer-watch>
			<div className="card-header-background-free" />
			<div className="ghostery-free-image-container">
				<div className="ghostery-free-image text-center" title="Ghostery Free" alt="Ghostery Free" />
			</div>
			<h2>Ghostery</h2>
			<div className="price">
				<p className="price-blue-alt font-size-36">{t('hub_upgrade_plan_free')}</p>
			</div>
			<NavLink className="button primary already-protected" to="/home" title="Already Protected">
				{t('hub_upgrade_already_protected')}
			</NavLink>
			<p className="card-sub-header"><strong>{t('hub_upgrade_basic_protection')}</strong></p>
			<p className="card-sub-copy">
				<span className="check blue" />
				{t('hub_upgrade_basic_browser_protection')}
			</p>
		</div>
	</div>
);

const plusCard = mobileView => (
	<div className="card-outer">
		<div className="card plus" data-equalizer-watch>
			<div className="ghostery-plus-image-container">
				<div className="ghostery-plus-image" title="Ghostery Plus" alt="Ghostery Plus" />
			</div>
			<h2>Ghostery Plus</h2>
			<div className="price">
				<Fragment>
					<p className="price-gold font-size-36">$4.99</p>
					<p className="price-gold sub-text font-size-12">{t('per_month')}</p>
				</Fragment>
			</div>
			{/* {plusButtonTop()} */}
			<p className="card-sub-header"><strong>{t('hub_upgrade_additional_protection')}</strong></p>
			<p className="card-sub-copy">
				<span className="check blue" />
				{t('hub_upgrade_basic_browser_protection')}
			</p>
			<p className="card-sub-copy">
				<span className="check blue" />
				{t('hub_upgrade_advanced_device_protection')}
			</p>
		</div>
	</div>
);

const premiumCard = mobileView => (
	<div className="card-outer card-outer-remove">
		<div className="card premium" data-equalizer-watch>
			<div className="ghostery-premium-image-container">
				<div className="ghostery-premium-image card-image-top" title="Ghostery Premium" alt="Ghostery Premium" />
			</div>
			<div className="ghostery-premium-image-background" />
			<h2>Ghostery Premium</h2>
			<div className="price">
				<Fragment>
					<p className="price-purple sub-text font-size-36">$11.99</p>
					<p className="price-purple sub-text font-size-12">{t('per_month')}</p>
				</Fragment>
			</div>
			{/* {premiumButtonTop()} */}
			<p className="card-sub-header">
				<strong>{t('hub_upgrade_maximum_browser_protection')}</strong>
			</p>
			<p className="card-sub-copy">
				<span className="check blue" />
				{t('hub_upgrade_basic_browser_protection')}
			</p>
			<p className="card-sub-copy">
				<span className="check blue" />
				{t('hub_upgrade_advanced_device_protection')}
			</p>
			<p className="card-sub-copy">
				<span className="check blue" />
				VPN
			</p>
		</div>
	</div>
);

const PlanView = () => {
	// Clicking arrow scrolls to Plans
	const plansRef = useRef(null);
	const scrollToPlans = () => {
		plansRef.current.scrollIntoView({ behavior: 'smooth' });
	};
	return (
		<div>
			<div className="PlanView__yourPrivacyPlan">{ t('hub_plan_view_your_privacy_plan') }</div>
			<div className="PlanView__subtitle">{ t('hub_plan_view_based_on_your_privacy_preferences') }</div>
			{searchPromo()}
			<div className="PlanView__searchCTAButton">Start Trial</div>
			<div className="PlanView__seeAllPlans" onClick={scrollToPlans}>{t('hub_plan_view_see_all_plans')}</div>
			<div className="PlanView__arrowDown" onClick={scrollToPlans} />
			<div className="PlanView__plansContainer" ref={plansRef}>
				{basicCard()}
				{plusCard()}
				{premiumCard()}
			</div>
		</div>
	);
};

// PropTypes ensure we pass required props of the correct type
PlanView.propTypes = {};

// Default props used on the Home View
PlanView.defaultProps = {};

export default PlanView;
