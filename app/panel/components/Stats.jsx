/**
 * Stats Component
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
import moment from 'moment/min/moment-with-locales.min';
import StatsView from './StatsView';
import { sendMessage, sendMessageInPromise } from '../utils/msg';
/* Insights API
	* Stats from ghostery when a navigation event happens.
	* @param tabId int
	* @param pageInfo Object: {
	*  timestamp: when page navigation was started
	*  pageTiming: {
	*    timing: {
	*      navigationStart: from performance api
	*      loadEventEnd: from performance api
	*    }
	*  },
	*  host: first party hostname
	* }
	* @param apps Array [{
	*  id: app ID,
	*  blocked: Boolean,
	*  sources: Array [{ src: string url, blocked: boolean }]
	* }, ...]
	* @param bugs Object {
	*  [bug ID]: {
	*    blocked: Boolean,
	*    sources: Array [{ src: string url, blocked: boolean }]
	*  }
	* }

pushGhosteryPageStats(tabId, pageInfo, apps, bugs) {
...
	  const result = {
		loadTime,
		timeSaved: timeSaved(loadTime, trackersAndAdsBlocked),
		trackersDetected: trackersSeen.size,
		trackersBlocked: blocked,
		trackerRequestsBlocked: requestsBlocked,
		cookiesBlocked: cookies,
		fingerprintsRemoved: fingerprints,
		adsBlocked: ads,
		dataSaved,
		trackers: trackersSeen
	  };
  },

  getDashboardStats(period) {
	var _this6 = this;

	return _asyncToGenerator(function* () {
	  return _this6.db.getDashboardStats(period);
	})();
  },

   * Get an array of daily summaries for a date range.
   * @param from lower bound for day search in moment compatible format
   * @param to upper bound for day search in moment compatible format
   * @param includeFrom if true, the 'from' day should be included in the results
   * @param includeTo if true, the 'to' day should be included in the results
   * @returns Array of stat objects for the specified time period

  getStatsTimeline(from, to, includeFrom, includeTo) {

  },

   * Get stats object for a specific day
   * @param day moment-compatible date.
   *
  getStatsForDay(day) {
  },

   * Get an array of days for which there exists insights stats.
  getAllDays() {
	var _this9 = this;

	return _asyncToGenerator(function* () {
	  return _this9.db.getAllDays();
	})();
  },

  clearData() {
  },

  recordPageInfo(info, sender) {
} */
/**
 * @class Implement footer of the detailed (expert) view which
 * acts as a menu and opens additional views.
 * @memberOf PanelClasses
 */
