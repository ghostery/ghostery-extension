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

	_getButtonText() {
		const { sitePolicy, showText, type } = this.props;

		if (!showText) {
			return '';
		}

		switch (type) {
			case 'trust':
				return (sitePolicy === globals.SITE_POLICY__WHITELISTED ?
					t('summary_trust_site_active') :
					t('summary_trust_site'));
			case 'restrict':
				return (sitePolicy === globals.SITE_POLICY__BLACKLISTED ?
					t('summary_restrict_site_active') :
					t('summary_restrict_site'));
			default:
				return 'Check button type you are passing to GhosteryFeature for typos and make sure it is being handled by getButtonText';
		}
	}

	_getTooltipText() {
		const { sitePolicy, type } = this.props;

		switch (type) {
			case 'trust':
				return (sitePolicy === globals.SITE_POLICY__WHITELISTED ?
					t('tooltip_trust_on') :
					t('tooltip_trust_off'));
			case 'restrict':
				return (sitePolicy === globals.SITE_POLICY__BLACKLISTED ?
					t('tooltip_restrict_on') :
					t('tooltip_restrict'));
			default:
				return 'Check button type you are passing to GhosteryFeature for typos and make sure it is being handled by getTooltipText';
		}
	}

	render() {
		const {
			blockingPausedOrDisabled,
			sitePolicy,
			tooltipPosition,
			type
		} = this.props;

		const typeModifier = `GhosteryFeatureButton--${type}`;
		const active = (type === 'trust' && sitePolicy === 2) || (type === 'restrict' && sitePolicy === 1);
		const ghosteryFeatureClassNames = ClassNames('GhosteryFeatureButton', { typeModifier }, {
			'GhosteryFeatureButton--active': active,
			clickable: !blockingPausedOrDisabled,
			notClickable: blockingPausedOrDisabled,
		});

		return (
			<div className={ghosteryFeatureClassNames} onClick={this.handleClick}>
				<span className="flex-container align-center-middle full-height">
					<span className="GhosteryFeatureButton__text">
						{this._getButtonText()}
					</span>
				</span>
				<Tooltip body={this._getTooltipText()} position={tooltipPosition} />
			</div>
		);
	}
}

export default GhosteryFeature;
