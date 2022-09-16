/**
 * Common Features Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

/**
 * @class Implements rendering and interaction for Common feature icon toggles
 * @memberof PanelBuildingBlocks
 */
class CommonFeature extends React.Component {
	constructor(props) {
		super(props);

		this.clickCommonFeature = this.clickCommonFeature.bind(this);
	}

	static _getStatus(active) {
		return active ? t('on') : t('off');
	}

	static _getAlertText(active, type) {
		return active ?
			t(`alert_${type}_off`) :
			t(`alert_${type}_on`);
	}

	/**
	 * Handles clicks on the Common feature icon, toggling it on/off
	 */
	clickCommonFeature() {
		const {
			active,
			clickButton,
			commonInactive,
			type
		} = this.props;

		if (commonInactive) {
			return;
		}

		const featureType = type === 'anti_track' ? 'anti_tracking' : type;

		clickButton({
			feature: `enable_${featureType}`,
			status: active,
			text: CommonFeature._getAlertText(active, type),
		});
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering a Common Feature icon toggle
	 */
	render() {
		const {
			active,
			commonInactive,
			isSmaller,
			isCondensed,
			isTiny,
			type,
		} = this.props;

		const commonFeatureClassNames = ClassNames('CommonFeature', {
			'CommonFeature--normal': !isSmaller && !isCondensed,
			'CommonFeature--smaller': isSmaller,
			'CommonFeature--condensed': isCondensed,
			'CommonFeature--tiny': isTiny,
			'CommonFeature--active': active,
			'CommonFeature--inactive': !active,
			clickable: !commonInactive,
			'not-clickable': commonInactive,
		});
		const cssTypeName = `CommonFeature__icon--${type.replace('_', '-')}`;
		const iconClassNames = ClassNames('CommonFeature__icon', cssTypeName, 'g-tooltip');

		const featureType = type === 'anti_track' ? 'anti_tracking' : type;
		let featureName;
		if (featureType === 'anti_tracking') {
			featureName = t('enhanced_anti_tracking');
		} else if (featureType === 'ad_block') {
			featureName = t('enhanced_ad_blocking');
		} if (featureType === 'autoconsent') {
			featureName = t('enhanced_autoconsent');
		} else if (featureType === 'smart_block') {
			featureName = t('smart_blocking');
		}

		return (
			<div className={commonFeatureClassNames} onClick={this.clickCommonFeature}>
				<div className="CommonFeature__status">{CommonFeature._getStatus(active)}</div>
				<div className={iconClassNames} />
				<div className="CommonFeature__feature-name">
					{featureName}
				</div>
			</div>
		);
	}
}

CommonFeature.propTypes = {
	clickButton: PropTypes.func.isRequired,
	type: PropTypes.oneOf([
		'anti_track',
		'ad_block',
		'smart_block',
		'autoconsent',
	]).isRequired,
	active: PropTypes.bool,
	commonInactive: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.number,
	]).isRequired,
	isSmaller: PropTypes.bool.isRequired,
	isCondensed: PropTypes.bool,
};

CommonFeature.defaultProps = {
	active: true,
	isCondensed: false,
};

export default CommonFeature;
