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
				<div className="row">
					<div className="columns SupporterView__header align-center">

						<div className="SupporterView__headerImage row align-center">
							<img src="/app/images/hub/supporter/GoldenGhost.png" />
						</div>

						<div className="SupporterView__title row align-center">
							{t('hub_supporter_header_title')}
						</div>

						<div className="SupporterView__description row align-center">
							{t('hub_supporter_header_description')}
						</div>

					</div>
				</div>

				<div className="SupporterView--paddingTop row align-center">
					<div className="SupporterView__perkFeature columns">
						<div className="SupporterView__perkIcon" />
						<div className="SupporterView__perkTitle">
							{t('hub_supporter_perk_themes_title')}
						</div>
					</div>
					<div className="SupporterView__perkFeature columns">
						<div className="SupporterView__perkIcon" />
						<div className="SupporterView__perkTitle">
							{t('hub_supporter_perk_priority_title')}
						</div>
					</div>
					<div className="SupporterView__perkFeature columns">
						<div className="SupporterView__perkIcon" />
						<div className="SupporterView__perkTitle">
							{t('hub_supporter_perk_more_title')}
						</div>
					</div>
				</div>

				<div className="SupporterView__manifesto row expanded SupporterView--marginTop align-center-middle">
					<div className="SupporterView__manifestoText columns">
						{t('hub_supporter_manifesto')}
					</div>
				</div>

				<div className="SupporterView__themes row SupporterView--marginTop align-middle">
					<div className="SupporterView__themesText columns">
						<div className="SupporterView__title row">
							{t('hub_supporter_themes_title')}
						</div>

						<div className="SupporterView__description row">
							{t('hub_supporter_themes_description')}
						</div>
					</div>

					<div className="SupporterView__themesScreenshots columns" />
				</div>


				<div className="SupporterView__priority SupporterView--marginTop row expanded">
					<div className="SupporterView__priorityIcon columns" />
					<div className="SupporterView__priorityText columns">

						<div className="SupporterView__title row">
							{t('hub_supporter_priority_title')}
						</div>

						<div className="SupporterView__description row">
							{t('hub_supporter_priority_description')}
						</div>

					</div>

				</div>
			</div>
		);
	}
}

export default SupporterView;
