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
					t('tooltip_trust'));
			case 'restrict':
				return (sitePolicy === BLACKLISTED ?
					t('tooltip_restrict_on') :
					t('tooltip_restrict'));
			default:
				return 'Check button type you are passing to GhosteryFeature for typos and make sure it is being handled by getTooltipText';
		}
	}

	_isFeatureActive(type, sitePolicy) {
		switch (type) {
			case 'trust':
				return sitePolicy === WHITELISTED;
			case 'restrict':
				return sitePolicy === BLACKLISTED;
			default:
				return false;
		}
	}

	render() {
		const {
			blockingPausedOrDisabled,
			narrow,
			short,
			showText,
			sitePolicy,
			tooltipPosition,
			type
		} = this.props;

		const active = this._isFeatureActive(type, sitePolicy);
		// TODO Foundation dependency: button
		const ghosteryFeatureClassNames = ClassNames(
			'button',
			'g-tooltip',
			'GhosteryFeatureButton',
			{
				'GhosteryFeatureButton--normal': !narrow && !short,
				'GhosteryFeatureButton--short': short,
				'GhosteryFeatureButton--narrow': narrow,
				'GhosteryFeatureButton--inactive': !active,
				'GhosteryFeatureButton--active': active,
				trust: type === 'trust',
				restrict: type === 'restrict',
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
}

export default GhosteryFeature;
