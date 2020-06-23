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

import React, { useRef, Fragment } from 'react';
import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import { BASIC, PLUS, PREMIUM } from './UpgradePlanViewConstants';
import globals from '../../../../src/classes/Globals';

const featureMatrixRow = (label, isBasic, isPlus, isSparkle) => (
	<tr>
		<td>
			{label}
			{isSparkle &&
				<span className="premium-sparkle" />
			}
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
		<td>
			<span className="check purple" />
		</td>
	</tr>
);

const mobileFeatureMatrixRow = (label, isBasic, isPlus, isSparkle) => (
	<Fragment>
		<tr>
			<td colSpan="3">
				<span className="feature-title">{label}</span>
				{isSparkle &&
					<span className="premium-sparkle" />
				}
			</td>
		</tr>
		<tr className="border-bottom">
			{isBasic ? (
				<td className="col-free">
					<span className="check blue" />
				</td>
			) : (
				<td>
					<span className="x-icon" />
				</td>
			)}
			{isPlus ? (
				<td className="col-plus">
					<span className="check yellow" />
				</td>
			) : (
				<td>
					<span className="x-icon" />
				</td>
			)}
			<td className="col-premium">
				<span className="check purple" />
			</td>
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
			<NavLink className="button already-protected" to="/home" title="Already Protected">
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

/**
 * A React class component for rendering the Upgrade Plan View
 * @return {JSX} JSX for rendering the Upgrade Plan View of the Hub app
 * @memberof HubComponents
 */
const UpgradePlanView = (props) => {
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
		setPremiumProtection
	} = actions;

	const isPlus = (user && user.plusAccess) || false;
	const isPremium = (user && user.premiumAccess) || false;

	const sliderClassNames = ClassNames('switch-check', {
		checked: show_yearly_prices
	});
	const tabsTitleBlueClassNames = ClassNames('tabs-title tabs-title-blue', {
		'is-active': protection_level === BASIC
	});
	const tabsTitleGoldClassNames = ClassNames('tabs-title tabs-title-gold', {
		'is-active': protection_level === PLUS
	});
	const tabsTitlePurpleClassNames = ClassNames('tabs-title tabs-title-purple', {
		'is-active': protection_level === PREMIUM
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

	// UTM params
	const signedIn = +!!user;
	const subscriptionType = () => {
		if (isPremium) return 'PREMIUM';
		if (isPlus) return 'SUPPORTER';
		return '-1';
	};
	// Interval is the query Param to show monthly/yearly pricing in checkout web, also used as a ping parameter
	const interval = show_yearly_prices ? 'year' : 'month';
	const utmParams = `utm_source=gbe&utm_campaign=intro_hub_c_1&signedIn=${signedIn}&st=${subscriptionType()}&subscription_interval=${interval}`;

	const plusCheckoutLink = `${globals.CHECKOUT_BASE_URL}/plus?interval=${interval}&${utmParams}`;
	const premiumCheckoutLink = `${globals.CHECKOUT_BASE_URL}/premium?interval=${interval}&${utmParams}`;

	const plusCTAButton = () => (
		isPlus ? (
			<NavLink className="button button-gold" to="/home" title="Already Protected">
				{t('hub_upgrade_already_protected')}
			</NavLink>
		) : (
			<a className="button button-gold" href={plusCheckoutLink} target="_blank" rel="noopener noreferrer" title="Upgrade to Plus">
				{t('hub_upgrade_to_plus')}
			</a>
		)
	);

	const premiumCTAButton = () => (
		isPremium ? (
			<NavLink className="button button-premium" to="/home" title="Already Protected">
				{t('hub_upgrade_already_protected')}
			</NavLink>
		) : (
			<a className="button button-premium" href={premiumCheckoutLink} target="_blank" rel="noopener noreferrer" title="Upgrade to Premium">
				{t('hub_upgrade_to_premium')}
			</a>
		)
	);

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
				{plusCTAButton()}
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
					{show_yearly_prices ? (
						<React.Fragment>
							<p className="price-purple sub-text font-size-36">$8.99</p>
							<p className="price-purple sub-text font-size-12">{t('per_month')}</p>
							<div className="price-per-year">
								<p className="price-purple sub-text font-size-12">{`( $107.88 ${t('per_year')})`}</p>
							</div>
						</React.Fragment>
					) : (
						<React.Fragment>
							<p className="price-purple sub-text font-size-36">$11.99</p>
							<p className="price-purple sub-text font-size-12">{t('per_month')}</p>
						</React.Fragment>
					)}
				</div>
				{mobileView && toggleSwitch(true)}
				{premiumCTAButton()}
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
					{premiumCard()}
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
							<li className={tabsTitleGoldClassNames} onClick={setPlusProtection}>{t('hub_upgrade_plus')}</li>
							<li className={tabsTitlePurpleClassNames} onClick={setPremiumProtection}>{t('panel_detail_menu_premium_title')}</li>
						</ul>
					</div>
				</div>
				<div className="tabs-content" data-tabs-content="price-tabs">
					{protection_level === BASIC && basicCard()}
					{protection_level === PLUS && plusCard(true)}
					{protection_level === PREMIUM && premiumCard(true)}
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
								<li className="bg-purple-blue">
									<button type="button">Ghostery Premium</button>
								</li>
							</ul>
							<div className="key-container">
								<span className="premium-sparkle" />
								<span className="midnight-note">{`- ${t('hub_upgrade_midnight_note')}`}</span>
							</div>
							<table>
								<thead>
									<tr>
										<th className="hide" aria-label="hide" />
										<th className="bg-blue default">Ghostery</th>
										<th className="bg-gold">Ghostery Plus</th>
										<th className="bg-purple-blue">Ghostery Premium</th>
									</tr>
								</thead>
								<tbody>
									{featureMatrixRow(t('hub_upgrade_browser_tracker_blocking'), true, true)}
									{featureMatrixRow(t('hub_upgrade_browser_ad_blocking'), true, true)}
									{featureMatrixRow(t('hub_upgrade_custom_blocking_preferences'), true, true)}
									{featureMatrixRow(t('hub_upgrade_extension_themes'), false, true)}
									{featureMatrixRow(t('hub_upgrade_historical_extension_stats'), false, true)}
									{featureMatrixRow(t('hub_upgrade_application_tracker_blocking'), false, true, true)}
									{featureMatrixRow(t('hub_upgrade_application_ad_blocking'), false, true, true)}
									{featureMatrixRow('VPN', false, false, true)}
									{featureMatrixRow(t('hub_upgrade_no_vpn_logs'), false, false, true)}
									{featureMatrixRow(`P2P ${t('support')}`, false, false, true)}
									{featureMatrixRow(`IPv6 ${t('hub_upgrade_leak_protection')}`, false, false, true)}
									{featureMatrixRow(t('hub_upgrade_physical_servers'), false, false, true)}
									{featureMatrixRow(t('hub_upgrade_unlimited_bandwidth'), false, false, true)}
									<tr>
										<td />
										<td className="default">
											<NavLink className="button already-protected" to="/home" title="Already Protected">
												{t('hub_upgrade_already_protected')}
											</NavLink>
										</td>
										<td>
											{plusCTAButton()}
										</td>
										<td>
											{premiumCTAButton()}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			<div className="key-container mobile hide-for-extra-large">
				<span className="premium-sparkle" />
				<span className="midnight-note">{`- ${t('hub_upgrade_midnight_note')}`}</span>
			</div>

			<div ref={mobileComparisonTableRef} className="comparison-table comparison-table-mobile hide-for-extra-large">
				{toggleSwitch(true, true)}
				<div className="mobile-table-header">
					<div className="row align-top align-center">
						<div className="small-4 text-center columns">
							<p className="protection-description blue">Basic</p>
						</div>
						<div className="small-4 text-center columns">
							<p className="protection-description yellow">Plus</p>
						</div>
						<div className="small-4 text-center columns">
							<p className="protection-description purple">Premium</p>
						</div>
					</div>
					<div className="row align-top align-center">
						<div className="small-4 text-center columns">
							<p className="protection-header protection-header-free price-blue"><strong>{t('hub_upgrade_plan_free')}</strong></p>
						</div>
						<div className="small-4 text-center columns">
							{show_yearly_prices ? (
								<p className="protection-header protection-header-plus price-gold"><span className="protection-header-plus-yearly is-active"><strong>$3.99</strong></span></p>
							) : (
								<p className="protection-header protection-header-plus price-gold"><strong>$4.99</strong></p>
							)}
						</div>
						<div className="small-4 text-center columns">
							{show_yearly_prices ? (
								<p className="protection-header protection-header-premium price-purple"><span className="protection-header-premium-yearly is-active"><strong>$8.99</strong></span></p>
							) : (
								<p className="protection-header protection-header-premium price-purple"><strong>$11.99</strong></p>
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
									{mobileFeatureMatrixRow(t('hub_upgrade_application_tracker_blocking'), false, true, true)}
									{mobileFeatureMatrixRow(t('hub_upgrade_application_ad_blocking'), false, true, true)}
									{mobileFeatureMatrixRow('VPN', false, false, true)}
									{mobileFeatureMatrixRow(t('hub_upgrade_no_vpn_logs'), false, false, true)}
									{mobileFeatureMatrixRow(`P2P ${t('support')}`, false, false, true)}
									{mobileFeatureMatrixRow(`IPv6 ${t('hub_upgrade_leak_protection')}`, false, false, true)}
									{mobileFeatureMatrixRow(t('hub_upgrade_physical_servers'), false, false, true)}
									{mobileFeatureMatrixRow(t('hub_upgrade_unlimited_bandwidth'), false, false, true)}
								</tbody>
							</table>
						</div>
					</div>
					<div className="row align-center footer-buttons">
						<div className="small-12 text-center columns">
							<span className="col-free">
								<NavLink className="button already-protected" to="/home" title="Already Protected">
									{t('hub_upgrade_already_protected')}
								</NavLink>
							</span>
						</div>
						<div className="small-12 text-center columns">
							<span className="col-plus">
								{plusCTAButton()}
							</span>
						</div>
						<div className="small-12 text-center columns">
							<span className="col-premium">
								{premiumCTAButton()}
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
		setPremiumProtection: PropTypes.func.isRequired,
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
