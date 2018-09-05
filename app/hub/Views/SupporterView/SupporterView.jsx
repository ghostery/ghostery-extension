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
 *
 * ToDo: Update this file.
 */

import React, { Component } from 'react';

/**
 * @class Implement the Supporter View for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class SupporterView extends Component {
	constructor(props) {
		super(props);

		const title = t('hub_supporter_page_title');
		window.document.title = title;
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Supporter View of the Hub app
	 */
	render() {
		return (
			<div className="SupporterView full-height">

				<div className="SupporterView__header row align-center SupporterView--paddingTopSmall">
					<div className="columns">
						<div className="SupporterView__headerImage"/>

						<div className="SupporterView__title SupporterView--centeredText">
							{t('hub_supporter_header_title')}
						</div>

						<div className="SupporterView__description SupporterView--centeredText">
							{t('hub_supporter_header_description')}
						</div>

						<div className="row align-center-middle">

								<div className="button">
									{t('hub_supporter_button_text')}
								</div>

								<span className="SupporterView__priceTag"><sup>$</sup>2</span>
								<span className="SupporterView__priceTagFrequency">per month</span>

						</div>
					</div>
				</div>

				<div className="SupporterView--paddingTopSmall row align-center">
					<div className="SupporterView__perkFeature columns">

						<div className="SupporterView__perkIconThemes" />
						<div className="SupporterView__perkTitle">
							{t('hub_supporter_perk_themes_title')}
						</div>
						<div className="SupporterView__perkDescription">
							{t('hub_supporter_perk_themes_description')}
						</div>

					</div>

					<div className="SupporterView__perkFeature columns">

						<div className="SupporterView__perkIconPriority" />
						<div className="SupporterView__perkTitle">
							{t('hub_supporter_perk_priority_title')}
						</div>
						<div className="SupporterView__perkDescription">
							{t('hub_supporter_perk_priority_description')}
						</div>
					</div>

					<div className="SupporterView__perkFeature columns">
						<div className="SupporterView__perkIconMore" />
						<div className="SupporterView__perkTitle">
							{t('hub_supporter_perk_more_title')}
						</div>
						<div className="SupporterView__perkDescription">
							{t('hub_supporter_perk_more_description')}
						</div>
					</div>
				</div>

				<div className="SupporterView__manifesto row expanded SupporterView--marginTop align-center-middle">
					<div className="SupporterView__manifestoText">
						{t('hub_supporter_manifesto')}
					</div>
				</div>

				<div className="SupporterView__themes row SupporterView--marginTop align-middle">
					<div className="SupporterView__themesText columns">
						<div className="SupporterView__title">
							{t('hub_supporter_themes_title')}
						</div>

						<div className="SupporterView__description">
							{t('hub_supporter_themes_description')}
						</div>

						<div className="button">
							{t('hub_supporter_button_text')}
						</div>
					</div>

					<div className="columns">
						<img src="/app/images/hub/supporter/screenshot.png" className="SupporterView__themesScreenshots" />
					</div>
				</div>


				<div className="SupporterView__priority SupporterView--marginTop row expanded">

					<div className="row align-center-middle">
						<div className="SupporterView__priorityIcon columns" />

						<div className="SupporterView__priorityText columns">

							<div className="SupporterView__title row">
								{t('hub_supporter_priority_title')}
							</div>

							<div className="SupporterView__description row">
								{t('hub_supporter_priority_description')}
							</div>

							<div className="button row">
								{t('hub_supporter_button_text')}
							</div>
						</div>
					</div>

				</div>


				<div className="SupporterView__manyMore row align-center">

					<div className="SupporterView__manyMoreText columns">

						<div className="SupporterView__title SupporterView--centeredText">
							{t('hub_supporter_more_title')}
						</div>

						<div className="SupporterView__description SupporterView--centeredText">
							{t('hub_supporter_more_description')}
						</div>

						<div className="SupporterView__manyMoreIcon" />

					</div>
				</div>

				<div className="SupporterView__footer row align-center-middle SupporterView--paddingTopSmall">
					<div className="SupporterView__footerLine columns" />

					<div className="SupporterView__buttonContainer columns">
						<div className="button">
							{t('hub_supporter_button_text')}
						</div>
					</div>

					<div className="SupporterView__footerLine columns" />

				</div>

			</div>
		);
	}
}

export default SupporterView;
