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

		const featureType = type === 'anti_track' ? 'anti_tracking' : type;

		clickButton({
			feature: `enable_${featureType}`,
			status: active,
			text: this._getAlertText(active, type),
		});
	}

	_getCount(active, data, type) {
		if (!active) {
			return '-';
		}

		if (type === 'anti_track') {
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


	_getTooltipBodyText(active, isTooltipBody, type) {
		if (!isTooltipBody) return false;

		return active ?
			t(`tooltip_${type}_body_on`) :
			t(`tooltip_${type}_body`);
	}

	_getTooltipHeaderText(isTooltipHeader, type) {
		return isTooltipHeader ? t(`tooltip_${type}`) : false;
	}

	_getAlertText(active, type) {
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
			data,
			isSmaller,
			isCondensed,
			isTooltipBody,
			isTooltipHeader,
			tooltipPosition,
			type,
		} = this.props;

		const cliqzFeatureClassNames = ClassNames('CliqzFeature', {
			'CliqzFeature--normal': !isSmaller && !isCondensed,
			'CliqzFeature--smaller': isSmaller,
			'CliqzFeature--condensed': isCondensed,
			'CliqzFeature--active': active,
			'CliqzFeature--inactive': !active,
			clickable: !cliqzInactive,
			'not-clickable': cliqzInactive,
		});
		const cssTypeName = `CliqzFeature__icon--${type.replace('_', '-')}`;
		const iconClassNames = ClassNames('CliqzFeature__icon', cssTypeName, 'g-tooltip');

		const featureType = type === 'anti_track' ? 'anti_tracking' : type;
		const featureName = t(`drawer_title_enable_${featureType}`);

		return (
			<div className={cliqzFeatureClassNames} onClick={this.clickCliqzFeature}>
				<div className="CliqzFeature__count">{this._getCount(active, data, type)}</div>
				<div className={iconClassNames}>
					<Tooltip
						header={this._getTooltipHeaderText(isTooltipHeader, type)}
						body={this._getTooltipBodyText(active, isTooltipBody, type)}
						position={tooltipPosition}
					/>
				</div>
				<div className="CliqzFeature__feature-name">
					{featureName}
				</div>
			</div>
		);
	}
}

export default CliqzFeature;
