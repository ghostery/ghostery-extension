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
import ClassNames from 'classnames';
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
import { sendMessage, openAccountPageAndroid } from '../../panel/utils/msg';

class PanelAndroid extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			needsReload: false,
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
				categories: [],
			},
			cliqzModuleData: {
				adBlock: { trackerCount: 0, unidentifiedTrackers: [] },
				antiTracking: { trackerCount: 0, unidentifiedTrackers: [] },
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
			this.setState(prevState => ({
				panel: data.panel,
				settings: {
					...prevState.settings,
					reload_banner_status: data.panel.reload_banner_status,
					trackers_banner_status: data.panel.trackers_banner_status,
				}
			}));
		});
	}

	setSummaryState = (tabId) => {
		getSummaryData(tabId).then((data) => {
			this.setState({ summary: data });
		});
	}

	setSettingsState = () => {
		getSettingsData().then((data) => {
			this.setState(prevState => ({
				settings: {
					...prevState.settings,
					...data,
					dbUpdateText: t('settings_update_now'),
				}
			}));
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
		const newState = { needsReload: true };
		Object.keys(updated).forEach((key) => {
			newState[key] = { ...this.state[key], ...updated[key] }; // eslint-disable-line react/destructuring-assignment
		});

		if (updated.needsReload === false) {
			newState.needsReload = false;
		}

		this.setState(newState);
	}

	callGlobalAction = ({ actionName, actionData = {} }) => {
		const updated = handleAllActions({ actionName, actionData, state: this.state });
		if (updated instanceof Promise) {
			updated.then((result) => {
				if (Object.keys(result).length !== 0) {
					this.setGlobalState(result);
				}
			});
		} else if (Object.keys(updated).length !== 0) {
			this.setGlobalState(updated);
		}
	}

	changeView = (newView) => {
		this.setState({ view: newView });
	}

	massageCliqzTrackers = tracker => ({
		id: tracker.name,
		catId: tracker.type,
		cliqzAdCount: tracker.ads,
		cliqzCookieCount: tracker.cookies,
		cliqzFingerprintCount: tracker.fingerprints,
		name: tracker.name,
		sources: tracker.domains,
		whitelisted: tracker.whitelisted,
		blocked: false, // To appease BlockingTracker PropTypes
		wtm: tracker.wtm,
	})

	reloadTab = () => {
		const { panel } = this.state;
		sendMessage('reloadTab', { tab_id: +panel.tab_id });
		window.close();
	}

	_renderSettings() {
		const { summary, settings } = this.state;

		return (
			<Settings
				summary={summary}
				settings={settings}
				clickHome={() => { this.changeView('overview'); }}
				callGlobalAction={this.callGlobalAction}
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
		const { categories, toggle_individual_trackers } = blocking;
		const { adBlock, antiTracking } = cliqzModuleData;

		const unidentifiedTrackers = Array.from(new Set([
			...antiTracking.unidentifiedTrackers.map(this.massageCliqzTrackers),
			...adBlock.unidentifiedTrackers.map(this.massageCliqzTrackers),
		])).sort((a, b) => {
			const nameA = a.name.toLowerCase();
			const nameB = b.name.toLowerCase();
			if (nameA < nameB) {
				return -1;
			}
			if (nameA > nameB) {
				return 1;
			}
			return 0;
		});
		const unidentifiedCategory = {
			id: 'unidentified',
			name: t('unidentified'),
			description: t('unidentified_description'),
			img_name: 'unidentified',
			num_total: unidentifiedTrackers.length,
			num_blocked: 0, // We don't want to see the Trackers Blocked text
			trackers: unidentifiedTrackers,
		};

		return (
			<Tabs>
				<Tab tabLabel={t('android_tab_overview')} linkClassName="Tab__label">
					<OverviewTab
						panel={panel}
						summary={summary}
						blocking={blocking}
						cliqzModuleData={cliqzModuleData}
						clickAccount={openAccountPageAndroid}
						clickSettings={() => { this.changeView('settings'); }}
						callGlobalAction={this.callGlobalAction}
					/>
				</Tab>

				<Tab tabLabel={t('android_tab_site_blocking')} linkClassName="Tab__label">
					<BlockingTab
						type="site"
						categories={unidentifiedTrackers.length === 0 ? categories : [...categories, unidentifiedCategory]}
						settings={{ toggle_individual_trackers }}
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
		const { needsReload, view } = this.state;
		const needsReloadClassNames = ClassNames('NeedsReload flex-container align-center-middle', {
			'NeedsReload--show': needsReload,
		});

		return (
			<div>
				<div className={needsReloadClassNames} onClick={this.reloadTab}>
					{t('alert_reload')}
				</div>
				{view === 'settings' && this._renderSettings()}
				{view === 'overview' && this._renderOverview()}
			</div>
		);
	}
}

export default PanelAndroid;
