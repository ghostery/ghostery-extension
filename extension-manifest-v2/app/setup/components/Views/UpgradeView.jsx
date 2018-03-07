/**
 * Upgrade View Component
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
import { msg } from '../../utils';

/**
 * @class Implemet the #upgrade page within the Setup app.
 * Mostly an informational page with links.
 * @extends Component
 * @memberof SetupViews
 */
class UpgradeView extends Component {
	constructor(props) {
		super(props);

		// event binding
		this.clickMaybeLater = this.clickMaybeLater.bind(this);
		this.clickSetup = this.clickSetup.bind(this);
	}

	/**
	 * Handles the onClick event for when you click Maybe Later
	 */
	clickMaybeLater() {
		msg.sendMessage('skipSetup');
	}

	/**
	 * Handles the onClick event for when you click Setup
	 */
	clickSetup() {
		this.props.history.push('/');
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the #additional-features step of the setup flow
	 */
	render() {
		return (
			<div id="upgrade-view" className="row small-up-1 large-up-2">
				<div className="columns">
					<h1>{ t('setup_upgrade_title') }</h1>
					<div className="tagline">{ t('setup_upgrade_subtitle') }</div>
					<div className="row align-center align-middle upgrade-feature">
						<div className="columns small-12 large-4 large-offset-2 text-center">
							<img src="/app/images/setup/upgrade/smart-block.svg" />
						</div>
						<div className="columns small-10 medium-6 large-6 description">
							<p dangerouslySetInnerHTML={{ __html: t('setup_upgrade_desc_1') }} />
						</div>
					</div>
					<div className="row align-center align-middle upgrade-feature">
						<div className="columns small-12 large-4 large-offset-2 text-center">
							<img src="/app/images/setup/upgrade/dynamic-ui.svg" />
						</div>
						<div className="columns small-10 medium-6 large-6 description">
							<p dangerouslySetInnerHTML={{ __html: t('setup_upgrade_desc_2') }} />
						</div>
					</div>
					<div className="row align-center align-middle upgrade-feature">
						<div className="columns small-12 large-4 large-offset-2 text-center">
							<img src="/app/images/setup/upgrade/enhanced-blocking.svg" />
						</div>
						<div className="columns small-10 medium-6 large-6 description">
							<p dangerouslySetInnerHTML={{ __html: t('setup_upgrade_desc_3') }} />
						</div>
					</div>
				</div>
				<div className="columns">
					<div className="row align-center">
						<div className="columns small-12 medium-6 large-12 screenshots">
							<span className="right img-container">
								<img src="/app/images/setup/panel-detailed.png" />
							</span>
							<span className="left img-container">
								<img src="/app/images/setup/panel-simple.png" />
							</span>
						</div>
					</div>
					<div className="row align-center">
						<div className="columns small-12 medium-10">
							<div className="row align-middle actions">
								<div className="columns pointer" onClick={this.clickMaybeLater}>
									{ t('setup_upgrade_button_later') }
								</div>
								<div className="columns button ghostery-button" onClick={this.clickSetup}>
									{ t('setup_upgrade_button_go') }
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default UpgradeView;
