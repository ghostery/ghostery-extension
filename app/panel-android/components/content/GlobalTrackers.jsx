/**
 * Global Trackers Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import Accordions from './Accordions';
import DotsMenu from './DotsMenu';

class GlobalTrackers extends React.Component {
	actions = [
		{
			id: 'blockAllGlobal',
			name: t('blocking_block_all'),
			callback: () => {
				const { callGlobalAction } = this.props;
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
			name: t('blocking_unblock_all'),
			callback: () => {
				const { callGlobalAction } = this.props;
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
			name: t('android_blocking_reset'),
			callback: () => {
				const { callGlobalAction } = this.context;
				callGlobalAction({
					actionName: 'resetSettings',
				});
			},
		}
	];

	render() {
		const { categories, siteProps, callGlobalAction } = this.props;
		return (
			<div className="BlockingHeader">
				<div className="BlockingHeader__text">
					<h2>{t('android_global_blocking_header')}</h2>
					<DotsMenu actions={this.actions} />
				</div>
			</div>
		);
		// 		<Accordions
		// 			type="global-trackers"
		// 			categories={categories}
		// 			siteProps={siteProps}
		// 			callGlobalAction={callGlobalAction}
		// 		/>
		//	</div>
		// );
	}
}

GlobalTrackers.propTypes = {
	categories: PropTypes.arrayOf(PropTypes.object),
	callGlobalAction: PropTypes.func,
};

GlobalTrackers.defaultProps = {
	categories: [],
	callGlobalAction: () => {},
};

export default GlobalTrackers;
