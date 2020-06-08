/**
 * Upgrade Plan View Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { useRef } from 'react';
import ClassNames from 'classnames';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';
import globals from '../../../../src/classes/Globals';
import { ToggleCheckbox } from '../../../shared-components';

/**
 * A React class component for rendering the Home View
 * @return {JSX} JSX for rendering the Home View of the Hub app
 * @memberof HubComponents
 */
const UpgradePlanView = (props) => {
	const {
		protection_level,
		show_monthly_prices
	} = props;

	const {
		toggleMonthlyYearlyPrices,
		setBasicProtection,
		setPlusProtection,
		setPremiumProtection
	} = props.actions;
	// console.log('props: ', props);
	// console.log('props.actions: ', props.actions);

	const BASIC = 'BASIC';
	const PLUS = 'PLUS';
	const PREMIUM = 'PREMIUM';

	const sliderClassNames = ClassNames('switch-check', {
		checked: show_monthly_prices
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

	const comparisonTableRef = useRef(null);
	const scrollToComparisonTable = () => {
		comparisonTableRef.current.scrollIntoView({ behavior: 'smooth' });
	};

	return (
		<section className="pricing-page page-template-page-content-modules">
			<div className="grid-container show-for-large">
				<div className="row align-center">
					<div className="small-12 text-center columns">
						<h1>{t('hub_upgrade_choose_plan')}</h1>
						<div className="row align-middle toggle-switch">
							<div className="small-12 text-center columns">
								<span>{t('hub_upgrade_yearly')}</span>
								<label className="switch" htmlFor="switch-check" onClick={toggleMonthlyYearlyPrices}>
									<input className={sliderClassNames} type="checkbox" />
									<span className="slider round" />
								</label>
								<span>{t('hub_upgrade_monthly')}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="grid-container card-wrapper show-for-large">
				<div className="row align-center text-center" data-equalizer data-equalize-on="medium">
					<div className="card-outer">
						<div className="card" data-equalizer-watch>
							<div className="card-header-background-free" />
							<div className="ghostery-free-image-container">
								<div className="ghostery-free-image text-center" title="Ghostery Free" alt="Ghostery Free" />
							</div>
							<h2>{t('ghostery')}</h2>
							<div className="price">
								<p className="price-blue font-size-36">{t('hub_upgrade_plan_free')}</p>
							</div>
							<a className="button button-blue" href="" title="Already Protected">{t('hub_upgrade_already_protected')}</a>
							<p className="card-sub-header"><strong>{t('hub_upgrade_basic_protection')}</strong></p>
							<p className="card-sub-copy">
								<span className="check blue" />
								{t('hub_upgrade_basic_browser_protection')}
							</p>
						</div>
					</div>
					<div className="card-outer">
						<div className="card" data-equalizer-watch>
							<div className="ghostery-plus-image-container">
								<div className="ghostery-plus-image" title="Ghostery Plus" alt="Ghostery Plus" />
							</div>
							<h2>{t('ghostery_plus')}</h2>
							<div className="price">
								{ show_monthly_prices ? (
									<React.Fragment>
										<p className="price-gold font-size-36">$4.99</p>
										<p className="price-gold font-size-12">{t('per_month')}</p>
									</React.Fragment>
								) : (
									<React.Fragment>
										<p className="price-gold font-size-36">$3.99</p>
										<p className="price-gold font-size-12">{t('per_year')}</p>
									</React.Fragment>
								)}
							</div>
							<a className="button button-gold" href="" title="Upgrade to Plus">{t('upgrade_to_plus')}</a>
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
					<div className="card-outer card-outer-remove">
						<div className="card" data-equalizer-watch>
							<div className="ghostery-premium-image-container">
								<div className="ghostery-premium-image card-image-top" title="Ghostery Premium" alt="Ghostery Premium" />
							</div>
							<div className="ghostery-premium-image-background" />
							<h2>{t('panel_detail_premium_title')}</h2>
							<div className="price">
								{ show_monthly_prices ? (
									<React.Fragment>
										<p className="price-purple font-size-36">$11.99</p>
										<p className="price-purple font-size-12">{t('per_month')}</p>
									</React.Fragment>
								) : (
									<React.Fragment>
										<p className="price-purple font-size-36">$8.99</p>
										<p className="price-purple font-size-12">{t('per_year')}</p>
									</React.Fragment>
								)}
							</div>
							<a className="button button-purple-blue" href="https://checkout.ghostery.com/en/premium?interval=year" title="Buy Now">
								{t('hub_upgrade_to_premium')}
							</a>
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
								{t('hub_upgrade_vpn')}
							</p>
						</div>
					</div>
				</div>
				<div className="row align-center module-editor text-center">
					<div className="columns text-center">
						<div className="learn-more learn-more-to-full-list" onClick={scrollToComparisonTable}>{t('hub_upgrade_scroll_down')}</div>
						<div className="arrow learn-more learn-more-to-full-list" onClick={scrollToComparisonTable} />
					</div>
				</div>
			</div>

			<div ref={comparisonTableRef} className="comparison-table show-for-large">
				<div className="grid-container">
					<div className="row align-center">
						<div className="shrink columns">
							<ul>
								<li className="bg-blue">
									<button type="button">{t('ghostery')}</button>
								</li>
								<li className="bg-gold">
									<button type="button">{t('ghostery_plus')}</button>
								</li>
								<li className="bg-purple-blue">
									<button type="button">{t('panel_detail_premium_title')}</button>
								</li>
							</ul>

							<table>
								<thead>
									<tr>
										<th className="hide" aria-label="hide" />
										<th className="bg-blue default">{t('ghostery')}</th>
										<th className="bg-gold">{t('ghostery_plus')}</th>
										<th className="bg-purple-blue">{t('panel_detail_premium_title')}</th>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td>{t('hub_upgrade_browser_tracker_blocking')}</td>
										<td className="default">
											<span className="check blue" />
										</td>
										<td>
											<span className="check blue" />
										</td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_browser_ad_blocking')}</td>
										<td className="default">
											<span className="check blue" />
										</td>
										<td>
											<span className="check blue" />
										</td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_custom_blocking_preferences')}</td>
										<td className="default">
											<span className="check blue" />
										</td>
										<td>
											<span className="check blue" />
										</td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_extension_themes')}</td>
										<td className="default"><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_historical_extension_stats')}</td>
										<td className="default"><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>
											<span className="feature-title">
												{t('hub_upgrade_application_tracker_blocking')}
											</span>
											<span className="premium-sparkle" />
										</td>
										<td className="default"><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>
											<span className="feature-title">
												{t('hub_upgrade_application_ad_blocking')}
											</span>
											<span className="premium-sparkle" />
										</td>
										<td className="default"><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>
											<span className="feature-title">
												{t('hub_upgrade_vpn')}
											</span>
											<span className="premium-sparkle" />
										</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>
											<span className="feature-title">
												{t('hub_upgrade_no_vpn_logs')}
											</span>
											<span className="premium-sparkle" />
										</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>
											<span className="feature-title">
												{t('hub_upgrade_P2P_support')}
											</span>
											<span className="premium-sparkle" />
										</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>
											<span className="feature-title">
												{t('hub_upgrade_IPV6_leak_protection')}
											</span>
											<span className="premium-sparkle" />
										</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>
											<span className="feature-title">
												{t('hub_upgrade_physical_servers')}
											</span>
											<span className="premium-sparkle" />
										</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>
											<span className="feature-title">
												{t('hub_upgrade_unlimited_bandwidth')}
											</span>
											<span className="premium-sparkle" />
										</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td />
										<td className="default"><a className="button button-blue" href="https://signon.ghostery.com/en/register" title="Sign Up">{t('hub_upgrade_already_protected')}</a></td>
										<td>
											{show_monthly_prices ? (
												<a className="button button-gold" href="https://checkout.ghostery.com/plus" title="Buy Now">{t('hub_upgrade_to_plus')}</a>
											) : (
												<a className="button button-gold" href="https://checkout.ghostery.com/plus?interval=year" title="Buy Now">{t('hub_upgrade_to_plus')}</a>
											)}
										</td>
										<td>
											{show_monthly_prices ? (
												<a className="button button-purple-blue" href="https://checkout.ghostery.com/en/premium" title="Buy Now">{t('hub_upgrade_to_premium')}</a>
											) : (
												<a className="button button-purple-blue" href="https://checkout.ghostery.com/en/premium?interval=year" title="Buy Now">{t('hub_upgrade_to_premium')}</a>
											)}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			<div className="grid-container card-wrapper hide-for-large">
				<div className="row align-center">
					<div className="small-12 text-center columns">
						<h1>{t('hub_upgrade_choose_plan')}</h1>
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
					{protection_level === BASIC && (
						<div className="tabs-panel is-active" id="panel1">
							<div className="card-outer">
								<div className="card">
									<div className="ghostery-free-image text-center mt-20" title="Ghostery Free" alt="Ghostery Free" />
									<h2>{t('ghostery')}</h2>
									<div className="price">
										<p className="price-blue font-size-36">{t('hub_upgrade_plan_free')}</p>
									</div>
									<a className="button button-blue" href="https://signon.ghostery.com/en/register" title="Sign Up">{t('hub_upgrade_plan_free')}</a>
									<p className="card-sub-header"><strong>{t('hub_upgrade_basic_protection')}</strong></p>
									<p className="card-sub-copy">
										<span className="check blue" />
										{t('hub_upgrade_basic_browser_protection')}
									</p>
								</div>
							</div>
						</div>
					)}
					{protection_level === PLUS && (
						<div className="tabs-panel" id="panel2">
							<div className="card-outer">
								<div className="card">
									<div className="ghostery-plus-image" title="Ghostery Plus" alt="Ghostery Plus" />
									<h2>{t('ghostery_plus')}</h2>
									<div className="price">
										{show_monthly_prices ? (
											<React.Fragment>
												<p className="price-gold font-size-36">$4.99</p>
												<p className="price-gold font-size-12">{t('per_month')}</p>
											</React.Fragment>
										) : (
											<React.Fragment>
												<p className="price-gold font-size-36">$3.99</p>
												<p className="price-gold font-size-12">{t('per_year')}</p>
											</React.Fragment>
										)}
									</div>
									<a className="button button-gold" href="https://checkout.ghostery.com/plus" title="Buy Now">{t('hub_upgrade_to_plus')}</a>
									<p className="card-sub-header"><strong><strong>{t('hub_upgrade_additional_protection')}</strong></strong></p>
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
						</div>
					)}
					{protection_level === PREMIUM && (
						<div className="tabs-panel" id="panel3">
							<div className="card-outer card-outer-remove">
								<div className="card">
									<div className="ghostery-premium-image card-image-top" title="Ghostery Premium" alt="Ghostery Premium" />
									<h2>{t('panel_detail_premium_title')}</h2>
									<div className="price">
										{show_monthly_prices ? (
											<React.Fragment>
												<p className="price-purple font-size-36">$11.99</p>
												<p className="price-purple font-size-12">{t('per_month')}</p>
											</React.Fragment>
										) : (
											<React.Fragment>
												<p className="price-purple font-size-36">$8.99</p>
												<p className="price-purple font-size-12">{t('per_year')}</p>
											</React.Fragment>
										)}
									</div>
									{show_monthly_prices ? (
										<a className="button button-purple-blue" href="https://checkout.ghostery.com/en/premium" title="Buy Now">{t('hub_upgrade_to_premium')}</a>
									) : (
										<a className="button button-purple-blue" href="https://checkout.ghostery.com/en/premium?interval=year" title="Buy Now">{t('hub_upgrade_to_premium')}</a>
									)}
									<p className="card-sub-header"><strong>{t('hub_upgrade_maximum_browser_protection')}</strong></p>
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
										{t('hub_upgrade_vpn')}
									</p>
								</div>
							</div>
						</div>
					)}
				</div>
				<div className="row align-center module-editor text-center">
					<div className="columns text-center">
						<span className="learn-more learn-more-to-full-list-mobile">learn more to full list mobile</span>
						<div className="arrow learn-more learn-more-to-full-list-mobile">arrow</div>
					</div>
				</div>
			</div>

			<div className="comparison-table comparison-table-mobile hide-for-large">

				<div className="row align-middle toggle-switch">
					<div className="small-12 text-center columns">
						<span>{t('hub_upgrade_yearly')}</span>
						<label className="switch" htmlFor="switch-check" onClick={toggleMonthlyYearlyPrices}>
							<input className={sliderClassNames} type="checkbox" />
							<span className="slider round" />
						</label>
						<span>{t('hub_upgrade_monthly')}</span>
					</div>
				</div>
				<div className="row align-top align-center">
					<div className="small-4 text-center columns">
						<p className="protection-header protection-header-free price-blue"><strong>{t('hub_upgrade_plan_free')}</strong></p>
					</div>
					<div className="small-4 text-center columns">
						{show_monthly_prices ? (
							<p className="protection-header protection-header-plus price-gold"><strong>$4.99</strong></p>
						) : (
							<p className="protection-header protection-header-plus price-gold"><span className="protection-header-plus-yearly is-active">$3.99</span></p>
						)}
					</div>
					<div className="small-4 text-center columns">
						{show_monthly_prices ? (
							<p className="protection-header protection-header-premium price-purple"><strong>$11.99</strong></p>
						) : (
							<p className="protection-header protection-header-premium price-purple"><span className="protection-header-premium-yearly is-active">$8.99</span></p>
						)}
					</div>
				</div>
				<div className="row align-middle">
					<div className="small-4 text-center columns">
						<p className="table-header price-blue">{t('hub_upgrade_plan_free')}</p>

					</div>
					<div className="small-4 text-center columns">
						{show_monthly_prices ? (
							<p className="table-header price-gold">$4.99</p>
						) : (
							<p className="table-header price-gold">$3.99</p>
						)}
					</div>
					<div className="small-4 text-center columns">
						{show_monthly_prices ? (
							<p className="table-header price-purple">$11.99</p>
						) : (
							<p className="table-header price-purple">$8.99</p>
						)}
					</div>
				</div>
				<div className="grid-container">
					<div className="row align-center">
						<div className="shrink columns">
							<table className="unstriped">
								<tbody>
									<tr className="gray">
										<td colSpan="3">{t('hub_upgrade_browser_tracker_blocking')}</td>
									</tr>
									<tr className="gray border-bottom">
										<td className="col-free">
											<span className="check blue" />
										</td>
										<td className="col-plus">
											<span className="check blue" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td colSpan="3">{t('hub_upgrade_browser_ad_blocking')}</td>
									</tr>
									<tr>
										<td className="col-free">
											<span className="check blue" />
										</td>
										<td className="col-plus">
											<span className="check blue" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr className="gray">
										<td colSpan="3">{t('hub_upgrade_custom_blocking_preferences')}</td>
									</tr>
									<tr className="gray border-bottom">
										<td className="col-free">
											<span className="check blue" />
										</td>
										<td className="col-plus">
											<span className="check blue" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td colSpan="3">Extension Themes</td>
									</tr>
									<tr>
										<td>
											<span className="x-icon" />
										</td>
										<td className="col-plus">
											<span className="check blue" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr className="gray">
										<td colSpan="3">{t('hub_upgrade_historical_extension_stats')}</td>
									</tr>
									<tr className="gray border-bottom">
										<td>
											<span className="x-icon" />
										</td>
										<td className="col-plus">
											<span className="check blue" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td colSpan="3">
											<span className="feature-title">{t('hub_upgrade_application_tracker_blocking')}</span>
											<span className="premium-sparkle" />
										</td>
									</tr>
									<tr>
										<td>
											<span className="x-icon" />
										</td>
										<td className="col-plus">
											<span className="check blue" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr className="gray">
										<td colSpan="3">
											<span className="feature-title">{t('hub_upgrade_application_ad_blocking')}</span>
											<span className="premium-sparkle" />
										</td>
									</tr>
									<tr className="gray border-bottom">
										<td>
											<span className="x-icon" />
										</td>
										<td className="col-plus">
											<span className="check blue" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td colSpan="3">
											<span className="feature-title">{t('hub_upgrade_vpn')}</span>
											<span className="premium-sparkle" />
										</td>
									</tr>
									<tr>
										<td>
											<span className="x-icon" />
										</td>
										<td>
											<span className="x-icon" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr className="gray">
										<td colSpan="3">
											<span className="feature-title">{t('hub_upgrade_no_vpn_logs')}</span>
											<span className="premium-sparkle" />
										</td>
									</tr>
									<tr className="gray border-bottom">
										<td>
											<span className="x-icon" />
										</td>
										<td>
											<span className="x-icon" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td colSpan="3">
											<span className="feature-title">{t('hub_upgrade_P2P_support')}</span>
											<span className="premium-sparkle" />
										</td>
									</tr>
									<tr>
										<td>
											<span className="x-icon" />
										</td>
										<td>
											<span className="x-icon" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr className="gray">
										<td colSpan="3">
											<span className="feature-title">{t('hub_upgrade_IPV6_leak_protection')}</span>
											<span className="premium-sparkle" />
										</td>
									</tr>
									<tr className="gray border-bottom">
										<td>
											<span className="x-icon" />
										</td>
										<td>
											<span className="x-icon" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td colSpan="3">
											<span className="feature-title">{t('hub_upgrade_physical_servers')}</span>
											<span className="premium-sparkle" />
										</td>
									</tr>
									<tr>
										<td>
											<span className="x-icon" />
										</td>
										<td>
											<span className="x-icon" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr className="gray">
										<td colSpan="3">
											<span className="feature-title">{t('hub_upgrade_unlimited_bandwidth')}</span>
											<span className="premium-sparkle" />
										</td>
									</tr>
									<tr className="gray border-bottom">
										<td>
											<span className="x-icon" />
										</td>
										<td>
											<span className="x-icon" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
					<div className="row align-center footer-buttons">
						<div className="small-12 text-center columns">
							<span className="col-free">
								<a className="button button-blue" href="https://signon.ghostery.com/en/register" title="Choose Free">{t('hub_upgrade_already_protected')}</a>
							</span>
						</div>
						<div className="small-12 text-center columns">
							<span className="col-plus">
								{show_monthly_prices ? (
									<a className="button button-gold" href="https://checkout.ghostery.com/plus" title="Choose Plus">{t('upgrade_to_plus')}</a>
								) : (
									<a className="button button-gold" href="https://checkout.ghostery.com/plus?interval=year" title="Choose Plus">{t('upgrade_to_plus')}</a>
								)}
							</span>
						</div>
						<div className="small-12 text-center columns">
							<span className="col-premium">
								{show_monthly_prices ? (
									<a className="button button-purple-blue" href="https://checkout.ghostery.com/en/premium" title="Choose Premium">{t('hub_upgrade_to_premium')}</a>
								) : (
									<a className="button button-purple-blue" href="https://checkout.ghostery.com/en/premium?interval=year" title="Choose Premium">{t('hub_upgrade_to_premium')}</a>
								)}
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default UpgradePlanView;
