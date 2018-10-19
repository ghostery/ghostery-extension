/**
 * Supporter View Component
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
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import globals from '../../../../src/classes/Globals';

/**
 * @class Implement the Supporter View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class SupporterView extends Component {
	/**
	 * Helper render function for rendering the Supporter Button
	 * @param  {Boolean} addSideMargin  whether to add spacing around the button
	 * @return {JSX} JSX of the Supporter Button
	 */
	_renderButton = (addSideMargin) => {
		const { isSupporter, onSupporterClick } = this.props;
		const buttonHref = `https://account.${globals.GHOSTERY_DOMAIN}.com/subscription`;
		const buttonClassNames = ClassNames('SupporterView__button', 'button', {
			'SupporterView--addSideMargin': addSideMargin,
			disabled: isSupporter,
		});

		return isSupporter ? (
			<div className={buttonClassNames}>
				{t('hub_supporter_button_text_alt')}
			</div>
		) : (
			<a className={buttonClassNames} href={buttonHref} onClick={onSupporterClick} target="_blank" rel="noopener noreferrer">
				{t('hub_supporter_button_text')}
			</a>
		);
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Supporter View of the Hub app
	 */
	render() {
		return (
			<div className="SupporterView">
				<div className="row align-center">
					<div className="columns">
						<div className="SupporterView__headeingImage" />
						<div className="SupporterView__headingTitle text-center">
							{t('hub_supporter_header_title')}
						</div>
						<div className="SupporterView__headingDescription text-center">
							{t('hub_supporter_header_description')}
						</div>
						<div className="flex-container align-center-middle">
							{this._renderButton(true)}
							<div
								className="SupporterView__headingCost SupporterView--addSideMargin flex-container align-middle"
								dangerouslySetInnerHTML={{ __html: t('hub_supporter_price') }}
							/>
						</div>
					</div>
				</div>
				<div className="SupporterView--addPaddingTop row align-center">
					<div className="SupporterView__perk columns text-center">
						<div className="SupporterView__perkIcon themes" />
						<div className="SupporterView__perkTitle">
							{t('hub_supporter_perk_themes_title')}
						</div>
						<div className="SupporterView__perkDescription">
							{t('hub_supporter_perk_themes_description')}
						</div>
					</div>
					<div className="SupporterView__perk columns text-center">
						<div className="SupporterView__perkIcon support" />
						<div className="SupporterView__perkTitle">
							{t('hub_supporter_perk_support_title')}
						</div>
						<div className="SupporterView__perkDescription">
							{t('hub_supporter_perk_support_description')}
						</div>
					</div>
					<div className="SupporterView__perk columns text-center">
						<div className="SupporterView__perkIcon more" />
						<div className="SupporterView__perkTitle">
							{t('hub_supporter_perk_more_title')}
						</div>
						<div className="SupporterView__perkDescription">
							{t('hub_supporter_perk_more_description')}
						</div>
					</div>
				</div>
				<div className="SupporterView__manifestoContainer">
					<div className="SupporterView__manifestoBackground row align-center">
						<div className="SupporterView__manifestoText columns small-12 medium-10 large-8 text-center">
							{t('hub_supporter_manifesto')}
						</div>
					</div>
				</div>
				<div className="SupporterView--addPaddingTop SupporterView--addPaddingBottom">
					<div className="row">
						<div className="SupporterView__feature columns small-12 medium-4 medium-offset-1">
							<div className="SupporterView__headingTitle SupporterView--addPaddingTop">
								{t('hub_supporter_feature_theme_title')}
							</div>
							<div className="SupporterView__headingDescription">
								{t('hub_supporter_feature_theme_description')}
							</div>
							{this._renderButton(false)}
						</div>
						<div className="SupporterView__feature columns small-12 medium-6">
							<img
								className="SupporterView__featureImage theme"
								src="/app/images/hub/supporter/feature-theme.png"
								alt={t('hub_supporter_feature_theme_title')}
							/>
						</div>
					</div>
				</div>
				<div className="SupporterView--addPaddingTop SupporterView--addPaddingBottom SupporterView--rowDarken">
					<div className="row align-middle">
						<div className="SupporterView__feature columns small-12 medium-4 medium-offset-1">
							<img
								className="SupporterView__featureImage support"
								src="/app/images/hub/supporter/feature-support.svg"
								alt={t('hub_supporter_feature_support_title')}
							/>
						</div>
						<div className="SupporterView__feature columns small-12 medium-5 medium-offset-1">
							<div className="SupporterView__headingTitle">
								{t('hub_supporter_feature_support_title')}
							</div>
							<div className="SupporterView__headingDescription">
								{t('hub_supporter_feature_support_description')}
							</div>
							{this._renderButton(false)}
						</div>
					</div>
				</div>
				<div className="SupporterView--addPaddingTop">
					<div className="row align-middle-center">
						<div className="SupporterView__feature columns small-12 medium-6 medium-offset-3 text-center">
							<div className="SupporterView__headingTitle">
								{t('hub_supporter_feature_more_title')}
							</div>
							<div className="SupporterView__headingDescription">
								{t('hub_supporter_feature_more_description')}
							</div>
							<img
								className="SupporterView__featureImage more"
								src="/app/images/hub/supporter/feature-more.svg"
								alt={t('hub_supporter_feature_more_title')}
							/>
						</div>
					</div>
					<div className="SupporterView--addPaddingTop">
						<div className="row align-center-middle">
							<div className="SupporterView__bar flex-child-grow" />
							{this._renderButton(true)}
							<div className="SupporterView__bar flex-child-grow" />
						</div>
					</div>
				</div>
			</div>
		);
	}
}

// PropTypes ensure we pass required props of the correct type
SupporterView.propTypes = {
	isSupporter: PropTypes.bool.isRequired,
	onSupporterClick: PropTypes.func.isRequired,
};

export default SupporterView;
