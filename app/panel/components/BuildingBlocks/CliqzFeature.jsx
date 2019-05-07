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

/**
 * @class Implements rendering and interaction for Cliqz feature icon toggles
 * @memberof PanelBuildingBlocks
 */

class CliqzFeature extends React.Component {
	constructor(props) {
		super(props);

		// Event Bindings
		this.getCount = this.getCount.bind(this);
		this.clickCliqzFeature = this.clickCliqzFeature.bind(this);
	}

	getCount() {
		if (!this.props.active) {
			return '-';
		}

		let blockedCount;
		let unblockedCount;
		switch (this.props.feature) {
			case 'enable_anti_tracking':
				return this.props.data && this.props.data.totalUnsafeCount || 0;
			case 'enable_ad_block':
				return this.props.data && this.props.data.totalCount || 0;
			case 'enable_smart_block':
				blockedCount = this.props.data && Object.keys(this.props.data.blocked).length || 0;
				unblockedCount = this.props.data && Object.keys(this.props.data.unblocked).length || 0;
				return blockedCount + unblockedCount;
			default:
				return 0;
		}
	}

	clickCliqzFeature() {
		if (this.props.cliqzInactive) {
			return;
		}

		this.props.clickButton({
			feature: this.props.type,
			status: this.props.active,
			text: !this.props.active ? t(this.props.onLocaleKey) : t(this.props.offLocaleKey)
		});
	}

	render() {
		const specificFeatureModifier = `CliqzFeature--${this.props.feature}`;
		const cliqzFeatureClassNames = ClassNames('CliqzFeature', specificFeatureModifier, {
			active: this.props.active,
			clickable: !this.props.cliqzInactive,
			notClickable: this.props.cliqzInactive,
		})
		const featureName = `drawer_title_${this.props.feature}`;
		return (
			<div className={cliqzFeatureClassNames} onClick={this.clickCliqzFeature}>
				<div className="CliqzFeature__count">{this.getCount()}</div>
				<div className="CliqzFeature__icon g-tooltip"></div>
				<div className="CliqzFeature__feature-name">
					{ t({ featureName }) }
				</div>
			</div>
		);
	}
}

export default CliqzFeature;
