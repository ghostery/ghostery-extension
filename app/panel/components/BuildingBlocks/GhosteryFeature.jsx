/**
 * Ghostery Feature Component
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
import Tooltip from '../Tooltip';
import globals from '../../../../src/classes/Globals';

const { BLACKLISTED, WHITELISTED } = globals;

/**
 * @class Rendering and interaction for Ghostery feature button toggles
 * @memberof PanelBuildingBlocks
 */
class GhosteryFeature extends React.Component {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	/**
	 * Handles user click on the Ghostery Feature button
	 */
	handleClick() {
		if (this.props.blockingPausedOrDisabled) {
			return;
		}

		this.props.handleClick(this.props.type);
	}

	_getButtonText(sitePolicy, showText, type) {
		if (!showText) {
			return '';
		}

		switch (type) {
			case 'trust':
				return (sitePolicy === WHITELISTED ?
					t('summary_trust_site_active') :
					t('summary_trust_site'));
			case 'restrict':
				return (sitePolicy === BLACKLISTED ?
					t('summary_restrict_site_active') :
					t('summary_restrict_site'));
			default:
				return 'Check button type you are passing to GhosteryFeature for typos and make sure it is being handled by getButtonText';
		}
	}

	_getTooltipText(sitePolicy, type) {
		switch (type) {
			case 'trust':
				return (sitePolicy === WHITELISTED ?
					t('tooltip_trust_on') :
					t('tooltip_trust_off'));
			case 'restrict':
				return (sitePolicy === BLACKLISTED ?
					t('tooltip_restrict_on') :
					t('tooltip_restrict'));
			default:
				return 'Check button type you are passing to GhosteryFeature for typos and make sure it is being handled by getTooltipText';
		}
	}

	_trustActive() {
		const { type, sitePolicy } = this.props;

		return (type === 'trust' && sitePolicy === WHITELISTED);
	}

	_restrictActive() {
		const { type, sitePolicy } = this.props;

		return (type === 'restrict' && sitePolicy === BLACKLISTED);
	}

	render() {
		const {
			blockingPausedOrDisabled,
			sitePolicy,
			showText,
			tooltipPosition,
			type
		} = this.props;

		const active = this._trustActive() || this._restrictActive();
		// TODO Foundation dependency: button
		const ghosteryFeatureClassNames = ClassNames(
			'button',
			'g-tooltip',
			'GhosteryFeatureButton',
			'GhosteryFeatureButton--FoundationButtonOverrides',
			{
				'GhosteryFeatureButton--inactive': !active,
				'GhosteryFeatureButton--active': active,
				'GhosteryFeatureButton--trust': type === 'trust',
				'GhosteryFeatureButton--restrict': type === 'restrict',
				'GhosteryFeatureButton--blockingPausedOrDisabled': blockingPausedOrDisabled,
				clickable: !blockingPausedOrDisabled,
				'not-clickable': blockingPausedOrDisabled,
			}
		);

		// TODO Foundation dependency: flex-container, align-center-middle
		return (
			<div className={ghosteryFeatureClassNames} onClick={this.handleClick}>
				<span className="flex-container align-center-middle full-height">
					<span className="GhosteryFeatureButton__text">
						{this._getButtonText(sitePolicy, showText, type)}
					</span>
				</span>
				<Tooltip body={this._getTooltipText(sitePolicy, type)} position={tooltipPosition} />
			</div>
		);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Ghostery Features portion of the Summary View
	 */
	/*
	render() {
		const {
			isAbPause,
			isInactive,
			isStacked,
			isCondensed,
			sitePolicy
		} = this.props;

		const buttonGroupClassNames = ClassNames('button-group', {
			inactive: isInactive,
			stacked: isStacked,
		});
		const trustClassNames = ClassNames('button', 'button-trust', 'g-tooltip', {
			'ab-pause': isAbPause,
			'button-left': isAbPause && !isStacked,
			'button-top': (isAbPause || isCondensed) && isStacked,
			condensed: isCondensed,
			active: sitePolicy === 2,
			clickable: !isInactive,
			'not-clickable': isInactive,
		});
		const customClassNames = ClassNames('button', 'button-custom', 'g-tooltip', {
			'ab-pause': isAbPause,
			'button-center': isAbPause && true,
			condensed: isCondensed,
			active: !sitePolicy,
			clickable: !isInactive,
			'not-clickable': isInactive,
		});
		const restrictClassNames = ClassNames('button', 'button-restrict', 'g-tooltip', {
			'ab-pause': isAbPause,
			'button-right': isAbPause && !isStacked,
			'button-bottom': isAbPause && isStacked,
			'button-center': !isAbPause && isCondensed && isStacked,
			condensed: isCondensed,
			active: sitePolicy === 1,
			clickable: !isInactive,
			'not-clickable': isInactive,
		});

		return (
			<div className="sub-component ghostery-features">
				<div className={buttonGroupClassNames}>
					<div className={trustClassNames} onClick={this.clickTrustButton}>
						<span className="flex-container align-center-middle full-height">
							<span className="button-text">
								{this.getTrustText()}
							</span>
						</span>
						<Tooltip body={(sitePolicy === 2) ? t('tooltip_trust_on') : t('tooltip_trust')} position={(isStacked) ? 'right' : 'top'} />
					</div>
					{isAbPause && (
						<div className={customClassNames} onClick={this.clickCustomButton}>
							<span className="flex-container align-center-middle full-height">
								<span className="button-text">
									{t('summary_custom_settings')}
								</span>
							</span>
							<Tooltip body={t('tooltip_custom_settings')} position={(isStacked) ? 'right' : 'top'} />
						</div>
					)}
					<div className={restrictClassNames} onClick={this.clickRestrictButton}>
						<span className="flex-container align-center-middle full-height">
							<span className="button-text">
								{this.getRestrictText()}
							</span>
						</span>
						<Tooltip body={(sitePolicy === 1) ? t('tooltip_restrict_on') : t('tooltip_restrict')} position={(isStacked) ? 'right' : 'top'} />
					</div>
				</div>
			</div>
		);
	}
	 */
}

export default GhosteryFeature;
