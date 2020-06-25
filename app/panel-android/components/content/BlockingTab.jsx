/**
 * Blocking Tab Component
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
import DotsMenu from './DotsMenu';
import BlockingCategories from './BlockingCategories';

class BlockingTab extends React.Component {
	constructor(props) {
		super(props);

		const { callGlobalAction } = props;
		this.siteActions = [
			{
				id: 'blockAllSite',
				name: t('blocking_block_all'),
				callback: () => {
					callGlobalAction({
						actionName: 'blockUnBlockAllTrackers',
						actionData: { block: true, type: 'site' }
					});
				}
			}, {
				id: 'unblockAllSite',
				name: t('blocking_unblock_all'),
				callback: () => {
					callGlobalAction({
						actionName: 'blockUnBlockAllTrackers',
						actionData: { block: false, type: 'site' }
					});
				}
			}
		];
		this.globalActions = [
			{
				id: 'blockAllGlobal',
				name: t('blocking_block_all'),
				callback: () => {
					callGlobalAction({
						actionName: 'blockUnBlockAllTrackers',
						actionData: { block: true, type: 'global' }
					});
				}
			}, {
				id: 'unblockAllGlobal',
				name: t('blocking_unblock_all'),
				callback: () => {
					callGlobalAction({
						actionName: 'blockUnBlockAllTrackers',
						actionData: { block: false, type: 'global' }
					});
				}
			}, {
				id: 'resetSettings',
				name: t('android_blocking_reset'),
				callback: () => {
					callGlobalAction({
						actionName: 'resetSettings',
					});
				}
			}
		];
	}

	get actions() {
		const { type } = this.props;
		if (type === 'site') {
			return this.siteActions;
		}
		return this.globalActions;
	}

	get headerText() {
		const { type } = this.props;
		return (type === 'site') ?
			t('android_site_blocking_header') :
			t('android_global_blocking_header');
	}

	render() {
		const {
			type,
			categories,
			siteProps,
			callGlobalAction,
		} = this.props;

		return (
			<div className="BlockingHeader">
				<div className="BlockingHeader__text">
					<h2>{this.headerText}</h2>
					<DotsMenu actions={this.actions} />
				</div>
				<BlockingCategories
					type={`${type}-trackers`}
					categories={categories}
					siteProps={siteProps}
					callGlobalAction={callGlobalAction}
				/>
			</div>
		);
	}
}

BlockingTab.propTypes = {
	type: PropTypes.oneOf([
		'site',
		'global',
	]).isRequired,
	callGlobalAction: PropTypes.func.isRequired,
	siteProps: PropTypes.shape({}).isRequired,
	categories: PropTypes.arrayOf(PropTypes.shape({})),
};

BlockingTab.defaultProps = {
	categories: [],
};

export default BlockingTab;
