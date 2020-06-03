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
		<section className="pricing-page page-template-page-pricing ">
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
							<div className="ghostery-free" title="Ghostery Free" />
							<h2>{t('ghostery')}</h2>
							<div className="price">
								<p className="price-blue font-size-36">{t('hub_upgrade_plan_free')}</p>
							</div>
							<a className="button button-blue" href="" title="Already Protected">{t('hub_upgrade_already_protected')}</a>
							<p className="card-sub-header"><strong>{t('hub_upgrade_basic_protection')}</strong></p>
							<p className="card-sub-copy">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
								{t('hub_upgrade_basic_browser_protection')}
							</p>
						</div>
					</div>
					<div className="card-outer">
						<div className="card" data-equalizer-watch>
							<div className="ghostery-plus" title="Ghostery Plus" />
							<h2>{t('ghostery_plus')}</h2>
							<div className="price">
								<p className="price-gold price-yearly active font-size-36">{t('hub_upgrade_ghostery_plus_yearly_price')}</p>
								<p className="price-gold price-monthly font-size-36">{t('hub_upgrade_ghostery_plus_monthly_price')}</p>
								<p className="price-gold font-size-12">{t('per_month')}</p>
							</div>
							<a className="button button-gold" href="" title="Upgrade to Plus">{t('upgrade_to_plus')}</a>
							<p className="card-sub-header"><strong>{t('hub_upgrade_additional_protection')}</strong></p>
							<p className="card-sub-copy">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
								{t('hub_upgrade_basic_browser_protection')}
							</p>
							<p className="card-sub-copy">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
								{t('hub_upgrade_advanced_device_protection')}
							</p>
						</div>
					</div>
					<div className="card-outer card-outer-remove">
						<div className="card" data-equalizer-watch>
							<div className="card-image-top ghostery-premium" title="Ghostery Premium" />
							<h2>{t('panel_detail_premium_title')}</h2>
							<div className="price">
								<p className="price-purple price-yearly active font-size-36">{t('hub_upgrade_ghostery_premium_yearly_price')}</p>
								<p className="price-purple price-monthly font-size-36">{t('hub_upgrade_ghostery_premium_monthly_price')}</p>
								<p className="price-purple font-size-12">{t('per_month')}</p>
							</div>
							<a className="button button-purple-blue" href="" title="Premium CTA">{t('hub_upgrade_to_premium')}</a>
							<p className="card-sub-header"><strong>{ t('hub_upgrade_maximum_browser_protection') }</strong></p>
							<p className="card-sub-copy">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
								{t('hub_upgrade_basic_browser_protection')}
							</p>
							<p className="card-sub-copy">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
								{t('hub_upgrade_advanced_device_protection')}
							</p>
							<p className="card-sub-copy">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
								{t('hub_upgrade_vpn')}
							</p>
						</div>
					</div>
				</div>
				<div className="row align-center module-editor text-center">
					<div className="columns text-center">
						<span className="learn-more learn-more-to-full-list">{ t('hub_upgrade_scroll_down') }</span>
						<div className="arrow learn-more learn-more-to-full-list" />
					</div>
				</div>
			</div>

			<div className="grid-container card-wrapper hide-for-large">
				<div className="row align-center">
					<div className="small-12 text-center columns">
						<h1>{ t('hub_upgrade_choose_plan') }</h1>
					</div>
				</div>
				<div className="row align-center">
					<div className="columns shrink text-center">
						<ul className="tiers-group tabs menu align-center" data-tabs id="price-tabs">
							<li className="tabs-title is-active"><a href="#panel1">{t('hub_upgrade_plan_free')}</a></li>
							<li className="tabs-title"><a href="#panel2">{t('hub_upgrade_plus')}</a></li>
							<li className="tabs-title"><a href="#panel3">{t('panel_detail_menu_premium_title')}</a></li>
						</ul>
					</div>
				</div>

				<div className="tabs-content" data-tabs-content="price-tabs">
					<div className="tabs-panel is-active" id="panel1">
						<div className="card-outer">
							<div className="card">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/free-image-copy@2x.png" title="Ghostery Free" alt="Ghostery Free" />
								<h2>{t('ghostery')}</h2>
								<div className="price">
									<p className="price-blue font-size-36">{t('hub_upgrade_plan_free')}</p>
								</div>
								<a className="button button-blue" href="" title="Sign Up">{t('hub_upgrade_plan_free')}</a>
								<p className="card-sub-header"><strong>{t('hub_upgrade_basic_protection')}</strong></p>
								<p className="card-sub-copy">
									<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
									{t('hub_upgrade_basic_browser_protection')}
								</p>
							</div>
						</div>
					</div>
					<div className="tabs-panel" id="panel2">
						<div className="card-outer">
							<div className="card">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/ghost_plus@2x.png" title="Ghostery Plus" alt="Ghostery Plus" />
								<h2>{t('ghostery_plus')}</h2>
								<div className="price">
									<p className="price-gold price-yearly active font-size-36">{t('hub_upgrade_ghostery_plus_yearly_price')}</p>
									<p className="price-gold price-monthly font-size-36">{t('hub_upgrade_ghostery_plus_monthly_price')}</p>
									<p className="price-gold font-size-12">{t('per_month')}</p>
								</div>
								<div className="row collapse align-middle toggle-switch">
									<div className="small-12 text-center columns">
										<span>{t('hub_upgrade_yearly')}</span>
										<label className="switch" htmlFor="switch-check">
											<input className="switch-check" type="checkbox" />
											<span className="slider round" />
										</label>
										<span>{t('hub_upgrade_monthly')}</span>
									</div>
								</div>
								<a className="button button-gold" href="" title="Upgrade to Plus">{t('upgrade_to_plus')}</a>
								<p className="card-sub-header"><strong>{t('hub_upgrade_additional_protection')}</strong></p>
								<p className="card-sub-copy">
									<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
									{t('hub_upgrade_basic_browser_protection')}
								</p>
								<p className="card-sub-copy">
									<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
									{t('hub_upgrade_advanced_device_protection')}
								</p>
							</div>
						</div>
					</div>
					<div className="tabs-panel" id="panel3">
						<div className="card-outer card-outer-remove">
							<div className="card">
								<img className="card-image-top" src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/spaceship.svg" title="Ghostery Premium" alt="Ghostery Premium" />
								<h2>{t('panel_detail_premium_title')}</h2>
								<div className="price">
									<p className="price-purple price-yearly active font-size-36">{t('hub_upgrade_ghostery_premium_yearly_price')}</p>
									<p className="price-purple price-monthly font-size-36">{t('hub_upgrade_ghostery_premium_monthly_price')}</p>
									<p className="price-purple font-size-12">{t('per_month')}</p>
								</div>
								<div className="row collapse align-middle toggle-switch">
									<div className="small-12 text-center columns">
										<span>{t('hub_upgrade_yearly')}</span>
										<label className="switch" htmlFor="switch-check">
											<input className="switch-check" type="checkbox" />
											<span className="slider round" />
										</label>
										<span>{t('hub_upgrade_monthly')}</span>
									</div>
								</div>
								<a className="button button-purple-blue" href="" title="Buy Now">{t('hub_upgrade_to_premium')}</a>
								<p className="card-sub-header"><strong>{ t('hub_upgrade_maximum_browser_protection') }</strong></p>
								<p className="card-sub-copy">
									<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
									{t('hub_upgrade_basic_browser_protection')}
								</p>
								<p className="card-sub-copy">
									<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
									{t('hub_upgrade_advanced_device_protection')}
								</p>
								<p className="card-sub-copy">
									<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
									{t('hub_upgrade_vpn')}
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="slider-prices">
					<div className="card-outer">
						<div className="card">
							<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/free-image-copy@2x.png" title="Ghostery Free" alt="Ghostery Free" />
							<h2>{t('ghostery')}</h2>
							<div className="price">
								<p className="price-blue font-size-36">{t('hub_upgrade_plan_free')}</p>
							</div>
							<a className="button button-blue" href="" title="Sign Up">{t('hub_upgrade_plan_free')}</a>
						</div>
					</div>
					<div className="card-outer">
						<div className="card">
							<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/ghost_plus@2x.png" title="Ghostery Plus" alt="Ghostery Plus" />
							<h2>{t('ghostery_plus')}</h2>
							<div className="price">
								<p className="price-gold font-size-36">{t('hub_upgrade_ghostery_plus_yearly_price')}</p>
								<p className="price-gold font-size-12">{t('per_month')}</p>
							</div>
							<a className="button button-gold" href="" title="Buy Now">{t('upgrade_to_plus')}</a>
						</div>
					</div>
					<div className="card-outer card-outer-remove">
						<div className="card">
							<img className="card-image-top" src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/spaceship.svg" title="Ghostery Premium" alt="Ghostery Premium" />
							<h2>{t('panel_detail_premium_title')}</h2>
							<div className="price">
								<p className="price-purple font-size-36">{t('hub_upgrade_ghostery_plus_yearly_price')}</p>
								<p className="price-purple font-size-12">{t('per_month')}</p>
							</div>
							<a className="button button-purple-blue" href="" title="Upgrade to Premium">{t('hub_upgrade_to_premium')}</a>
						</div>
					</div>
				</div>
			</div>

			<div className="comparison-table">
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
										<td className="default"><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_browser_ad_blocking')}</td>
										<td className="default"><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_custom_blocking_preferences')}</td>
										<td className="default"><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_custom_blocking_preferences')}</td>
										<td className="default"><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_historical_extension_stats')}</td>
										<td className="default"><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_application_tracker_blocking')}</td>
										<td className="default"><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_application_ad_blocking')}</td>
										<td className="default"><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_vpn')}</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_no_vpn_logs')}</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_P2P_support')}</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_IPV6_leak_protection')}</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_physical_servers')}</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>{t('hub_upgrade_unlimited_bandwidth')}</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>

									<tr>
										<td className="default"><a className="button button-blue" href="" title="Sign Up">{t('hub_upgrade_already_protected')}</a></td>
										<td><a className="button button-gold" href="" title="Buy Now">{t('upgrade_to_plus')}</a></td>
										<td><a className="button button-purple-blue" href="" title="Buy Now">{t('hub_upgrade_to_premium')}</a></td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default UpgradePlanView;
