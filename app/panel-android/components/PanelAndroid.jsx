/**
 * Panel Android Component
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
import Account from './content/Account';
import Settings from './content/Settings';
import Tabs from './content/Tabs';
import Tab from './content/Tab';
import OverviewTab from './content/OverviewTab';
import BlockingTab from './content/BlockingTab';
import {
	getPanelData, getSummaryData, getSettingsData, getBlockingData
} from '../actions/panelActions';
import getCliqzModuleData from '../actions/cliqzActions';
import handleAllActions from '../actions/handler';

class PanelAndroid extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			view: 'overview',
			panel: {
				enable_ad_block: false,
				enable_anti_tracking: false,
				enable_smart_block: false,
				smartBlock: { blocked: {}, unblocked: {} },
			},
			summary: {
				categories: [],
				trackerCounts: {
					allowed: 0,
					blocked: 0,
				},
				sitePolicy: false,
				paused_blocking: false,
			},
			settings: {},
			blocking: {
				siteNotScanned: false,
				pageUrl: '',
			},
			cliqzModuleData: {
				adBlock: { trackerCount: 0 },
				antiTracking: { trackerCount: 0 },
			},
		};
	}

	componentDidMount() {
		const tabId = new URLSearchParams(window.location.search).get('tabId');
		this.setPanelState(tabId);
		this.setSummaryState(tabId);
		this.setSettingsState();
		this.setBlockingState(tabId);
		this.setCliqzDataState(tabId);
	}

	get siteProps() {
		const { summary } = this.state;
		const hostName = summary.pageHost || '';
		const pageHost = hostName.toLowerCase().replace(/^(http[s]?:\/\/)?(www\.)?/, '');

		const {
			site_whitelist = [],
			site_blacklist = [],
			trackerCounts = {}
		} = summary;

		const isTrusted = site_whitelist.indexOf(pageHost) !== -1;
		const isRestricted = site_blacklist.indexOf(pageHost) !== -1;
		const isPaused = summary.paused_blocking;

		const nTrackersBlocked = trackerCounts.blocked || 0;

		return {
			hostName, pageHost, isTrusted, isRestricted, isPaused, nTrackersBlocked
		};
	}

	setPanelState = (tabId) => {
		getPanelData(tabId).then((data) => {
			this.setState({ panel: data.panel });
		});
	}

	setSummaryState = (tabId) => {
		getSummaryData(tabId).then((data) => {
			this.setState({ summary: data });
		});
	}

	setSettingsState = () => {
		getSettingsData().then((data) => {
			this.setState({ settings: data });
		});
	}

	setBlockingState = (tabId) => {
		getBlockingData(tabId).then((data) => {
			this.setState({ blocking: data });
		});
	}

	setCliqzDataState = (tabId) => {
		getCliqzModuleData(tabId).then((data) => {
			this.setState({ cliqzModuleData: data });
		});
	}

	setGlobalState = (updated) => {
		const newState = {};
		Object.keys(updated).forEach((key) => {
			newState[key] = { ...this.state[key], ...updated[key] }; // eslint-disable-line react/destructuring-assignment
		});

		this.setState(newState);
	}

	callGlobalAction = ({ actionName, actionData = {} }) => {
		const updated = handleAllActions({ actionName, actionData, state: this.state });
		if (Object.keys(updated).length !== 0) {
			this.setGlobalState(updated);
		}
	}

	changeView = (newView) => {
		this.setState({ view: newView });
	}

	_renderAccount() {
		const { summary, settings } = this.state;
		return (
			<Account
				summary={summary}
				settings={settings}
				clickHome={() => { this.changeView('overview'); }}
			/>
		);
	}

	_renderSettings() {
		const { summary, settings } = this.state;
		const actions = {
			updateSitePolicy: () => { console.log('updateSitePolicy'); },
			updateDatabase: () => { console.log('updateDatabase'); },
			selectItem: () => { console.log('selectItem'); },
		};

		return (
			<Settings
				actions={actions}
				summary={summary}
				settings={settings}
				clickHome={() => { this.changeView('overview'); }}
			/>
		);
	}

	_renderOverview() {
		const {
			panel,
			blocking,
			summary,
			settings,
			cliqzModuleData,
		} = this.state;
		const { categories } = blocking;

		return (
			<Tabs>
				<Tab tabLabel={t('android_tab_overview')} linkClassName="Tab__label">
					<OverviewTab
						panel={panel}
						summary={summary}
						blocking={blocking}
						cliqzModuleData={cliqzModuleData}
						clickAccount={() => { this.changeView('account'); }}
						clickSettings={() => { this.changeView('settings'); }}
						callGlobalAction={this.callGlobalAction}
					/>
				</Tab>

				<Tab tabLabel={t('android_tab_site_blocking')} linkClassName="Tab__label">
					<BlockingTab
						type="site"
						categories={categories}
						siteProps={this.siteProps}
						callGlobalAction={this.callGlobalAction}
					/>
				</Tab>

				<Tab tabLabel={t('android_tab_global_blocking')} linkClassName="Tab__label">
					<BlockingTab
						type="global"
						categories={settings.categories}
						siteProps={this.siteProps}
						callGlobalAction={this.callGlobalAction}
					/>
				</Tab>
			</Tabs>
		);
	}

	render() {
		const { view } = this.state;

		return (
			<div>
				{view === 'account' && this._renderAccount()}
				{view === 'settings' && this._renderSettings()}
				{view === 'overview' && this._renderOverview()}
			</div>
		);
	}
}

export default PanelAndroid;
