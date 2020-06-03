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

import React from 'react';
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
const UpgradePlanView = () => {
	const test = true;
	return (
		<section className="pricing-page page-template-page-content-modules">
			<div className="grid-container show-for-large">
				<div className="row align-center">
					<div className="small-12 text-center columns">
						<h1>{t('hub_upgrade_choose_plan')}</h1>
						<div className="row align-middle toggle-switch">
							<div className="small-12 text-center columns">
								<span>{t('hub_upgrade_yearly')}</span>
								<label className="switch" htmlFor="switch-check">
									<input className="switch-check" type="checkbox" />
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
							<div className="ghostery-free-image text-center mt-20" title="Ghostery Free" alt="Ghostery Free" />
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
							<div className="ghostery-plus-image" title="Ghostery Plus" alt="Ghostery Plus" />
							<h2>{t('ghostery_plus')}</h2>
							<div className="price">
								<p className="price-gold price-yearly active font-size-36">{t('hub_upgrade_ghostery_plus_yearly_price')}</p>
								<p className="price-gold price-monthly font-size-36">{t('hub_upgrade_ghostery_plus_monthly_price')}</p>
								<p className="price-gold font-size-12">{t('per_month')}</p>
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
							<div className="ghostery-premium-image card-image-top" title="Ghostery Premium" alt="Ghostery Premium" />
							<h2>{t('panel_detail_premium_title')}</h2>
							<div className="price">
								<p className="price-purple price-yearly active font-size-36">{t('hub_upgrade_ghostery_premium_yearly_price')}</p>
								<p className="price-purple price-monthly font-size-36">{t('hub_upgrade_ghostery_premium_monthly_price')}</p>
								<p className="price-purple font-size-12">{t('per_month')}</p>
								{/* year */}
								<p className="price-purple price-yearly active font-size-12">{t('per_month')}</p>
							</div>
							<a className="button button-purple-blue price-yearly active" href="https://checkout.ghostery.com/en/premium?interval=year" title="Buy Now">
								{t('hub_upgrade_to_premium')}
							</a>
							<a className="button button-purple-blue price-monthly" href="https://checkout.ghostery.com/en/premium" title="Buy Now">
								{t('hub_upgrade_ghostery_plus_monthly_price')}
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
						<span className="learn-more learn-more-to-full-list">{t('hub_upgrade_scroll_down')}</span>
						<div className="arrow learn-more learn-more-to-full-list" />
					</div>
				</div>
			</div>

			<div className="comparison-table show-for-large">
				<div className="grid-container">
					<div className="row align-center">
						<div className="shrink columns">
							<ul>
								<li className="bg-blue active">
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
										<td>{t('hub_upgrade_application_tracker_blocking')}</td>
										<td className="default"><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_application_ad_blocking')}</td>
										<td className="default"><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_vpn')}</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_no_vpn_logs')}</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_P2P_support')}</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_IPV6_leak_protection')}</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_physical_servers')}</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_unlimited_bandwidth')}</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td>
											<span className="check blue" />
										</td>
									</tr>

									<tr>
										<td />
										<td className="default"><a className="button button-blue" href="https://signon.ghostery.com/en/register" title="Sign Up">{t('hub_upgrade_plan_free')}</a></td>
										<td>
											<a className="button button-gold price-yearly active" href="https://checkout.ghostery.com/plus?interval=year" title="Buy Now">{t('hub_upgrade_basic_protection')}</a>
											<a className="button button-gold price-monthly" href="https://checkout.ghostery.com/plus" title="Buy Now">{t('hub_upgrade_basic_browser_protection')}</a>
										</td>
										<td>
											<a className="button button-purple-blue price-yearly active" href="https://checkout.ghostery.com/en/premium?interval=year" title="Buy Now">{t('hub_upgrade_basic_protection')}</a>
											<a className="button button-purple-blue price-monthly" href="https://checkout.ghostery.com/en/premium" title="Buy Now">{t('hub_upgrade_basic_browser_protection')}</a>
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
							<li className="tabs-title tabs-title-blue is-active"><a href="#panel1">{t('hub_upgrade_plan_free')}</a></li>
							<li className="tabs-title tabs-title-gold"><a href="#panel2">{t('hub_upgrade_plus')}</a></li>
							<li className="tabs-title tabs-title-purple"><a href="#panel3">{t('panel_detail_menu_premium_title')}</a></li>
						</ul>
					</div>
				</div>

				<div className="tabs-content" data-tabs-content="price-tabs">
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
					<div className="tabs-panel" id="panel2">
						<div className="card-outer">
							<div className="card">
								<div className="ghostery-plus-image" title="Ghostery Plus" alt="Ghostery Plus" />
								<h2>{t('ghostery_plus')}</h2>
								<div className="price">
									<p className="price-gold price-yearly active font-size-36">{t('hub_upgrade_ghostery_plus_yearly_price')}</p>
									<p className="price-gold price-monthly font-size-36">{t('hub_upgrade_ghostery_plus_monthly_price')}</p>
									<p className="price-gold font-size-12">{t('per_month')}</p>
								</div>
								<a className="button button-gold price-yearly active" href="https://checkout.ghostery.com/plus?interval=year" title="Buy Now">{t('hub_upgrade_ghostery_plus_yearly_price')}</a>
								<a className="button button-gold price-monthly" href="https://checkout.ghostery.com/plus" title="Buy Now">{t('hub_upgrade_ghostery_plus_monthly_price')}</a>
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
					<div className="tabs-panel" id="panel3">
						<div className="card-outer card-outer-remove">
							<div className="card">
								<div className="ghostery-premium-image card-image-top" title="Ghostery Premium" alt="Ghostery Premium" />
								<h2>{t('panel_detail_premium_title')}</h2>
								<div className="price">
									<p className="price-purple price-yearly active font-size-36">{t('hub_upgrade_ghostery_premium_yearly_price')}</p>
									<p className="price-purple price-monthly font-size-36">{t('hub_upgrade_ghostery_premium_monthly_price')}</p>
									<p className="price-purple font-size-12">{t('per_month')}</p>
								</div>
								<a className="button button-purple-blue price-yearly active" href="https://checkout.ghostery.com/en/premium?interval=year" title="Buy Now">{t('hub_upgrade_to_premium')}</a>
								<a className="button button-purple-blue price-monthly" href="https://checkout.ghostery.com/en/premium" title="Buy Now">{t('hub_upgrade_to_premium')}</a>
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
						<label className="switch" htmlFor="switch-check">
							<input className="switch-check" type="checkbox" />
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
						<p className="protection-header protection-header-plus price-gold"><strong>{t('hub_upgrade_ghostery_plus_monthly_price')}</strong></p>
						<p className="protection-header protection-header-plus price-gold"><span className="protection-header-plus-yearly is-active">{t('hub_upgrade_ghostery_plus_yearly_price')}</span></p>
					</div>
					<div className="small-4 text-center columns">
						<p className="protection-header protection-header-premium price-purple"><strong>{t('hub_upgrade_ghostery_premium_monthly_price')}</strong></p>
						<p className="protection-header protection-header-premium price-purple"><span className="protection-header-premium-yearly is-active">{t('hub_upgrade_ghostery_premium_yearly_price')}</span></p>
					</div>
				</div>
				<div className="row align-middle">
					<div className="small-4 text-center columns">
						<p className="table-header price-blue">{t('hub_upgrade_plan_free')}</p>

					</div>
					<div className="small-4 text-center columns">
						<p className="table-header price-gold price-yearly active">{t('hub_upgrade_ghostery_plus_yearly_price')}</p>
						<p className="table-header price-gold price-monthly">{t('hub_upgrade_ghostery_plus_monthly_price')}</p>
					</div>
					<div className="small-4 text-center columns">
						<p className="table-header price-purple price-yearly active">{t('hub_upgrade_ghostery_premium_yearly_price')}</p>
						<p className="table-header price-purple price-monthly">{t('hub_upgrade_ghostery_premium_monthly_price')}</p>
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
											<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" />
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
										<td className="default"><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td className="col-plus">
											<span className="check blue" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td colSpan="3">{t('hub_upgrade_application_tracker_blocking')}</td>
									</tr>
									<tr>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td className="col-plus">
											<span className="check blue" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr className="gray">
										<td colSpan="3">{t('hub_upgrade_application_ad_blocking')}</td>
									</tr>
									<tr className="gray border-bottom">
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td className="col-plus">
											<span className="check blue" />
										</td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td colSpan="3">{t('hub_upgrade_vpn')}</td>
									</tr>
									<tr>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr className="gray">
										<td colSpan="3">{t('hub_upgrade_no_vpn_logs')}</td>
									</tr>
									<tr className="gray border-bottom">
										<td className="default"><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td colSpan="3">{t('hub_upgrade_P2P_support')}</td>
									</tr>
									<tr>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr className="gray">
										<td colSpan="3">{t('hub_upgrade_IPV6_leak_protection')}</td>
									</tr>
									<tr className="gray border-bottom">
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr>
										<td colSpan="3">{t('hub_upgrade_physical_servers')}</td>
									</tr>
									<tr>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td className="col-premium">
											<span className="check blue" />
										</td>
									</tr>
									<tr className="gray">
										<td colSpan="3">{t('hub_upgrade_unlimited_bandwidth')}</td>
									</tr>
									<tr className="gray border-bottom">
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/x.png" title="Ghostery X" alt="Ghostery X" /></td>
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
								<a className="button button-blue active" href="https://signon.ghostery.com/en/register" title="Choose Free">{t('hub_upgrade_already_protected')}</a>
							</span>
						</div>
						<div className="small-12 text-center columns">
							<span className="col-plus">
								<a className="button button-gold price-yearly active" href="https://checkout.ghostery.com/plus?interval=year" title="Choose Plus">{t('upgrade_to_plus')}</a>
								<a className="button button-gold price-monthly" href="https://checkout.ghostery.com/plus" title="Choose Plus">{t('upgrade_to_plus')}</a>
							</span>
						</div>
						<div className="small-12 text-center columns">
							<span className="col-premium">
								<a className="button button-purple-blue price-yearly active" href="https://checkout.ghostery.com/en/premium?interval=year" title="Choose Premium">{t('hub_upgrade_ghostery_premium_yearly_price')}</a>
								<a className="button button-purple-blue price-monthly" href="https://checkout.ghostery.com/en/premium" title="Choose Premium">{t('hub_upgrade_ghostery_premium_monthly_price')}</a>
							</span>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default UpgradePlanView;
