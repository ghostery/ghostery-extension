/**
 * Site Trackers Component
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

class SiteTrackers extends React.Component {
	actions = [
		{
			id: 'blockAllSite',
			name: t('blocking_block_all'),
			callback: () => {
				const { callGlobalAction } = this.props;
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
			name: t('blocking_unblock_all'),
			callback: () => {
				const { callGlobalAction } = this.props;
				callGlobalAction({
					actionName: 'blockUnBlockAllTrackers',
					actionData: {
						block: false,
						type: 'site',
					}
				});
			},
		}
	];

	render() {
		const { categories, siteProps, callGlobalAction } = this.props;
		return (
			<div className="BlockingHeader">
				<div className="BlockingHeader__text">
					<h2>{t('android_site_blocking_header')}</h2>
					<DotsMenu actions={this.actions} />
				</div>
			</div>
		);
		// 		<Accordions
		// 			type="site-trackers"
		// 			categories={categories}
		// 			siteProps={siteProps}
		// 			callGlobalAction={callGlobalAction}
		// 		/>
		// 	</div>
		// );
	}
}

SiteTrackers.propTypes = {
	categories: PropTypes.arrayOf(PropTypes.object),
	callGlobalAction: PropTypes.func,
};

SiteTrackers.defaultProps = {
	categories: [],
	callGlobalAction: () => {},
};

export default SiteTrackers;
