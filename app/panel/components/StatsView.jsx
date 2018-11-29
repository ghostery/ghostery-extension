/**
 * StatsView Component
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

import React from 'react';
import ClassNames from 'classnames';

import StatsGraph from './BuildingBlocks/StatsGraph';

/**
 * A Functional React component for rendering the Stats View
 * @return {JSX} JSX for rendering the Home View of the Hub app
 * @memberof PanelClasses
 */
const StatsView = (props) => {
	/**
	 * Render stats view
	 * @return {ReactComponent}   ReactComponent instance
	 */
	const {
		selection,
		selectType,
		selectView,
		resetStats,
		subscriber,
	} = props;

	const { type, view, selectionText } = selection;
	const {
		trackersSeen, trackersBlocked, trackersAnonymized, adsBlocked
	} = (selection.summaryData || {});
	const { selectedData } = selection;

	console.log('VALUES', selection, trackersSeen, trackersBlocked, trackersAnonymized, adsBlocked);

	const tabCumulative = ClassNames('tab', {
		active: type === 'cumulative',
	});
	const tabMonthly = ClassNames('tab', {
		active: type === 'monthly',
	});
	const tabDaily = ClassNames('tab', {
		active: type === 'daily',
	});
	const trackersSeenClassNames = ClassNames('tile-title-text', {
		active: view === 'trackersSeen',
	});
	const trackersBlockedClassNames = ClassNames('tile-title-text', {
		active: view === 'trackersBlocked',
	});
	const trackersAnonymizedClassNames = ClassNames('tile-title-text', {
		active: view === 'trackersAnonymized',
	});
	const adsBlockedClassNames = ClassNames('tile-title-text', {
		active: view === 'adsBlocked',
	});

	const trackersSeenValueClassNames = ClassNames('tile-value-content', {
		active: view === 'trackersSeen',
		locked: !subscriber,
	});
	const trackersBlockedValueClassNames = ClassNames('tile-value-content', {
		active: view === 'trackersBlocked',
		locked: !subscriber,
	});
	const trackersAnonymizedValueClassNames = ClassNames('tile-value-content', {
		active: view === 'trackersAnonymized',
		locked: !subscriber,
	});
	const adsBlockedValueClassNames = ClassNames('tile-value-content', {
		active: view === 'adsBlocked',
		locked: !subscriber,
	});

	return (
		<div id="content-stats">
			<div className="stats-top-header">
				<span className="stats-top-header-title">{selectionText}</span>
				<span className="stats-top-header-reset" onClick={resetStats}>{t('panel_stats_reset')}</span>
				<span className="clear-float" />
			</div>
			<StatsGraph />
			<div className="tab-header">
				<div className="tab-container">
					<div className="tab-header-title">{t('panel_stats_header_title')}</div>
					<div id="cumulative" className={tabCumulative} onClick={selectType} >
						<span className="header-tab-text">
							{t('panel_stats_menu_cumulative')}
						</span>
					</div>
					<div id="monthly" className={tabMonthly} onClick={selectType} >
						<span className="header-tab-text">
							{t('panel_stats_menu_monthly')}
						</span>
					</div>
					<div id="daily" className={tabDaily} onClick={selectType} >
						<span className="header-tab-text">
							{t('panel_stats_menu_daily')}
						</span>
					</div>
				</div>
			</div>
			<div className="tile-container">
				<div id="trackersSeen" className="tile" onClick={selectView} >
					<div className="tile-title"><p className={trackersSeenClassNames}>{t('panel_stats_trackers_seen')}</p></div>
					<div className="tile-value"><p className={trackersSeenValueClassNames}>{subscriber ? trackersSeen : ''}</p></div>
				</div>
				<div id="trackersBlocked" className="tile" onClick={selectView} >
					<div className="tile-title"><p className={trackersBlockedClassNames}>{t('panel_stats_trackers_blocked')}</p></div>
					<div className="tile-value"><p className={trackersBlockedValueClassNames}>{subscriber ? trackersBlocked : ''}</p></div>
				</div>
				<div id="trackersAnonymized" className="tile" onClick={selectView} >
					<div className="tile-title"><p className={trackersAnonymizedClassNames}>{t('panel_stats_trackers_anonymized')}</p></div>
					<div className="tile-value"><p className={trackersAnonymizedValueClassNames}>{subscriber ? trackersAnonymized : ''}</p></div>
				</div>
				<div id="adsBlocked" className="tile" onClick={selectView} >
					<div className="tile-title"><p className={adsBlockedClassNames}>{t('panel_stats_ads_blocked')}</p></div>
					<div className="tile-value"><p className={adsBlockedValueClassNames}>{subscriber ? adsBlocked : ''}</p></div>
				</div>
			</div>
		</div>
	);
};

export default StatsView;