class Stats extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			selection: {
				type: 'cumulative',
				view: 'trackersSeen',
				graphTitle: this.getGraphTitle('cumulative', 'trackersSeen'),
				summaryTitle: this.getSummaryTitle('cumulative'),
				tooltipText: t('panel_stats_trackers_seen'),
				summaryData: {},
				selectionData: [],
				currentIndex: 0,
			},
			dailyData: [],
			monthlyData: [],
			cumulativeData: {},
			monthlyAverageData: {},
			dailyAverageData: {},
		};

		// event bindings
		this.selectView = this.selectView.bind(this);
		this.selectType = this.selectType.bind(this);
	}

	componentDidMount() {
		const state = Object.assign({}, this.state);
		this.getAllStats().then((allData) => {
			if (Array.isArray(allData) && allData.length) {
				console.log('DATA:', allData);
				let trackersSeen = 0;
				let trackersBlocked = 0;
				let trackersAnonymized = 0;
				let adsBlocked = 0;
				const startDate = moment(allData[0].day);
				let endOfMonth = moment(startDate).endOf('month');
				let dayCount = 0;
				let scale = 1;
				const monthTrackersSeenArray = [];
				const monthTrackersBlockedArray = [];
				const monthTrackersAnonymizedArray = [];
				const monthAdsBlockedArray = [];
				let monthTrackersSeen = 0;
				let monthTrackersBlocked = 0;
				let monthTrackersAnonymized = 0;
				let monthAdsBlocked = 0;
				const monthlyData = [];
				const dailyData = [];
				allData.forEach((dataItem) => {
					// Day reassignments
					dailyData.push({
						trackersSeen: dataItem.trackersDetected,
						trackersBlocked: dataItem.trackersBlocked,
						trackersAnonymized: dataItem.cookiesBlocked + dataItem.fingerprintsRemoved,
						adsBlocked: dataItem.adsBlocked,
						date: dataItem.day,
					});

					// Monthly calculations
					if (moment(dataItem.day).isSameOrBefore(endOfMonth)) {
						dayCount++;
						monthTrackersSeen += dataItem.trackersDetected;
						monthTrackersBlocked += dataItem.trackersBlocked;
						monthTrackersAnonymized += dataItem.cookiesBlocked + dataItem.fingerprintsRemoved;
						monthAdsBlocked += dataItem.adsBlocked;
					} else {
						const beginOfMonth = moment(endOfMonth).startOf('month');
						const monthLength = endOfMonth.diff(beginOfMonth, 'days');
						if (dayCount && dayCount < monthLength) {
							scale = monthLength / dayCount;
						}

						monthTrackersSeen += dataItem.trackersDetected;
						monthTrackersBlocked += dataItem.trackersBlocked;
						monthTrackersAnonymized += dataItem.cookiesBlocked + dataItem.fingerprintsRemoved;
						monthAdsBlocked += dataItem.adsBlocked;

						const monthlyObj = {
							date: beginOfMonth.format('YYYY-MM-DD'),
							trackersSeen: (scale === 1) ? monthTrackersSeen : Math.floor(monthTrackersSeen * scale),
							trackersBlocked: (scale === 1) ? monthTrackersBlocked : Math.floor(monthTrackersBlocked * scale),
							trackersAnonymized: (scale === 1) ? monthTrackersAnonymized : Math.floor(monthTrackersAnonymized * scale),
							adsBlocked: (scale === 1) ? monthAdsBlocked : Math.floor(monthAdsBlocked * scale),
						};

						monthTrackersSeenArray.push(monthlyObj.trackersSeen);
						monthTrackersBlockedArray.push(monthlyObj.trackersBlocked);
						monthTrackersAnonymizedArray.push(monthlyObj.trackersAnonymized);
						monthAdsBlockedArray.push(monthlyObj.adsBlocked);

						monthlyData.push(monthlyObj);

						endOfMonth = moment(dataItem.day).endOf('month');
						dayCount = 1;
						scale = 1;

						monthTrackersSeen = 0;
						monthTrackersBlocked = 0;
						monthTrackersAnonymized = 0;
						monthAdsBlocked = 0;
					}
					trackersSeen += dataItem.trackersDetected;
					trackersBlocked += dataItem.trackersBlocked;
					trackersAnonymized += dataItem.cookiesBlocked + dataItem.fingerprintsRemoved;
					adsBlocked += dataItem.adsBlocked;
				});
				// Cumulative data
				state.cumulativeData = {
					trackersSeen,
					trackersBlocked,
					trackersAnonymized,
					adsBlocked,
				};
				// Day averages
				trackersSeen = Math.floor(trackersSeen / allData.length);
				trackersBlocked = Math.floor(trackersBlocked / allData.length);
				trackersAnonymized = Math.floor(trackersAnonymized / allData.length);
				adsBlocked = Math.floor(adsBlocked / allData.length);

				state.dailyAverageData = {
					trackersSeen,
					trackersBlocked,
					trackersAnonymized,
					adsBlocked,
				};
				// Monthly averages
				trackersSeen = Math.floor(monthTrackersSeenArray.reduce((a, b) => (a + b), 0) / monthTrackersSeenArray.length);
				trackersBlocked = Math.floor(monthTrackersBlockedArray.reduce((a, b) => (a + b), 0) / monthTrackersBlockedArray.length);
				trackersAnonymized = Math.floor(monthTrackersAnonymizedArray.reduce((a, b) => (a + b), 0) / monthTrackersAnonymizedArray.length);
				adsBlocked = Math.floor(monthAdsBlockedArray.reduce((a, b) => (a + b), 0) / monthAdsBlockedArray.length);

				state.monthlyAverageData = {
					trackersSeen,
					trackersBlocked,
					trackersAnonymized,
					adsBlocked,
				};

				state.dailyData = dailyData;
				state.monthlyData = monthlyData;
				state.selection.summaryData = state.cumulativeData;
<<<<<<< HEAD

				state.selection.currentIndex = state.monthlyData.length - 1;
=======
				state.selection.currentIndex = this.state.monthlyData.length - 1;
>>>>>>> 24a325fb75b70f0c726f2ced3d5d9eafab32f404
				state.selection.selectionData = this.determineSelectionData(state);

				this.setState(state, () => {
					console.log('STATE:', this.state);
				});
			}
		});

		// this.getStats(moment().subtract(30, 'days'), moment()).then((allData) => {
		// 	this.setState({ selection, allData }, () => {
		// 		console.log('SELECTION:', this.state);
		// 	});
		// });
	}

	getStats(from, to) {
		return sendMessageInPromise('getStats', { from, to });
	}

	getAllStats() {
		return sendMessageInPromise('getAllStats');
	}

	getGraphTitleBase(view) {
		switch (view) {
			case 'trackersSeen':
				return t('panel_stats_total_trackers_seen');
			case 'trackersBlocked':
				return t('panel_stats_total_trackers_blocked');
			case 'trackersAnonymized':
				return t('panel_stats_total_trackers_anonymized');
			case 'adsBlocked':
				return t('panel_stats_total_ads_blocked');
			default:
				return '';
		}
	}

	getGraphTitle(type, view) {
		const viewText = this.getGraphTitleBase(view);
		if (viewText) {
			switch (type) {
				case 'cumulative':
					return `${viewText} (${t('panel_stats_cumulative')})`;
				case 'monthly':
					return `${viewText} (${t('panel_stats_monthly')})`;
				case 'daily':
					return `${viewText} (${t('panel_stats_daily')})`;
				default: {
					return viewText;
				}
			}
		}

		return '';
	}

	getSummaryTitle(type) {
		switch (type) {
			case 'cumulative':
				return t('panel_stats_header_title');
			case 'monthly':
				return t('panel_stats_header_title_monthly');
			case 'daily':
				return t('panel_stats_header_title_daily');
			default:
				return t('panel_stats_header_title');
		}
	}

	getSummaryData(state, type) {
		switch (type) {
			case 'cumulative': {
				return state.cumulativeData;
			}
			case 'monthly': {
				return state.monthlyAverageData;
			}
			case 'daily': {
				return state.dailyAverageData;
			}
			default: {
				return {};
			}
		}
	}

	getTooltipText(view) {
		switch (view) {
			case 'trackersSeen':
				return t('panel_stats_trackers_seen');
			case 'trackersBlocked':
				return t('panel_stats_trackers_blocked');
			case 'trackersAnonymized':
				return t('panel_stats_trackers_anonymized');
			case 'adsBlocked':
				return t('panel_stats_ads_blocked');
			default:
				return t('panel_stats_trackers_seen');
		}
	}

	/**
	 * Set view selection according to the clicked button. Save it in state.
	 * @param {Object} event 		click event
	 */
	selectView(event) {
		const state = Object.assign({}, this.state);
		// eslint-disable-next-line prefer-destructuring
		const selection = state.selection;
		if (event.currentTarget.id !== selection.view) {
			selection.view = event.currentTarget.id;
			sendMessage('ping', selection.view);
			selection.graphTitle = this.getGraphTitle(selection.type, selection.view);
			selection.summaryTitle = this.getSummaryTitle(selection.type);
			selection.summaryData = this.getSummaryData(state, selection.type);
			selection.tooltipText = this.getTooltipText(selection.view);

			this.setState({ selection }, () => {
				console.log('SELECTION:', this.state.selection);
			});
		}
	}

	/**
	 * Set type selection according to the clicked button. Save it in state.
	 * Update current index if switching from monthly/cumulative to daily (or reverse)
	 * @param {Object} event 		click event
	 */
	selectType(event) {
		const state = Object.assign({}, this.state);
		// eslint-disable-next-line prefer-destructuring
		const selection = state.selection;
		if (event.currentTarget.id !== selection.type) {
			const lastType = selection.type === 'cumulative' ? 'monthly' : selection.type;
			selection.type = event.currentTarget.id;
			selection.graphTitle = this.getGraphTitle(selection.type, selection.view);
			selection.summaryTitle = this.getSummaryTitle(selection.type);
			selection.summaryData = this.getSummaryData(state, selection.type);
			sendMessage('ping', selection.type);

			const { monthlyData, dailyData, currentIndex } = this.state;
			if (selection.type === 'daily' && lastType === 'monthly') {
				const currentDate = dailyData[currentIndex].date;
				for (let i = monthlyData.length - 1; i >= 0; i--) {
					if (monthlyData[i].date === currentDate) {
						selection.currentIndex = i;
						break;
					}
				}
			} else if (selection.type === 'monthly' && lastType === 'daily') {
				const currentDate = monthlyData[currentIndex].date;
				for (let i = dailyData.length - 1; i >= 0; i--) {
					if (dailyData[i].date === currentDate) {
						selection.currentIndex = i;
						break;
					}
				}
			}

			this.setState({ selection }, () => {
				console.log('SELECTION:', this.state.selection);
			});
		}
	}

	/**
	 * Determine data selection for Stats Graph according to parameters in state
	 * Save it in state
	 */
