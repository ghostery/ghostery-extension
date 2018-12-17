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
		this.state = this._reset(true);
	}

	componentDidMount() {
		sendMessage('ping', 'hist_stats_panel');
		if (!this._isSupporter(this.props)) {
			return;
		}
		this._init();
	}

	componentWillReceiveProps(nextProps) {
		const nextSupporter = this._isSupporter(nextProps);
		const thisSupporter = this._isSupporter(this.props);
		if (nextSupporter !== thisSupporter) {
			if (nextSupporter) {
				this._init();
			} else {
				this.setState(this._reset(true));
			}
		}
	}

	getGraphTitleBase = (view) => {
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
		const state = Object.assign({}, this.state);
		const { selection } = state;
		if (event.currentTarget.id !== selection.view) {
			selection.view = event.currentTarget.id;
			sendMessage('ping', selection.view);
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
		if (!this._isSupporter(this.props)) {
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
			sendMessage('ping', selection.type);

			const { monthlyData, dailyData } = state;
			if (selection.type === 'daily' && lastType !== 'daily') {
				const currentDate = monthlyData[selection.currentIndex].date;
				for (let i = dailyData.length - 1; i >= 0; i--) {
					if (dailyData[i].date.slice(0, 7) === currentDate.slice(0, 7)) {
						selection.currentIndex = i;
						break;
					}
				}

				if (dailyData.length < 6) {
					selection.timeframeSelectors.back = 'disabled';
					selection.timeframeSelectors.forward = 'disabled';
				} else {
					selection.timeframeSelectors.back = selection.currentIndex === 0 ? 'disabled' : '';
					selection.timeframeSelectors.forward = selection.currentIndex + 1 === dailyData.length ? 'disabled' : '';
				}
			} else if (selection.type !== 'daily' && lastType === 'daily') {
				const currentDate = dailyData[selection.currentIndex].date;
				for (let i = monthlyData.length - 1; i >= 0; i--) {
					if (monthlyData[i].date.slice(0, 7) === currentDate.slice(0, 7)) {
						selection.currentIndex = i;
						break;
					}
				}

				if (monthlyData.length < 6) {
					selection.timeframeSelectors.back = 'disabled';
					selection.timeframeSelectors.forward = 'disabled';
				} else {
					selection.timeframeSelectors.back = selection.currentIndex === 0 ? 'disabled' : '';
					selection.timeframeSelectors.forward = selection.currentIndex + 1 === monthlyData.length ? 'disabled' : '';
				}
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
		if (!this._isSupporter(this.props)) {
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
			if (state.selection.currentIndex - 6 <= 0) {
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
		if (!this._isSupporter(this.props)) {
			return;
		}
		this.setState({ showResetModal: true });
	}

	doReset = () => {
		sendMessage('resetStats');
		this.setState(this._reset());
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

	_reset = (freeze) => {
		const clearData = freeze ? {} : {
			date: moment().format('YYYY-MM-DD'),
			trackersSeen: 0,
			trackersBlocked: 0,
			trackersAnonymized: 0,
			adsBlocked: 0,
		};
		const clearState = {
			selection: {
				type: 'cumulative',
				view: freeze ? '' : 'trackersSeen',
				graphTitle: this.getGraphTitle('cumulative', 'trackersSeen'),
				graphIconPath: this.getGraphIconPath('trackersSeen'),
				summaryTitle: this.getSummaryTitle('cumulative'),
				tooltipText: t('panel_stats_trackers_seen'),
				summaryData: clearData,
				selectionData: [clearData],
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
			showPitchModal: (!this.props.user || !this.props.user.subscriptionsSupporter),
		};
		clearState.selection.selectionData = this._determineSelectionData(clearState);
		return clearState;
	}

	_getAllStats = () => (
		sendMessageInPromise('getAllStats')
	);

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
				let prevDate = '';
				let monthTrackersSeen = 0;
				let monthTrackersBlocked = 0;
				let monthTrackersAnonymized = 0;
				let monthAdsBlocked = 0;
				const dailyData = [];
				const monthlyData = [];
				const cumulativeMonthlyData = [];
				allData.forEach((dataItem, i) => {
					// Add zero values for nonexistent days
					if (i !== 0) {
						while (prevDate !== moment(dataItem.day).subtract(1, 'days').format('YYYY-MM-DD')) {
							prevDate = moment(prevDate).add(1, 'days').format('YYYY-MM-DD');
							dailyData.push({
								trackersSeen: 0,
								trackersBlocked: 0,
								trackersAnonymized: 0,
								adsBlocked: 0,
								date: prevDate,
							});
						}
					}

					// Day reassignments
					dailyData.push({
						trackersSeen: dataItem.trackersDetected,
						trackersBlocked: dataItem.trackersBlocked,
						trackersAnonymized: dataItem.cookiesBlocked + dataItem.fingerprintsRemoved,
						adsBlocked: dataItem.adsBlocked,
						date: dataItem.day,
					});

					trackersSeen += dataItem.trackersDetected;
					trackersBlocked += dataItem.trackersBlocked;
					trackersAnonymized += dataItem.cookiesBlocked + dataItem.fingerprintsRemoved;
					adsBlocked += dataItem.adsBlocked;

					// Monthly calculations
					if (moment(dataItem.day).isSameOrBefore(endOfMonth) && i !== allData.length - 1) {
						monthTrackersSeen += dataItem.trackersDetected;
						monthTrackersBlocked += dataItem.trackersBlocked;
						monthTrackersAnonymized += dataItem.cookiesBlocked + dataItem.fingerprintsRemoved;
						monthAdsBlocked += dataItem.adsBlocked;
					} else {
						const beginOfMonth = moment(endOfMonth).startOf('month');

						monthTrackersSeen += dataItem.trackersDetected;
						monthTrackersBlocked += dataItem.trackersBlocked;
						monthTrackersAnonymized += dataItem.cookiesBlocked + dataItem.fingerprintsRemoved;
						monthAdsBlocked += dataItem.adsBlocked;

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

						endOfMonth = moment(dataItem.day).endOf('month');

						monthTrackersSeen = 0;
						monthTrackersBlocked = 0;
						monthTrackersAnonymized = 0;
						monthAdsBlocked = 0;
					}
					prevDate = dataItem.day;
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
					trackersSeen: Math.floor(trackersSeen / allData.length),
					trackersBlocked: Math.floor(trackersBlocked / allData.length),
					trackersAnonymized: Math.floor(trackersAnonymized / allData.length),
					adsBlocked: Math.floor(adsBlocked / allData.length),
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
				state.selection.currentIndex = monthlyData.length - 1;
				state.selection.timeframeSelectors.back = monthlyData.length > 6 ? '' : 'disabled';
				state.selection.view = 'trackersSeen';
				state.selection.selectionData = this._determineSelectionData(state);

				this.setState(state);
			}
		});
	}

	/**
	 * Determine data selection for Stats Graph according to parameters in state
	 * Save it in state
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
		const selectionData = dataSlice.map((entry) => {
			const parsedEntry = { amount: entry[state.selection.view], date: entry.date };
			return parsedEntry;
		});
		return selectionData;
	}

	_isSupporter = props => props.user && props.user.subscriptionsSupporter

	/**
	 * Render the the Stats View
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<StatsView
				showResetModal={this.state.showResetModal}
				showPitchModal={!this.props.user || !this.props.user.subscriptionsSupporter}
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
