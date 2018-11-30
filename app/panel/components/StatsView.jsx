/**
 * Stats View Component
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
import ReactSVG from 'react-svg';

import StatsGraph from './BuildingBlocks/StatsGraph';

/**
 * A Functional React component for rendering the Stats View
 * @return {JSX} JSX for rendering the Stats View
 * @memberof PanelClasses
 */
const StatsView = (props) => {
	/**
	 * Render stats view
	 * @return {ReactComponent}   ReactComponent instance
	 */
	const {
		showResetModal,
		selection,
		selectType,
		selectView,
		selectTimeFrame,
		resetStats,
		subscriber,
		doReset,
		cancelReset,
	} = props;

	const {
		type, view, graphTitle, summaryTitle, summaryData, selectionData, tooltipText, graphIconPath
	} = selection;

	// graphIconPath = graphIconPath || "../../app/images/panel/eye.svg";
	const {
		trackersSeen, trackersBlocked, trackersAnonymized, adsBlocked
	} = summaryData;

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
				<span className="stats-top-header-title">
					<ReactSVG path={graphIconPath} className="stats-top-header-icon" />
					{graphTitle}
				</span>
				<span className="stats-top-header-reset" onClick={resetStats}>
					{t('panel_stats_reset')}
					<ReactSVG path="../../app/images/panel/info.svg" className="stats-top-header-info-icon" />
				</span>
				<span className="clear-float" />
			</div>
			<StatsGraph
				data={selectionData}
				dailyOrMonthly={type}
				tooltipText={tooltipText}
				selectTimeFrame={selectTimeFrame}
			/>
			<div className="tab-header">
				<div className="tab-container">
					<div className="tab-header-title">{summaryTitle}</div>
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
			{ showResetModal &&
				<div className="modal-reset-warning" >
					<div className="modal-reset-content" >
						<div className="modal-reset-title" >
							<span className="modal-reset-title-text">{t('panel_stats_reset_modal_text')}</span>
						</div>
						<div className="modal-reset-buttons">
							<div className="modal-reset-button-yes" onClick={doReset}>{t('modal_reset_button_text_yes')}</div><div className="modal-reset-button-no" onClick={cancelReset}>{t('modal_reset_button_text_no')}</div>
						</div>
					</div>
				</div>
			}
		</div>
	);
};

export default StatsView;