<<<<<<< HEAD
	determineSelectionData(state) {
		let localState = {};
		if (!state) {
			localState = Object.assign({}, this.state);
		} else {
			localState = state;
		}
		const {
			selection, dailyData, monthlyData
		} = localState;
=======
	determineSelectionData(passedState) {
		const state = passedState || Object.assign({}, this.state);
		const { dailyData, monthlyData, selection } = state;
>>>>>>> 24a325fb75b70f0c726f2ced3d5d9eafab32f404
		const data = selection.type === 'daily' ? dailyData : monthlyData;
		const dataSlice = data.slice(selection.currentIndex - 7, selection.currentIndex - 1);
		const selectionData = dataSlice.map((entry) => {
			const parsedEntry = { amount: entry[state.selection.view], date: entry.date };
			return parsedEntry;
		});
		return selectionData;
	}

	/**
	 * Change time frame based on user's selection
	 * Save it in state under currentIndex
	 * @param {Object} event 		click event
	 */
	selectTimeFrame(e) {
		/**
		*
		TODO: This class method will be tied to click handlers on the arrows in the graph
		*
		*/
		if (e.target.id === 'stats-forward') {
			this.setState({ currentIndex: this.state.currentIndex + 6 });
		} else if (e.target.id === 'stats-forward') {
			this.setState({ currentIndex: this.state.currentIndex - 6 });
		}
	}

	resetStats() {
		console.log('RESET STATS CALLED');
	}

	/**
	 * Render the expert view footer.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		console.log("RENDERING", this.state);
		return (
			<div id="content-stats">
				<StatsView getStats={this.getStats} subscriber selection={this.state.selection} selectView={this.selectView} selectType={this.selectType} resetStats={this.resetStats} />
			</div>
		);
	}
}

export default Stats;
