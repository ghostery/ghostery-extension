/**
 * Upgrade Plan View Component
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
import { BASIC, PLUS } from './UpgradePlanViewConstants';
import globals from '../../../../src/classes/Globals';

const featureMatrixRow = (label, isBasic, isPlus) => (
	<tr>
		<td>
			{label}
		</td>
		<td className="default">
			{isBasic &&
				<span className="check blue" />
			}
		</td>
		<td>
			{isPlus &&
				<span className="check yellow" />
			}
		</td>
	</tr>
);

const mobileFeatureMatrixRow = (label, isBasic, isPlus) => (
	<Fragment>
		<tr>
			<td colSpan="4">
				<span className="feature-title">{label}</span>
			</td>
		</tr>
		<tr className="border-bottom">
			{isBasic ? (
				<td className="col-free" colSpan="2">
					<span className="check blue" />
				</td>
			) : (
				<td colSpan="2">
					<span className="x-icon" />
				</td>
			)}
			{isPlus ? (
				<td className="col-plus" colSpan="2">
					<span className="check yellow" />
				</td>
			) : (
				<td colSpan="2">
					<span className="x-icon" />
				</td>
			)}
		</tr>
	</Fragment>
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

const plusAlreadyProtectedButton = () => (
	<NavLink className="button button-gold" to="/home" title="Already Protected">
		{t('hub_upgrade_already_protected')}
	</NavLink>
);

// Whether we are displaying this Upgrade Plan view in the alternate or the default Hub layout (as per the A/B test in ticket GH-2097)
const ah = (QueryString.parse(window.location.search).ah === 'true') || false;

/**
 * A React function component for rendering the Upgrade Plan View
 * @return {JSX} JSX for rendering the Upgrade Plan View of the Hub app
 * @memberof HubComponents
 */
