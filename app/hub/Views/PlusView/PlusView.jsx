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
							<div
								className="PlusView__headingCost flex-container align-middle"
								dangerouslySetInnerHTML={{ __html: t('hub_supporter_price') }}
							/>
						</div>
					</div>
				</div>
				<div className="PlusView--addPaddingTop row small-up-1 large-up-3 align-center">
					<div className="PlusView__perk columns text-center">
						<div className="PlusView__perkIcon themes" />
						<div className="PlusView__perkTitle">
							{t('new_themes')}
						</div>
						<div className="PlusView__perkDescription">
							{t('hub_supporter_perk_themes_description')}
						</div>
					</div>
					<div className="PlusView__perk columns text-center">
						<div className="PlusView__perkIcon stats" />
						<div className="PlusView__perkTitle">
							{t('historical_blocking_stats')}
						</div>
						<div className="PlusView__perkDescription">
							{t('hub_supporter_perk_stats_description')}
						</div>
					</div>
					<div className="PlusView__perk columns text-center">
						<div className="PlusView__perkIcon support" />
						<div className="PlusView__perkTitle">
							{t('hub_supporter_perk_more_title')}
						</div>
						<div className="PlusView__perkDescription">
							{t('hub_supporter_perk_more_description')}
						</div>
					</div>
				</div>
				<div className="PlusView__manifestoContainer">
					<div className="PlusView__manifestoBackground row align-center">
						<div className="PlusView__manifestoText columns small-12 medium-10 large-8 text-center">
							{t('hub_supporter_manifesto')}
						</div>
					</div>
				</div>
				<div className="PlusView--addPaddingTop PlusView--addPaddingBottom">
					<div className="row align-center">
						<div className="PlusView__feature small-12 medium-6 large-5 large-offset-1 columns">
							<div className="PlusView__headingTitle PlusView--addPaddingTop">
								{t('new_themes')}
							</div>
							<div className="PlusView__headingDescription">
								{t('hub_supporter_feature_theme_description')}
							</div>
							{this._renderButton('show-for-large')}
						</div>
						<div className="PlusView__feature small-12 medium-6 columns">
							<img
								className="PlusView__featureImage theme"
								src="/app/images/hub/plus/feature-theme.png"
								alt={t('new_themes')}
							/>
						</div>
					</div>
					<div className="PlusView--addPaddingTop hide-for-large">
						<div className="row align-center-middle">
							<div className="PlusView__bar flex-child-grow" />
							{this._renderButton('PlusView--addSideMargin')}
							<div className="PlusView__bar flex-child-grow" />
						</div>
					</div>
				</div>
				<div className="PlusView--addPaddingTop PlusView--addPaddingBottom PlusView--rowDarken">
					<div className="row align-center">
						<div className="PlusView__feature small-12 medium-6 large-5 columns show-for-large">
							<img
								className="PlusView__featureImage stats"
								src="/app/images/hub/plus/feature-stats.svg"
								alt={t('historical_blocking_stats')}
							/>
						</div>
						<div className="PlusView__feature small-12 medium-6 large-5 columns">
							<div className="PlusView__headingTitle">
								{t('historical_blocking_stats')}
							</div>
							<div className="PlusView__headingDescription">
								{t('hub_supporter_feature_stats_description')}
							</div>
							{this._renderButton('show-for-large')}
						</div>
						<div className="PlusView__feature columns hide-for-large">
							<img
								className="PlusView__featureImage stats"
								src="/app/images/hub/plus/feature-stats.svg"
								alt={t('historical_blocking_stats')}
							/>
						</div>
					</div>
					<div className="PlusView--addPaddingTop hide-for-large">
						<div className="row align-center-middle">
							<div className="PlusView__bar flex-child-grow" />
							{this._renderButton('PlusView--addSideMargin')}
							<div className="PlusView__bar flex-child-grow" />
						</div>
					</div>
				</div>
				<div className="PlusView--addPaddingTop PlusView--addPaddingBottom">
					<div className="row align-center">
						<div className="PlusView__feature small-12 medium-6 large-5 large-offset-1 columns">
							<div className="PlusView__headingTitle">
								{t('priority_support')}
							</div>
							<div className="PlusView__headingDescription">
								{t('hub_supporter_feature_support_description')}
							</div>
							{this._renderButton('show-for-large')}
						</div>
						<div className="PlusView__feature columns small-12 medium-6">
							<img
								className="PlusView__featureImage support"
								src="/app/images/hub/plus/feature-support.svg"
								alt={t('priority_support')}
							/>
						</div>
					</div>
					<div className="PlusView--addPaddingTop hide-for-large">
						<div className="row align-center-middle">
							<div className="PlusView__bar flex-child-grow" />
							{this._renderButton('PlusView--addSideMargin')}
							<div className="PlusView__bar flex-child-grow" />
						</div>
					</div>
				</div>
				<div className="PlusView--addPaddingTop PlusView--addPaddingBottom PlusView--rowDarken">
					<div className="row align-center">
						<div className="PlusView__feature columns medium-8 large-5 text-center">
							<div className="PlusView__headingTitle">
								{t('hub_supporter_feature_more_title')}
							</div>
							<div className="PlusView__headingDescription">
								{t('hub_supporter_feature_more_description')}
							</div>
							<img
								className="PlusView__featureImage more"
								src="/app/images/hub/plus/feature-more.svg"
								alt={t('hub_supporter_feature_more_title')}
							/>
						</div>
					</div>
					<div className="PlusView--addPaddingTop">
						<div className="row align-center-middle">
							<div className="PlusView__bar flex-child-grow" />
							{this._renderButton('PlusView--addSideMargin')}
							<div className="PlusView__bar flex-child-grow" />
						</div>
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
