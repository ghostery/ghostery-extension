/**
 * Plus View Component
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

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import globals from '../../../../src/classes/Globals';

/**
 * @class Implement the Plus View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class PlusView extends Component {
	/**
	 * Helper render function for rendering the Plus Button
	 * @param  {Boolean} addSideMargin  whether to add spacing around the button
	 * @return {JSX} JSX of the Plus Button
	 */
	_renderButton = (additionalClasses) => {
		const { isPlus, onPlusClick } = this.props;
		const buttonHref = `${globals.CHECKOUT_BASE_URL}/plus?utm_source=gbe&utm_campaign=intro_hub_plus`;
		const buttonClassNames = ClassNames('PlusView__button', 'button', additionalClasses, {
			disabled: isPlus,
		});

		return isPlus ? (
			<div className={buttonClassNames}>
				{t('already_subscribed')}
			</div>
		) : (
			<a className={buttonClassNames} href={buttonHref} onClick={onPlusClick} target="_blank" rel="noopener noreferrer">
				{t('get_ghostery_plus')}
			</a>
		);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Plus View of the Hub app
	 */
	render() {
		return (
			<div className="PlusView">
				<div className="row align-center">
					<div className="columns">
						<div className="PlusView__headingImage" />
						<div className="PlusView__headingTitle text-center">
							{t('hub_supporter_header_title')}
						</div>
						<div className="PlusView__headingDescription text-center">
							{t('hub_supporter_header_description')}
						</div>
						<div className="PlusView__costContainer flex-container align-middle align-justify">
							{this._renderButton()}
						</div>
					</div>
				</div>
				<div className="PlusView--addPaddingTop row small-up-1 large-up-3 align-center">
					<div className="PlusView__perk columns text-center">
						<div className="PlusView__perkIcon analytics" />
						<div className="PlusView__perkTitle">
							{t('hub_supporter_perk_analytics_title')}
						</div>
						<div className="PlusView__perkDescription">
							{t('hub_supporter_perk_analytics_description')}
						</div>
					</div>
					<div className="PlusView__perk columns text-center">
						<div className="PlusView__perkIcon dawnAndGlow" />
						<div className="PlusView__perkTitle">
							{t('hub_supporter_perk_dawn_and_glow_title')}
						</div>
						<div className="PlusView__perkDescription">
							{t('hub_supporter_perk_dawn_and_glow_description')}
						</div>
					</div>
					<div className="PlusView__perk columns text-center">
						<div className="PlusView__perkIcon themes" />
						<div className="PlusView__perkTitle">
							{t('hub_supporter_perk_themes_and_more_title')}
						</div>
						<div className="PlusView__perkDescription">
							{t('hub_supporter_perk_themes_and_more_description')}
						</div>
					</div>
				</div>
				<div className="PlusView__manifestoContainer">
					<div className="PlusView__manifestoBackground row align-center">
						<div dangerouslySetInnerHTML={{ __html: t('hub_supporter_manifesto') }} className="PlusView__manifestoText columns small-12 medium-10 large-8 text-center" />
					</div>
				</div>
			</div>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
PlusView.propTypes = {
	isPlus: PropTypes.bool.isRequired,
	onPlusClick: PropTypes.func.isRequired,
};

export default PlusView;
