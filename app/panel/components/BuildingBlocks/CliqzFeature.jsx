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

	_getStatus(active) {
		const { current_theme } = this.props;
		switch (current_theme) {
			case 'palm-theme':
				return active ? t('on') : (<div className="rectangle" />);
			default:
				return active ? t('on') : t('off');
		}
	}

	_getTooltipBodyText(active, isTooltipBody, type) {
		if (!isTooltipBody) return false;

		if (active) {
			switch (type) {
				case 'ad_block':
					return t('tooltip_ad_block_on');
				case 'anti_track':
					return t('tooltip_anti_track_on');
				case 'smart_block':
					return t('tooltip_smart_block_on');
				default:
					return false;
			}
		} else {
			switch (type) {
				case 'ad_block':
					return t('ad_blocking_DESC');
				case 'anti_track':
					return t('anti_tracking_DESC');
				case 'smart_block':
					return t('smart_blocking_DESC');
				default:
					return false;
			}
		}
	}

	_getTooltipHeaderText(isTooltipHeader, type) {
		if (!isTooltipHeader) return false;

		switch (type) {
			case 'ad_block':
				return t('enhanced_ad_blocking');
			case 'anti_track':
				return t('enhanced_anti_tracking');
			case 'smart_block':
				return t('smart_blocking');
			default:
				return false;
		}
	}

	_getAlertText(active, type) {
		return active ?
			t(`alert_${type}_off`) :
			t(`alert_${type}_on`);
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
			isTiny,
			isTooltipBody,
			isTooltipHeader,
			tooltipPosition,
			type,
			current_theme,
		} = this.props;

		const cliqzFeatureClassNames = ClassNames('CliqzFeature', {
			'CliqzFeature--normal': !isSmaller && !isCondensed,
			'CliqzFeature--smaller': isSmaller,
			'CliqzFeature--condensed': isCondensed,
			'CliqzFeature--tiny': isTiny,
			'CliqzFeature--active': active,
			'CliqzFeature--inactive': !active,
			clickable: !cliqzInactive,
			'not-clickable': cliqzInactive,
		});
		const cssTypeName = `CliqzFeature__icon--${type.replace('_', '-')}`;
		const iconClassNames = ClassNames('CliqzFeature__icon', cssTypeName, 'g-tooltip');

		const featureType = type === 'anti_track' ? 'anti_tracking' : type;
		let featureName;
		if (featureType === 'anti_tracking') {
			featureName = t('enhanced_anti_tracking');
		} else if (featureType === 'ad_block') {
			featureName = t('enhanced_ad_blocking');
		} else if (featureType === 'smart_block') {
			featureName = t('smart_blocking');
		}

		return (
			<div className={cliqzFeatureClassNames} onClick={this.clickCliqzFeature}>
				<div className="CliqzFeature__status">{this._getStatus(active)}</div>
				<div className={iconClassNames}>
					<Tooltip
						header={this._getTooltipHeaderText(isTooltipHeader, type)}
						body={this._getTooltipBodyText(active, isTooltipBody, type)}
						position={tooltipPosition}
						// className={isTiny ? 'CliqzFeature--tooltipUp' : ''}
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