const UpgradePlanView = (props) => {
	useEffect(() => {
		const title = t('hub_upgrade_page_title');
		window.document.title = title;
	}, []);

	const {
		protection_level,
		show_yearly_prices,
		user,
		actions,
	} = props;

	const {
		toggleMonthlyYearlyPrices,
		setBasicProtection,
		setPlusProtection,
	} = actions;

	const isPlus = (user && user.plusAccess) || false;

	const sliderClassNames = ClassNames('switch-check', {
		checked: show_yearly_prices
	});
	const tabsTitleBlueClassNames = ClassNames('tabs-title tabs-title-blue', {
		'is-active': protection_level === BASIC
	});
	const tabsTitleGoldClassNames = ClassNames('tabs-title tabs-title-gold', {
		'is-active': protection_level === PLUS
	});
	const monthlyToggleLabel = ClassNames('toggle-label', {
		active: !show_yearly_prices
	});
	const yearlyToggleLabel = ClassNames('toggle-label', {
		active: show_yearly_prices
	});

	// Clicking arrow scrolls to table
	const comparisonTableRef = useRef(null);
	const scrollToComparisonTable = () => {
		comparisonTableRef.current.scrollIntoView({ behavior: 'smooth' });
	};
	// Clicking arrow scrolls to table for mobile view
	const mobileComparisonTableRef = useRef(null);
	const scrollToMobileComparisonTable = () => {
		mobileComparisonTableRef.current.scrollIntoView({ behavior: 'smooth' });
	};

	// UTM and Query Params
	// interval is the query param to show monthly/yearly pricing in checkout web
	const interval = show_yearly_prices ? 'year' : 'month';
	const params = `utm_source=gbe&interval=${interval}`;

	const plusCTAButton = (position) => {
		const utm_campaign = (position === 'top' ? 'c_1' : 'c_2');
		const utm_content = (ah ? '2' : '1');
		const plusCheckoutLink = `${globals.CHECKOUT_BASE_URL}/plus?${params}&utm_campaign=intro_hub_${utm_campaign}&utm_content=${utm_content}`;

		return (
			<a className="button button-gold" href={plusCheckoutLink} target="_blank" rel="noopener noreferrer" title="Upgrade to Plus">
				{`${t('hub_upgrade_to')} Plus`}
			</a>
		);
	};

	const plusButtonTop = () => (isPlus ? plusAlreadyProtectedButton() : plusCTAButton('top'));

	const plusButtonBottom = () => (isPlus ? plusAlreadyProtectedButton() : plusCTAButton('bottom'));

	const toggleSwitch = (mobileView, secondToggle) => {
		const toggleSwitchClassNames = ClassNames('small-12 text-center columns', {
			'toggle-switch-row': mobileView,
			'second-toggle': secondToggle,
		});
		return (
			<div className="row align-middle toggle-switch">
				<div className={toggleSwitchClassNames}>
					<span className={monthlyToggleLabel}>{t('hub_upgrade_monthly')}</span>
					<label className="switch" htmlFor="switch-check" onClick={toggleMonthlyYearlyPrices}>
						<input className={sliderClassNames} type="checkbox" />
						<span className="slider round" />
					</label>
					<span className={yearlyToggleLabel}>{t('hub_upgrade_yearly')}</span>
				</div>
			</div>
		);
	};

	const plusCard = mobileView => (
		<div className="card-outer">
			<div className="card plus" data-equalizer-watch>
				<div className="ghostery-plus-image-container">
					<div className="ghostery-plus-image" title="Ghostery Plus" alt="Ghostery Plus" />
				</div>
				<h2>Ghostery Plus</h2>
				<div className="price">
					{show_yearly_prices ? (
						<React.Fragment>
							<p className="price-gold font-size-36">$3.99</p>
							<p className="price-gold sub-text font-size-12">{t('per_month')}</p>
							<div className="price-per-year">
								<p className="price-gold sub-text font-size-12">{`( $47.88 ${t('per_year')})`}</p>
							</div>
						</React.Fragment>
					) : (
						<React.Fragment>
							<p className="price-gold font-size-36">$4.99</p>
							<p className="price-gold sub-text font-size-12">{t('per_month')}</p>
						</React.Fragment>
					)}
				</div>
				{mobileView && toggleSwitch(true)}
				{plusButtonTop()}
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

	return (
		<section className="pricing-page page-template-page-content-modules">
			<div className="grid-container show-for-extra-large">
				<div className="row align-center">
					<div className="small-12 text-center columns">
						<h1>{`${t('hub_upgrade_your')} Ghostery ${t('hub_upgrade_protection_plan')}`}</h1>
						{toggleSwitch()}
					</div>
				</div>
			</div>

			<div className="grid-container card-wrapper show-for-extra-large">
				<div className="row align-center text-center" data-equalizer data-equalize-on="medium">
					{basicCard()}
					{plusCard()}
				</div>
			</div>

			<div className="grid-container card-wrapper hide-for-extra-large">
				<div className="row align-center">
					<div className="small-12 text-center columns">
						<h1>{`${t('hub_upgrade_your')} Ghostery ${t('hub_upgrade_protection_plan')}`}</h1>
					</div>
				</div>
				<div className="row align-center">
					<div className="columns shrink text-center">
						<ul className="tiers-group tabs menu align-center" data-tabs id="price-tabs">
							<li className={tabsTitleBlueClassNames} onClick={setBasicProtection}>{t('hub_upgrade_plan_free')}</li>
							<li className={tabsTitleGoldClassNames} onClick={setPlusProtection}>Plus</li>
						</ul>
					</div>
				</div>
				<div className="tabs-content" data-tabs-content="price-tabs">
					{protection_level === BASIC && basicCard()}
					{protection_level === PLUS && plusCard(true)}
				</div>
			</div>
			<div className="row align-center module-editor text-center show-for-extra-large">
				<div className="columns text-center">
					<div className="learn-more learn-more-to-full-list" onClick={scrollToComparisonTable}>{t('hub_upgrade_scroll_down')}</div>
					<div className="arrow learn-more learn-more-to-full-list" onClick={scrollToComparisonTable} />
				</div>
			</div>
			<div className="row align-center module-editor text-center hide-for-extra-large">
				<div className="columns text-center">
					<div className="learn-more learn-more-to-full-list-mobile" onClick={scrollToMobileComparisonTable}>{t('hub_upgrade_scroll_down')}</div>
					<div className="arrow learn-more learn-more-to-full-list-mobile" onClick={scrollToMobileComparisonTable} />
				</div>
			</div>
			<div ref={comparisonTableRef} className="comparison-table show-for-extra-large">
				<div className="grid-container">
					<div className="row align-center">
						<div className="shrink columns">
							<ul>
								<li className="bg-blue">
									<button type="button">Ghostery</button>
								</li>
								<li className="bg-gold">
									<button type="button">Ghostery Plus</button>
								</li>
							</ul>
							<table className="feature-matrix-table">
								<thead>
									<tr>
										<th className="hide" aria-label="hide" />
										<th className="bg-blue default">Ghostery</th>
										<th className="bg-gold">Ghostery Plus</th>
									</tr>
								</thead>
								<tbody>
									{featureMatrixRow(t('hub_upgrade_browser_tracker_blocking'), true, true)}
									{featureMatrixRow(t('hub_upgrade_browser_ad_blocking'), true, true)}
									{featureMatrixRow(t('hub_upgrade_custom_blocking_preferences'), true, true)}
									{featureMatrixRow(t('hub_upgrade_extension_themes'), false, true)}
									{featureMatrixRow(t('hub_upgrade_historical_extension_stats'), false, true)}
									{featureMatrixRow(t('plus_subscriber_perk_insights'), false, true)}
									{featureMatrixRow(t('plus_subscriber_perk_glow'), false, true)}
									<tr>
										<td />
										<td className="default">
											<NavLink className="button primary already-protected" to="/home" title="Already Protected">
												{t('hub_upgrade_already_protected')}
											</NavLink>
										</td>
										<td>
											{plusButtonBottom()}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			<div ref={mobileComparisonTableRef} className="comparison-table comparison-table-mobile hide-for-extra-large">
				{toggleSwitch(true, true)}
				<div className="mobile-table-header">
					<div className="row align-top align-center">
						<div className="small-6 text-center columns">
							<p className="protection-description blue">{t('ghostery_basic')}</p>
						</div>
						<div className="small-6 text-center columns">
							<p className="protection-description yellow">Plus</p>
						</div>
					</div>
					<div className="row align-top align-center">
						<div className="small-6 text-center columns">
							<p className="protection-header protection-header-free price-blue"><strong>{t('hub_upgrade_plan_free')}</strong></p>
						</div>
						<div className="small-6 text-center columns">
							{show_yearly_prices ? (
								<p className="protection-header protection-header-plus price-gold"><span className="protection-header-plus-yearly is-active"><strong>$3.99</strong></span></p>
							) : (
								<p className="protection-header protection-header-plus price-gold"><strong>$4.99</strong></p>
							)}
						</div>
					</div>
				</div>
				<div className="grid-container">
					<div className="row align-center">
						<div className="shrink table-container">
							<table className="unstriped">
								<tbody>
									{mobileFeatureMatrixRow(t('hub_upgrade_browser_tracker_blocking'), true, true)}
									{mobileFeatureMatrixRow(t('hub_upgrade_browser_ad_blocking'), true, true)}
									{mobileFeatureMatrixRow(t('hub_upgrade_custom_blocking_preferences'), true, true)}
									{mobileFeatureMatrixRow(t('hub_upgrade_extension_themes'), false, true)}
									{mobileFeatureMatrixRow(t('hub_upgrade_historical_extension_stats'), false, true)}
									{mobileFeatureMatrixRow(t('plus_subscriber_perk_insights'), false, true)}
									{mobileFeatureMatrixRow(t('plus_subscriber_perk_glow'), false, true)}
								</tbody>
							</table>
						</div>
					</div>
					<div className="row align-center footer-buttons">
						<div className="small-12 text-center columns">
							<span className="col-free">
								<NavLink className="button primary already-protected" to="/home" title="Already Protected">
									{t('hub_upgrade_already_protected')}
								</NavLink>
							</span>
						</div>
						<div className="small-12 text-center columns">
							<span className="col-plus">
								{plusButtonBottom()}
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

// PropTypes ensure we pass required props of the correct type
UpgradePlanView.propTypes = {
	protection_level: PropTypes.string.isRequired,
	show_yearly_prices: PropTypes.bool.isRequired,
	user: PropTypes.shape({
		email: PropTypes.string,
		plusAccess: PropTypes.bool,
		premiumAccess: PropTypes.bool,
	}),
	actions: PropTypes.shape({
		toggleMonthlyYearlyPrices: PropTypes.func.isRequired,
		setBasicProtection: PropTypes.func.isRequired,
		setPlusProtection: PropTypes.func.isRequired,
	}).isRequired,
};

// Default props used on the Home View
UpgradePlanView.defaultProps = {
	user: {
		email: '',
		plusAccess: false,
		premiumAccess: false,
	},
};

export default UpgradePlanView;
