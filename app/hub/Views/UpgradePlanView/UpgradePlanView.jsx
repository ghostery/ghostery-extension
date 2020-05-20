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
 * A Functional React component for rendering the Home View
 * @return {JSX} JSX for rendering the Home View of the Hub app
 * @memberof HubComponents
 */
const UpgradePlanView = (props) => {
	const test = '';
	return (
		<section className="pricing-page page-template-page-content-modules ">
			<div className="grid-container show-for-large">
				<div className="row align-center">
					<div className="small-12 text-center columns">
						<h1>Choose the right plan for you</h1>
						<div className="row align-middle toggle-switch">
							<div className="small-12 text-center columns">
								<span>Yearly</span>
								<label className="switch" htmlFor="switch-check">
									<input className="switch-check" type="checkbox" />
									<span className="slider round" />
								</label>
								<span>Monthly</span>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div className="grid-container card-wrapper show-for-large">
				<div className="row align-center text-center" data-equalizer data-equalize-on="medium">
					<div className="card-outer">
						<div className="card" data-equalizer-watch>
							<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/free-image-copy@2x.png" title="Ghostery Free" alt="Ghostery Free" />
							<h2>Ghostery</h2>
							<div className="price">
								<p className="price-blue font-size-36">Free</p>
							</div>
							<a className="button button-blue" href="" title="Sign Up">Sign up</a>
							<p className="card-sub-header"><strong>Basic Protection</strong></p>
							<p className="card-sub-copy">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
								Basic Browser Protection
							</p>
						</div>
					</div>
					<div className="card-outer">
						<div className="card" data-equalizer-watch>
							<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/ghost_plus@2x.png" title="Ghostery Plus" alt="Ghostery Plus" />
							<h2>Ghostery Plus</h2>
							<div className="price">
								<p className="price-gold price-yearly active font-size-36">3.99</p>
								<p className="price-gold price-monthly font-size-36">4.99</p>
								<p className="price-gold font-size-12">per month</p>
							</div>
							<a className="button button-gold" href="" title="Buy Now">Buy now</a>
							<p className="card-sub-header"><strong>Additional Protection</strong></p>
							<p className="card-sub-copy">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
								Basic Browser Protection
							</p>
							<p className="card-sub-copy">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
								Advanced Device Protection
							</p>
						</div>
					</div>
					<div className="card-outer card-outer-remove">
						<div className="card" data-equalizer-watch>
							<img className="card-image-top" src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/spaceship.svg" title="Ghostery Premium" alt="Ghostery Premium" />
							<h2>Ghostery Premium</h2>
							<div className="price">
								<p className="price-purple price-yearly active font-size-36">$8.99</p>
								<p className="price-purple price-monthly font-size-36">$11.99</p>
								<p className="price-purple font-size-12">per month</p>
							</div>
							<a className="button button-purple-blue" href="" title="Buy Now">Buy Now</a>
							<p className="card-sub-header"><strong>Maximum Protection</strong></p>
							<p className="card-sub-copy">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
								Basic Browser Protection
							</p>
							<p className="card-sub-copy">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
								Advanced Device Protection
							</p>
							<p className="card-sub-copy">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
								VPN
							</p>
						</div>
					</div>
				</div>
				<div className="row align-center module-editor text-center">
					<div className="columns text-center">
						<span className="learn-more learn-more-to-full-list">Check out the full list of features</span>
						<div className="arrow learn-more learn-more-to-full-list" />
					</div>
				</div>
			</div>

			<div className="grid-container card-wrapper hide-for-large">
				<div className="row align-center">
					<div className="small-12 text-center columns">
						<h1>Choose the right plan for you</h1>
					</div>
				</div>
				<div className="row align-center">
					<div className="columns shrink text-center">
						<ul className="tiers-group tabs menu align-center" data-tabs id="price-tabs">
							<li className="tabs-title is-active"><a href="#panel1">Free</a></li>
							<li className="tabs-title"><a href="#panel2">Plus</a></li>
							<li className="tabs-title"><a href="#panel3">Premium</a></li>
						</ul>
					</div>
				</div>

				<div className="tabs-content" data-tabs-content="price-tabs">
					<div className="tabs-panel is-active" id="panel1">
						<div className="card-outer">
							<div className="card">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/free-image-copy@2x.png" title="Ghostery Free" alt="Ghostery Free" />
								<h2>Ghostery</h2>
								<div className="price">
									<p className="price-blue font-size-36">Free</p>
								</div>
								<a className="button button-blue" href="" title="Sign Up">Free</a>
								<p className="card-sub-header"><strong>Basic Protection</strong></p>
								<p className="card-sub-copy">
									<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
									Basic Browser Protection
								</p>
							</div>
						</div>
					</div>
					<div className="tabs-panel" id="panel2">
						<div className="card-outer">
							<div className="card">
								<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/ghost_plus@2x.png" title="Ghostery Plus" alt="Ghostery Plus" />
								<h2>Ghostery Plus</h2>
								<div className="price">
									<p className="price-gold price-yearly active font-size-36">$3.99</p>
									<p className="price-gold price-monthly font-size-36">$4.99</p>
									<p className="price-gold font-size-12">per month</p>
								</div>
								<div className="row collapse align-middle toggle-switch">
									<div className="small-12 text-center columns">
										<span>Yearly</span>
										<label className="switch" htmlFor="switch-check">
											<input className="switch-check" type="checkbox" />
											<span className="slider round" />
										</label>
										<span>Monthly</span>
									</div>
								</div>
								<a className="button button-gold" href="" title="Buy Now">Buy now</a>
								<p className="card-sub-header"><strong>Additional Protection</strong></p>
								<p className="card-sub-copy">
									<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
									Basic Browser Protection
								</p>
								<p className="card-sub-copy">
									<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
									Advanced Device Protection
								</p>
							</div>
						</div>
					</div>
					<div className="tabs-panel" id="panel3">
						<div className="card-outer card-outer-remove">
							<div className="card">
								<img className="card-image-top" src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/spaceship.svg" title="Ghostery Premium" alt="Ghostery Premium" />
								<h2>Ghostery Premium</h2>
								<div className="price">
									<p className="price-purple price-yearly active font-size-36">$8.99</p>
									<p className="price-purple price-monthly font-size-36">$11.99</p>
									<p className="price-purple font-size-12">per month</p>
								</div>
								<div className="row collapse align-middle toggle-switch">
									<div className="small-12 text-center columns">
										<span>Yearly</span>
										<label className="switch" htmlFor="switch-check">
											<input className="switch-check" type="checkbox" />
											<span className="slider round" />
										</label>
										<span>Monthly</span>
									</div>
								</div>
								<a className="button button-purple-blue" href="" title="Buy Now">Buy now</a>
								<p className="card-sub-header"><strong>Maximum Protection</strong></p>
								<p className="card-sub-copy">
									<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
									Basic Browser Protection
								</p>
								<p className="card-sub-copy">
									<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
									Advanced Device Protection
								</p>
								<p className="card-sub-copy">
									<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" />
									VPN
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="slider-prices">
					<div className="card-outer">
						<div className="card">
							<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/free-image-copy@2x.png" title="Ghostery Free" alt="Ghostery Free" />
							<h2>Ghostery</h2>
							<div className="price">
								<p className="price-blue font-size-36">Free</p>
							</div>
							<a className="button button-blue" href="" title="Sign Up">Free</a>
						</div>
					</div>
					<div className="card-outer">
						<div className="card">
							<img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/ghost_plus@2x.png" title="Ghostery Plus" alt="Ghostery Plus" />
							<h2>Ghostery Plus</h2>
							<div className="price">
								<p className="price-gold font-size-36">$3.99</p>
								<p className="price-gold font-size-12">per month</p>
							</div>
							<a className="button button-gold" href="" title="Buy Now">Buy now</a>
						</div>
					</div>
					<div className="card-outer card-outer-remove">
						<div className="card">
							<img className="card-image-top" src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/spaceship.svg" title="Ghostery Premium" alt="Ghostery Premium" />
							<h2>Ghostery Premium</h2>
							<div className="price">
								<p className="price-purple font-size-36">$8..99</p>
								<p className="price-purple font-size-12">per month</p>
							</div>
							<a className="button button-purple-blue" href="" title="Buy Now">Buy now</a>
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
									<button type="button">Ghostery</button>
								</li>
								<li className="bg-gold">
									<button type="button">Ghostery Plus</button>
								</li>
								<li className="bg-purple-blue">
									<button type="button">Ghostery Premium</button>
								</li>
							</ul>

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
									<tr>
										<td>Browser Tracker Blocking</td>
										<td className="default"><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>Browser Ad Blocking</td>
										<td className="default"><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>Custom Blocking Preferences</td>
										<td className="default"><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>Extension Themes</td>
										<td className="default"><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>Historical Extension Stats</td>
										<td className="default"><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>Application Tracker Blocking</td>
										<td className="default"><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>Application Ad Blocking</td>
										<td className="default"><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>VPN</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>No VPN Logs</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>P2P Support</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>IPV6 Leak Protection</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>Physical Servers</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>
									<tr>
										<td>Unlimited Bandwith</td>
										<td className="default"><span className="tick" /></td>
										<td><span className="tick" /></td>
										<td><img src="<?php bloginfo('template_url'); ?>/images/campaigns/tier-pricing/checkmark.png" title="Ghostery Check" alt="Ghostery Check" /></td>
									</tr>

									<tr>
										{/* <td></td> */}
										<td className="default"><a className="button button-blue" href="" title="Sign Up">Free</a></td>
										<td><a className="button button-gold" href="" title="Buy Now">Buy Now</a></td>
										<td><a className="button button-purple-blue" href="" title="Buy Now">Buy Now</a></td>
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
