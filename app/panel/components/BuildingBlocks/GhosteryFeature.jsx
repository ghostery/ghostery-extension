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

/**
 * @class Rendering and interaction for Ghostery feature button toggles
 * @memberof PanelBuildingBlocks
 */
class GhosteryFeature extends React.Component {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		if (this.props.blockingPausedOrDisabled) {
			return;
		}

		this.props.handleClick(this.props.type);
	}

	render() {
		const {
			blockingPausedOrDisabled,
			sitePolicy,
			type
		} = this.props;

		const typeModifier = `GhosteryFeatureButton--${type}`;
		const active = (type === 'trust' && sitePolicy === 2) || (type === 'restrict' && sitePolicy === 1);
		const ghosteryFeatureClassNames = ClassNames('GhosteryFeatureButton', {typeModifier}, {
			'GhosteryFeatureButton--active': active,
			clickable: !blockingPausedOrDisabled,
			notClickable: blockingPausedOrDisabled,
		});

		return (
			<div className={ghosteryFeatureClassNames} onClick={this.handleClick}>
				<span className="GhosteryFeatureButton__text">
					{text}
				</span>
			</div>
		)
	})

		return (
			<div className={trustClassNames} onClick={this.clickTrustButton}>
				<span className="flex-container align-center-middle full-height">
					<span className="button-text">
						{this.getTrustText()}
					</span>
				</span>
				<Tooltip body={(sitePolicy === 2) ? t('tooltip_trust_on') : t('tooltip_trust')} position={(isStacked) ? 'right' : 'top'} />
			</div>
			<div className={restrictClassNames} onClick={this.clickRestrictButton}>
				<span className="flex-container align-center-middle full-height">
					<span className="button-text">
						{this.getRestrictText()}
					</span>
				</span>
				<Tooltip body={(sitePolicy === 1) ? t('tooltip_restrict_on') : t('tooltip_restrict')} position={(isStacked) ? 'right' : 'top'} />
			</div>
		);
	}
}

class GhosteryFeatures extends React.Component {
	constructor(props) {
		super(props);

		// Event Bindings
		this.clickTrustButton = this.clickTrustButton.bind(this);
		this.clickCustomButton = this.clickCustomButton.bind(this);
		this.clickRestrictButton = this.clickRestrictButton.bind(this);
		this.getTrustText = this.getTrustText.bind(this);
		this.getRestrictText = this.getRestrictText.bind(this);
	}

	/**
	 * Gets the text for the Trust Button under different conditions
	 * @return {String} The text for the Trust Button as a string
	 */
	getTrustText() {
		if (this.props.isCondensed) {
			return '';
		} else if (this.props.sitePolicy === 2) {
			return t('summary_trust_site_active');
		}
		return t('summary_trust_site');
	}

	/**
	 * Gets the text for the Restrict Button under different conditions
	 * @return {String} The text for the Restrict Button as a string
	 */
	getRestrictText() {
		if (this.props.isCondensed) {
			return '';
		} else if (this.props.sitePolicy === 1) {
			return t('summary_restrict_site_active');
		}
		return t('summary_restrict_site');
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Ghostery Features portion of the Summary View
	 */
	render() {
		const {
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
			'button-top': isCondensed && isStacked,
			condensed: isCondensed,
			active: sitePolicy === 2,
			clickable: !isInactive,
			'not-clickable': isInactive,
		});
		const restrictClassNames = ClassNames('button', 'button-restrict', 'g-tooltip', {
			'button-center': isCondensed && isStacked,
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
}

export default GhosteryFeatures;
