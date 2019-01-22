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
import { sendMessage, sendMessageInPromise, openSubscriptionPage } from '../utils/msg';

/**
 * @class the parent component of Historical Stats View and Graph
 * @memberOf PanelClasses
 */
class Stats extends React.Component {
	constructor(props) {
		super(props);
		this.state = this._reset();
	}
	/**
	 * Lifecycle event
	 */
	componentDidMount() {
		sendMessage('ping', 'hist_stats_panel');
		if (!this._isPlus(this.props)) {
			// eslint-disable-next-line
			this.setState(this._reset(true));
			return;
		}
		this._init();
	}
	/**
	 * Lifecycle event
	 */
	componentWillReceiveProps(nextProps) {
		const nextPlus = this._isPlus(nextProps);
		const thisPlus = this._isPlus(this.props);
		if (nextPlus !== thisPlus) {
			if (nextPlus) {
				this._init();
			} else {
				this.setState(this._reset(true));
			}
		}
	}

	getGraphTitleBase = (view) => {
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
				return '';
		}
	}

	getGraphTitle = (type, view) => {
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

	getGraphIconPath = (view) => {
		switch (view) {
			case 'trackersSeen':
				return '../../app/images/panel/eye.svg';
			case 'trackersBlocked':
				return '../../app/images/panel/blocked.svg';
			case 'trackersAnonymized':
				return '../../app/images/panel/anonymized.svg';
			case 'adsBlocked':
				return '../../app/images/panel/adsblocked.svg';
			default:
				return '../../app/images/panel/eye.svg';
		}
	}

	getSummaryTitle = (type) => {
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

	getSummaryData = (state, type) => {
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

	getTooltipText = (view) => {
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
	selectView = (event) => {
		if (!this._isPlus(this.props)) {
			return;
		}
		const state = Object.assign({}, this.state);
		const { selection } = state;
		if (event.currentTarget.id !== selection.view) {
			selection.view = event.currentTarget.id;
			selection.graphTitle = this.getGraphTitle(selection.type, selection.view);
			selection.graphIconPath = this.getGraphIconPath(selection.view);
			selection.summaryTitle = this.getSummaryTitle(selection.type);
			selection.summaryData = this.getSummaryData(state, selection.type);
			selection.tooltipText = this.getTooltipText(selection.view);
			selection.selectionData = this._determineSelectionData(state);

			this.setState({ selection });
		}
	}

	/**
	 * Set type selection according to the clicked button. Save it in state.
	 * Update current index if switching from monthly/cumulative to daily (or reverse)
	 * @param {Object} event 		click event
	 */
	selectType = (event) => {
		if (!this._isPlus(this.props)) {
			return;
		}
		const state = Object.assign({}, this.state);
		const { selection } = state;
		if (event.currentTarget.id !== selection.type) {
			const lastType = selection.type;
			selection.type = event.currentTarget.id;
			selection.graphTitle = this.getGraphTitle(selection.type, selection.view);
			selection.graphIconPath = this.getGraphIconPath(selection.view);
			selection.summaryTitle = this.getSummaryTitle(selection.type);
			selection.summaryData = this.getSummaryData(state, selection.type);

			const setTimeframes = (currentData, prevData) => {
				const currentDate = prevData[selection.currentIndex].date;
				for (let i = currentData.length - 1; i >= 0; i--) {
					if (currentData[i].date.slice(0, 7) === currentDate.slice(0, 7)) {
						selection.currentIndex = i;
						break;
					}
				}

				if (currentData.length <= 6) {
					selection.timeframeSelectors.back = 'disabled';
					selection.timeframeSelectors.forward = 'disabled';
				} else {
					selection.timeframeSelectors.back = selection.currentIndex === 0 ? 'disabled' : '';
					selection.timeframeSelectors.forward = selection.currentIndex + 1 === currentData.length ? 'disabled' : '';
				}
			};

			const { monthlyData, dailyData } = state;
			if (selection.type === 'daily' && lastType !== 'daily') {
				setTimeframes(dailyData, monthlyData);
			} else if (selection.type !== 'daily' && lastType === 'daily') {
				setTimeframes(monthlyData, dailyData);
			}

			selection.selectionData = this._determineSelectionData(state);

			this.setState({ selection });
		}
	}

	/**
	 * Change time frame based on user's selection
	 * Save it in state under currentIndex
	 * @param {Object} event 		click event
	 */
	selectTimeframe = (e) => {
		if (!this._isPlus(this.props)) {
			return;
		}
		const state = Object.assign({}, this.state);
		const data = state.selection.type === 'daily' ? state.dailyData : state.monthlyData;
		if (e.target.id === 'stats-forward') {
			state.selection.currentIndex += 6;
			if (state.selection.currentIndex + 1 >= data.length) {
				state.selection.currentIndex = data.length - 1;
				state.selection.timeframeSelectors.forward = 'disabled';
			} else {
				state.selection.timeframeSelectors.forward = '';
			}
			state.selection.timeframeSelectors.back = '';
		} else if (e.target.id === 'stats-back') {
			state.selection.currentIndex -= 6;
			if (state.selection.currentIndex - 5 <= 0) {
				state.selection.currentIndex = 5;
				state.selection.timeframeSelectors.back = 'disabled';
			} else {
				state.selection.timeframeSelectors.back = '';
			}
			state.selection.timeframeSelectors.forward = '';
		}
		state.selection.selectionData = this._determineSelectionData(state);
		this.setState(state);
	}

	resetStats = () => {
		if (!this._isPlus(this.props)) {
			return;
		}
		this.setState({ showResetModal: true });
	}

	doReset = () => {
		sendMessage('resetStats');
		this.setState(this._reset(false));
	}

	cancelReset = () => {
		// Do nothing, just close the modal
		this.setState({ showResetModal: false });
	}
	/**
	 * Helper function to handle clicking on the Become a Subscriber button on modal
	 */
	subscribe = () => {
		sendMessage('ping', 'hist_plus_cta');
		openSubscriptionPage();
	}
	/**
	 * Helper function to handle clicking on Sign in link on modal
	 */
	signIn = () => {
		this.props.history.push('/login');
	}

	_reset = (demo) => {
		const demoData = [
			{ date: '2018-12-28', amount: 300, index: 0 },
			{ date: '2018-12-29', amount: 450, index: 1 },
			{ date: '2018-12-30', amount: 150, index: 2 },
			{ date: '2018-12-31', amount: 600, index: 3 },
			{ date: '2019-01-01', amount: 300, index: 4 },
			{ date: '2019-01-02', amount: 450, index: 5 },
		];

		const clearData = {
			date: moment().format('YYYY-MM-DD'),
			trackersSeen: 0,
			trackersBlocked: 0,
			trackersAnonymized: 0,
			adsBlocked: 0,
		};

		const clearOrDemoState = {
			selection: {
				type: 'daily',
				view: demo ? '' : 'trackersSeen',
				demo,
				graphTitle: this.getGraphTitle('daily', 'trackersSeen'),
				graphIconPath: this.getGraphIconPath('trackersSeen'),
				summaryTitle: this.getSummaryTitle('daily'),
				tooltipText: t('panel_stats_trackers_seen'),
				summaryData: clearData,
				selectionData: demo ? demoData : [{ date: clearData.date, amount: clearData.trackersSeen, index: 0 }],
				currentIndex: 0,
				timeframeSelectors: { back: 'disabled', forward: 'disabled' },
			},
			dailyData: [clearData],
			monthlyData: [clearData],
			cumulativeMonthlyData: [clearData],
			cumulativeData: clearData,
			monthlyAverageData: clearData,
			dailyAverageData: clearData,
			showResetModal: false,
			showPitchModal: (!this.props.user || !this.props.user.subscriptionsPlus),
		};
		return clearOrDemoState;
	}

	_getAllStats = () => (
		sendMessageInPromise('getAllStats')
	);

	/**
	 * Retrieve locally stored stats and parse them
	 * Save it in component's state
	 */
	_init = () => {
		const state = Object.assign({}, this.state);
		this._getAllStats().then((allData) => {
			if (Array.isArray(allData)) {
				if (allData.length === 0) {
					this.setState(this._reset());
					return;
				}
				let trackersSeen = 0;
				let trackersBlocked = 0;
				let trackersAnonymized = 0;
				let adsBlocked = 0;
				const startDate = moment(allData[0].day);
				let endOfMonth = moment(startDate).endOf('month');
				let monthTrackersSeen = 0;
				let monthTrackersBlocked = 0;
				let monthTrackersAnonymized = 0;
				let monthAdsBlocked = 0;
				const dailyData = [];
				const monthlyData = [];
				const cumulativeMonthlyData = [];
				const accumulateData = (monthlyOrCumulative, currentDataItem) => {
					if (monthlyOrCumulative === 'monthly') {
						monthTrackersSeen += currentDataItem.trackersDetected;
						monthTrackersBlocked += currentDataItem.trackersBlocked;
						monthTrackersAnonymized += currentDataItem.cookiesBlocked + currentDataItem.fingerprintsRemoved;
						monthAdsBlocked += currentDataItem.adsBlocked;
					} else if (monthlyOrCumulative === 'cumulative') {
						trackersSeen += currentDataItem.trackersDetected;
						trackersBlocked += currentDataItem.trackersBlocked;
						trackersAnonymized += currentDataItem.cookiesBlocked + currentDataItem.fingerprintsRemoved;
						adsBlocked += currentDataItem.adsBlocked;
					}
				};

				allData.forEach((dataItem, i) => {
					// Day reassignments
					dailyData.push({
						trackersSeen: dataItem.trackersDetected,
						trackersBlocked: dataItem.trackersBlocked,
						trackersAnonymized: dataItem.cookiesBlocked + dataItem.fingerprintsRemoved,
						adsBlocked: dataItem.adsBlocked,
						date: dataItem.day,
					});

					// Monthly calculations
					if (moment(dataItem.day).isSameOrBefore(endOfMonth) && i !== allData.length - 1) {
						accumulateData('monthly', dataItem);
						accumulateData('cumulative', dataItem);
					} else {
						if (moment(dataItem.day).isSameOrBefore(endOfMonth) && i === allData.length - 1) {
							accumulateData('monthly', dataItem);
							accumulateData('cumulative', dataItem);
						}

						const beginOfMonth = moment(endOfMonth).startOf('month');

						const monthlyObj = {
							date: beginOfMonth.format('YYYY-MM-DD'),
							trackersSeen: monthTrackersSeen,
							trackersBlocked: monthTrackersBlocked,
							trackersAnonymized: monthTrackersAnonymized,
							adsBlocked: monthAdsBlocked,
						};

						// Cumulative data by month
						const cumulativeMonthlyObj = {
							date: beginOfMonth.format('YYYY-MM-DD'),
							trackersSeen,
							trackersBlocked,
							trackersAnonymized,
							adsBlocked,
						};

						monthlyData.push(monthlyObj);
						cumulativeMonthlyData.push(cumulativeMonthlyObj);

						monthTrackersSeen = dataItem.trackersDetected;
						monthTrackersBlocked = dataItem.trackersBlocked;
						monthTrackersAnonymized = dataItem.cookiesBlocked + dataItem.fingerprintsRemoved;
						monthAdsBlocked = dataItem.adsBlocked;

						if (!moment(dataItem.day).isSameOrBefore(endOfMonth) && i === allData.length - 1) {
							accumulateData('cumulative', dataItem);

							const oneDayBeginOfMonth = moment(dataItem.day).startOf('month');

							const oneDayMonthlyObj = {
								date: oneDayBeginOfMonth.format('YYYY-MM-DD'),
								trackersSeen: monthTrackersSeen,
								trackersBlocked: monthTrackersBlocked,
								trackersAnonymized: monthTrackersAnonymized,
								adsBlocked: monthAdsBlocked,
							};

							const oneDayCumulativeMonthlyObj = {
								date: oneDayBeginOfMonth.format('YYYY-MM-DD'),
								trackersSeen,
								trackersBlocked,
								trackersAnonymized,
								adsBlocked,
							};

							monthlyData.push(oneDayMonthlyObj);
							cumulativeMonthlyData.push(oneDayCumulativeMonthlyObj);
						}

						endOfMonth = moment(dataItem.day).endOf('month');

						if (i !== allData.length - 1) {
							accumulateData('cumulative', dataItem);
						}
					}
				});
				// Cumulative data totals
				state.cumulativeData = {
					trackersSeen,
					trackersBlocked,
					trackersAnonymized,
					adsBlocked,
				};
				// Daily averages
				state.dailyAverageData = {
					trackersSeen: Math.floor(trackersSeen / dailyData.length),
					trackersBlocked: Math.floor(trackersBlocked / dailyData.length),
					trackersAnonymized: Math.floor(trackersAnonymized / dailyData.length),
					adsBlocked: Math.floor(adsBlocked / dailyData.length),
				};
				// Monthly averages
				state.monthlyAverageData = {
					trackersSeen: Math.floor(trackersSeen / monthlyData.length),
					trackersBlocked: Math.floor(trackersBlocked / monthlyData.length),
					trackersAnonymized: Math.floor(trackersAnonymized / monthlyData.length),
					adsBlocked: Math.floor(adsBlocked / monthlyData.length),
				};

				state.dailyData = dailyData;
				state.monthlyData = monthlyData;
				state.cumulativeMonthlyData = cumulativeMonthlyData;
				state.selection.summaryData = state.cumulativeData;
				state.selection.currentIndex = dailyData.length - 1;
				state.selection.timeframeSelectors.back = dailyData.length > 6 ? '' : 'disabled';
				state.selection.view = 'trackersSeen';
				state.selection.selectionData = this._determineSelectionData(state);
				state.selection.demo = false;

				this.setState(state);
			}
		});
	}

	/**
	 * Determine data selection for Stats Graph according to parameters in state
	 * Save it in component's state
	 */
	_determineSelectionData = (state = Object.assign({}, this.state)) => {
		const {
			dailyData, monthlyData, cumulativeMonthlyData, selection
		} = state;
		let data;
		if (selection.type === 'cumulative') {
			data = cumulativeMonthlyData;
		} else if (selection.type === 'monthly') {
			data = monthlyData;
		} else if (selection.type === 'daily') {
			data = dailyData;
		}
		const dataSlice = data.length <= 6 ? data : data.slice(selection.currentIndex - 5, selection.currentIndex + 1);
		const selectionData = dataSlice.map((entry, index) => {
			const parsedEntry = { amount: entry[state.selection.view], date: entry.date, index };
			return parsedEntry;
		});
		return selectionData;
	}

	_isPlus = props => props.user && props.user.subscriptionsPlus;

	/**
	 * Render the the Stats View
	 * @return {ReactComponent} StatsView instance
	 */
	render() {
		return (
			<StatsView
				showResetModal={this.state.showResetModal}
				showPitchModal={!this.props.user || !this.props.user.subscriptionsPlus}
				loggedIn={this.props.loggedIn}
				getStats={this.getStats}
				selection={this.state.selection}
				selectView={this.selectView}
				selectType={this.selectType}
				selectTimeframe={this.selectTimeframe}
				resetStats={this.resetStats}
				doReset={this.doReset}
				cancelReset={this.cancelReset}
				subscribe={this.subscribe}
				signIn={this.signIn}
			/>
		);
	}
}

export default Stats;
