/**
 * Cliqz Features Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Component } from 'react';
import ClassNames from 'classnames';
import Tooltip from '../Tooltip';

/**
 * @class Implements buttons to render and toggle for Cliqz's features on/off.
 * @memberof PanelClasses
 */
class CliqzFeatures extends React.Component {
	constructor(props) {
		super(props);

		// Event Bindings
		this.getAntiTrackingTotal = this.getAntiTrackingTotal.bind(this);
		this.getAdBlockingTotal = this.getAdBlockingTotal.bind(this);
		this.getSmartBlockingTotal = this.getSmartBlockingTotal.bind(this);
		this.clickAntiTracking = this.clickAntiTracking.bind(this);
		this.clickAdBlocking = this.clickAdBlocking.bind(this);
		this.clickSmartBlocking = this.clickSmartBlocking.bind(this);
	}

	/**
	 * Calculates the text for above the Ad Blocking feature icon
	 * @return {String or Int} The text for above the Ad Blocking icon
	 */
	getAdBlockingTotal() {
		if (!this.props.adBlockingActive) {
			return '-';
		}
		return this.props.adBlocking && this.props.adBlocking.totalCount || 0;
	}

	/**
	 * Calculates the text for above the Smart Blocking feature icon
	 * @return {String or Int} The text for above the Smart Blocking icon
	 */
	getSmartBlockingTotal() {
		if (!this.props.smartBlockingActive) {
			return '-';
		}
		const blockedCount = this.props.smartBlocking && Object.keys(this.props.smartBlocking.blocked).length || 0;
		const unblockedCount = this.props.smartBlocking && Object.keys(this.props.smartBlocking.unblocked).length || 0;

		return blockedCount + unblockedCount;
	}

	/**
	 * Calculates the text for above the Anti Tracking feature icon
	 * @return {String or Int} The text for above the Anit Tracking icon
	 */
	getAntiTrackingTotal() {
		if (!this.props.antiTrackingActive) {
			return '-';
		}
		let antiTrackingTotal = 0;
		for (const category in this.props.antiTracking) {
			if (this.props.antiTracking.hasOwnProperty(category)) {
				for (const app in this.props.antiTracking[category]) {
					if (this.props.antiTracking[category][app] === 'unsafe') {
						antiTrackingTotal++;
					}
				}
			}
		}
		return antiTrackingTotal;
	}

	/**
	 * Handles the click event for the AdBlocking button
	 */
	clickAdBlocking() {
		if (this.props.isInactive) {
			return;
		}
		this.props.clickButton('enable_ad_block', this.props.adBlockingActive);
	}

	/**
	 * Handles the click event for the SmartBlocking button
	 */
	clickSmartBlocking() {
		if (this.props.isInactive) {
			return;
		}
		this.props.clickButton('enable_smart_block', this.props.smartBlockingActive);
	}

	/**
	 * Handles the click event for the AntiTracking button
	 */
	clickAntiTracking() {
		if (this.props.isInactive) {
			return;
		}
		this.props.clickButton('enable_anti_tracking', this.props.antiTrackingActive);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Cliqz Features portion of the Summary View
	 */
	render() {
		const showBody = true; // ToDo: use this later
		const { isCondensed, isInactive } = this.props;

		const cliqzFeaturesClassNames = ClassNames('sub-component', 'cliqz-features', {
			condensed: isCondensed,
			inactive: isInactive,
		});
		const antiTrackingClassNames = ClassNames('anti-tracking', 'cliqz-feature', {
			active: this.props.antiTrackingActive,
			clickable: !isInactive,
			'not-clickable': isInactive,
		});
		const adBlockingClassNames = ClassNames('ad-blocking', 'cliqz-feature', {
			active: this.props.adBlockingActive,
			clickable: !isInactive,
			'not-clickable': isInactive,
		});
		const smartBlockingClassNames = ClassNames('smart-blocking', 'cliqz-feature', {
			active: this.props.smartBlockingActive,
			clickable: !isInactive,
			'not-clickable': isInactive,
		});

		return (
			<div className={cliqzFeaturesClassNames}>
				<div className={antiTrackingClassNames} onClick={this.clickAntiTracking}>
					<div className="count">{this.getAntiTrackingTotal()}</div>
					<div className="icon g-tooltip">
						<Tooltip
							header={t('tooltip_anti_track')}
							body={showBody && t('tooltip_anti_track_body')}
							position={isCondensed ? 'top top-right' : 'top'}
						/>
					</div>
					<div className="feature-name">
						{ t('drawer_title_enable_anti_tracking') }
					</div>
				</div>
				<div className={adBlockingClassNames} onClick={this.clickAdBlocking}>
					<div className="count">{this.getAdBlockingTotal()}</div>
					<div className="icon g-tooltip">
						<Tooltip
							header={t('tooltip_ad_block')}
							body={showBody && t('tooltip_ad_block_body')}
							position="top"
						/>
					</div>
					<div className="feature-name">
						{ t('drawer_title_enable_ad_block') }
					</div>
				</div>
				<div className={smartBlockingClassNames} onClick={this.clickSmartBlocking}>
					<div className="count">{this.getSmartBlockingTotal()}</div>
					<div className="icon g-tooltip">
						<Tooltip
							header={t('tooltip_smart_block')}
							body={showBody && t('tooltip_smart_block_body')}
							position={isCondensed ? 'top top-left' : 'top'}
						/>
					</div>
					<div className="feature-name">
						{ t('drawer_title_enable_smart_block') }
					</div>
				</div>
			</div>
		);
	}
}

export default CliqzFeatures;
