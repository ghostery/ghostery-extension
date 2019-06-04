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

		let featureType;
		switch (type) {
			case 'anti-tracking':
				featureType = 'anti_tracking';
				break;
			case 'ad-blocking':
				featureType = 'ad_block';
				break;
			case 'smart-blocking':
				featureType = 'smart_block';
				break;
			default:
				featureType = '';
		}

		clickButton({
			feature: `enable_${featureType}`,
			status: active,
			text: this._getAlertText(),
		});
	}

	_getCount() {
		const { active, data, type } = this.props;

		if (!active) {
			return '-';
		}

		if (type === 'anti-tracking') {
			return data && data.totalUnsafeCount || 0;
		} else if (type === 'ad-blocking') {
			return data && data.totalCount || 0;
		} else if (type === 'smart-blocking') {
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
			isSmaller,
			isCondensed,
			tooltipPosition,
			type,
		} = this.props;

		const sharedClassNames = ClassNames({
			active,
			inactive: !active,
			clickable: !cliqzInactive,
			'not-clickable': cliqzInactive,
		});
		const cliqzFeatureClassNames = ClassNames('CliqzFeature', sharedClassNames, {
			normal: !isSmaller && !isCondensed,
			smaller: isSmaller,
			condensed: isCondensed,
		});
		const cliqzFeatureCountClassNames = ClassNames('CliqzFeature__count', sharedClassNames);
		const cliqzFeatureNameClassNames = ClassNames('CliqzFeature__feature-name', sharedClassNames);
		const iconClassNames = ClassNames('CliqzFeature__icon', sharedClassNames, type, 'g-tooltip');

		let localeType = '';
		switch (type) {
			case 'anti-tracking':
				localeType = 'anti_tracking';
				break;
			case 'ad-blocking':
				localeType = 'ad_block';
				break;
			case 'smart-blocking':
				localeType = 'smart_block';
				break;
			default:
				localeType = '';
		}
		const featureName = t(`drawer_title_enable_${localeType}`);

		return (
			<div className={cliqzFeatureClassNames} onClick={this.clickCliqzFeature}>
				<div className={cliqzFeatureCountClassNames}>{this._getCount()}</div>
				<div className={iconClassNames} />
				<div className={cliqzFeatureNameClassNames}>
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
