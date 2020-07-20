/**
 * Site Trackers Component
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
import PropTypes from 'prop-types';
import Accordions from './content/Accordions';
import DotsMenu from './content/DotsMenu';

export default class SiteTrackers extends React.Component {
	actions = [
		{
			id: 'blockAllSite',
			name: 'Block All',
			callback: () => {
				const { callGlobalAction } = this.context;
				callGlobalAction({
					actionName: 'blockUnBlockAllTrackers',
					actionData: {
						block: true,
						type: 'site',
					}
				});
			},
		},
		{
			id: 'unblockAllSite',
			name: 'Unblock All',
			callback: () => {
				const { callGlobalAction } = this.context;
				callGlobalAction({
					actionName: 'blockUnBlockAllTrackers',
					actionData: {
						block: false,
						type: 'site',
					}
				});
			},
		}
	]

	render() {
		const { categories } = this.props;
		return (
			<div className="site-trackers">
				<div className="header">
					<h2>Trackers on this site</h2>
					<DotsMenu actions={this.actions} />
				</div>
				<Accordions type="site-trackers" categories={categories} />
			</div>
		);
	}
}

SiteTrackers.propTypes = {
	categories: PropTypes.arrayOf(PropTypes.object),
};

SiteTrackers.defaultProps = {
	categories: [],
};

SiteTrackers.contextTypes = {
	callGlobalAction: PropTypes.func,
};
