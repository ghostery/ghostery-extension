/**
 * Ghostery Features Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Component } from 'react';
import ClassNames from 'classnames';
import Tooltip from '../Tooltip';

/**
 * @class Implements buttons to render and toggle for Ghostery's features on/off.
 * @memberof PanelClasses
 */
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
	 * Handles the click event for the Trust Site button
	 */
	clickTrustButton() {
		if (this.props.isInactive) {
			return;
		}
		this.props.clickButton('trust');
	}

	/**
	 * Handles the click event for the Custom Settings button
	 */
	clickCustomButton() {
		if (this.props.isInactive) {
			return;
		}
		this.props.clickButton('custom');
	}

	/**
	 * Handles the click event for the Restrict Site button
	 */
	clickRestrictButton() {
		if (this.props.isInactive) {
			return;
		}
		this.props.clickButton('restrict');
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
			'button-left': !isStacked,
			'button-top': isStacked,
			condensed: isCondensed,
			active: sitePolicy === 2,
			clickable: !isInactive,
			'not-clickable': isInactive,
		});
		const customClassNames = ClassNames('button', 'button-custom', 'g-tooltip', {
			'button-center': true,
			condensed: isCondensed,
			active: !sitePolicy,
			clickable: !isInactive,
			'not-clickable': isInactive,
		});
		const restrictClassNames = ClassNames('button', 'button-restrict', 'g-tooltip', {
			'button-right': !isStacked,
			'button-bottom': isStacked,
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
						<Tooltip header={(sitePolicy === 2) ? t('tooltip_trust_on') : t('tooltip_trust')} position={(isStacked) ? 'right' : 'top'} />
					</div>
					<div className={customClassNames} onClick={this.clickCustomButton}>
						<span className="flex-container align-center-middle full-height">
							<span className="button-text">
								{t('summary_custom_settings')}
							</span>
						</span>
						<Tooltip header={t('tooltip_custom_settings')} position={(isStacked) ? 'right' : 'top'} />
					</div>
					<div className={restrictClassNames} onClick={this.clickRestrictButton}>
						<span className="flex-container align-center-middle full-height">
							<span className="button-text">
								{this.getRestrictText()}
							</span>
						</span>
						<Tooltip header={(sitePolicy === 1) ? t('tooltip_restrict_on') : t('tooltip_restrict')} position={(isStacked) ? 'right' : 'top'} />
					</div>
				</div>
			</div>
		);
	}
}

export default GhosteryFeatures;
