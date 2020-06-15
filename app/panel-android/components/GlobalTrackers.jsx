/**
 * Global Trackers Component
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

export default class GlobalTrackers extends React.Component {
	actions = [
		{
			id: 'blockAllGlobal',
			name: 'Block All',
			callback: () => {
				const { callGlobalAction } = this.context;
				callGlobalAction({
					actionName: 'blockUnBlockAllTrackers',
					actionData: {
						block: true,
						type: 'global',
					}
				});
			},
		},
		{
			id: 'unblockAllGlobal',
			name: 'Unblock All',
			callback: () => {
				const { callGlobalAction } = this.context;
				callGlobalAction({
					actionName: 'blockUnBlockAllTrackers',
					actionData: {
						block: false,
						type: 'global',
					}
				});
			},
		},
		{
			id: 'resetSettings',
			name: 'Reset Settings',
			callback: () => {
				const { callGlobalAction } = this.context;
				callGlobalAction({
					actionName: 'resetSettings',
				});
			},
		}
	];

	get categories() {
		const { categories } = this.props;
		return categories;
	}

	render() {
		return (
			<div className="global-trackers">
				<div className="header">
					<h2>Global Trackers</h2>
					<DotsMenu actions={this.actions} />
				</div>
				<Accordions type="global-trackers" categories={this.categories} />
			</div>
		);
	}
}

GlobalTrackers.propTypes = {
	categories: PropTypes.arrayOf(PropTypes.object),
};

GlobalTrackers.defaultProps = {
	categories: [],
};

GlobalTrackers.contextTypes = {
	callGlobalAction: PropTypes.func,
};
