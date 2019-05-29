/**
 * Cliqz Features Component
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

/**
 * @class Implements rendering and interaction for Cliqz feature icon toggles
 * @memberof PanelBuildingBlocks
 */
class CliqzFeature extends React.Component {
	constructor(props) {
		super(props);

		this.clickCliqzFeature = this.clickCliqzFeature.bind(this);
	}

	/**
	 * Handles clicks on the Cliqz feature icon, toggling it on/off
	 */
	clickCliqzFeature() {
		const {
			active,
			clickButton,
			cliqzInactive,
			type
		} = this.props;

		if (cliqzInactive) {
			return;
		}

		clickButton({
			feature: `enable_${type}`,
			status: active,
			text: this._getAlertText(),
		});
	}

	_getCount() {
		const { active, data, type } = this.props;

		if (!active) {
			return '-';
		}

		if (type === 'anti_tracking') {
			return data && data.totalUnsafeCount || 0;
		} else if (type === 'ad_block') {
			return data && data.totalCount || 0;
		} else if (type === 'smart_block') {
			return this._count(data, data.blocked) + this._count(data, data.unblocked);
		}

		return 0;
	}
	_count(object, property) {
		return object && this._length(property) || 0;
	}
	_length(object) {
		return Object.keys(object).length;
	}


	_getTooltipBodyText() {
		const { active, isTooltipBody, type } = this.props;

		if (!isTooltipBody) {
			return false;
		}

		return active ?
			t(`tooltip_${type}_body_on`) :
			t(`tooltip_${type}_body`);
	}

	_getTooltipHeaderText() {
		const { isTooltipHeader, type } = this.props;

		if (isTooltipHeader) {
			return false;
		}

		return t(`tooltip_${type}`);
	}

	_getAlertText() {
		const { active, type } = this.props;

		return active ?
			t(`alert_${type}_on`) :
			t(`alert_${type}`);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering a Cliqz Feature icon toggle
	 */
	render() {
		const {
			active,
			cliqzInactive,
			tooltipPosition,
			type
		} = this.props;

		let cssType;
		switch (type) {
			case 'anti_tracking':
				cssType = 'antitrack';
				break;
			case 'ad_block':
				cssType = 'adblock';
				break;
			case 'smart_block':
				cssType = 'smartblock';
				break;
			default:
				cssType = 'check-the-type-props-you-are-passing-to-CliqzFeature';
				break;
		}

		const specificFeatureModifier = `CliqzFeature--${cssType}`;
		const cliqzFeatureClassNames = ClassNames('CliqzFeature', specificFeatureModifier, {
			'CliqzFeature--active': active,
			'CliqzFeature--inactive': !active,
			'CliqzFeature--cliqzInactive': cliqzInactive,
			'CliqzFeature--cliqzActive': !cliqzInactive,
			clickable: !cliqzInactive,
			'not-clickable': cliqzInactive,
		});
		const featureName = t(`drawer_title_enable_${type}`);

		return (
			<div className={cliqzFeatureClassNames} onClick={this.clickCliqzFeature}>
				<div className="CliqzFeature__count">{this._getCount()}</div>
				<div className="CliqzFeature__icon g-tooltip" />
				<div className="CliqzFeature__feature-name">
					{featureName}
				</div>
				<Tooltip
					header={this._getTooltipHeaderText()}
					body={this._getTooltipBodyText()}
					position={tooltipPosition}
				/>
			</div>
		);
	}
}

export default CliqzFeature;
