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

	getCount() {
		const { active, data, type } = this.props;

		if (!active) {
			return '-';
		}

		if (type === 'anti_tracking') {
			return data && data.totalUnsafeCount || 0;
		} else if (type === 'ad_block') {
			return data && data.totalCount || 0;
		} else if (type === 'smart_block') {
			const blockedCount = data && Object.keys(data.blocked).length || 0;
			const unblockedCount = data && Object.keys(data.unblocked).length || 0;
			return blockedCount + unblockedCount;
		}

		return 0;
	}

	getTooltipBodyText() {
		const { active, isTooltipBody, type } = this.props;

		if (!isTooltipBody) {
			return false;
		}

		return active ?
			t(`tooltip_${type}_body_on`) :
			t(`tooltip_${type}_body`);
	}

	getTooltipHeaderText() {
		const { isTooltipHeader, type } = this.props;

		if (isTooltipHeader) {
			return false;
		}

		return t(`tooltip_${type}`);
	}

	getAlertText() {
		const { active, type } = this.props;

		return active ?
			t(`alert_${type}_on`) :
			t(`alert_${type}`);
	}

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
			text: this.getAlertText()
		});
	}

	render() {
		const {
			active,
			cliqzInactive,
			tooltipPosition,
			type
		} = this.props;

		const specificFeatureModifier = `CliqzFeature--${type}`;
		const cliqzFeatureClassNames = ClassNames('CliqzFeature', specificFeatureModifier, {
			active,
			clickable: !cliqzInactive,
			notClickable: cliqzInactive,
		});
		const featureName = t(`drawer_title_${type}`);

		return (
			<div className={cliqzFeatureClassNames} onClick={this.clickCliqzFeature}>
				<div className="CliqzFeature__count">{this.getCount()}</div>
				<div className="CliqzFeature__icon g-tooltip" />
				<div className="CliqzFeature__feature-name">
					{featureName}
				</div>
				<Tooltip
					header={this.getTooltipHeaderText()}
					body={this.getTooltipBodyText()}
					position={tooltipPosition}
				/>
			</div>
		);
	}
}

export default CliqzFeature;
