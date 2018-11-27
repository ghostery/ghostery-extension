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
import ClassNames from 'classnames';
import { Link } from 'react-router-dom';
import StatsView from './StatsView';
import { sendMessage } from '../utils/msg';
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
				selectionText: this.getSelectionText('cumulative', 'trackersSeen'),
				summaryData: {},
			}
		};

		// event bindings
        this.selectView = this.selectView.bind(this);
		this.selectType = this.selectType.bind(this);
	}

	componentDidMount() {
		const selection = Object.assign({}, this.state.selection);
		selection.summaryData = {
			trackersSeen: 20486,
			trackersBlocked: 12614,
			trackersAnonymized: 18486,
			adsBlocked: 14614,
		};
		this.setState({ selection }, () => {
			console.log("SELECTION:", this.state.selection);
		});
	}
	/**
	 * Set view selection according to the clicked button. Save it in state.
	 * @param {Object} event 		click event
	 */
	selectView(event) {
		const selection = Object.assign({}, this.state.selection);
		if (event.currentTarget.id !== selection.view) {
            selection.view = event.currentTarget.id;
			sendMessage('ping', selection.view);
			selection.selectionText = this.getSelectionText(selection.type, selection.view);
			this.setState({ selection }, () => {
                console.log("SELECTION:", this.state.selection);
            });
		}
	}
	/**
	 * Set type selection according to the clicked button. Save it in state.
	 * @param {Object} event 		click event
	 */
	selectType(event) {
		const selection = Object.assign({}, this.state.selection);
		if (event.currentTarget.id !== selection.type) {
            selection.type = event.currentTarget.id;
			selection.selectionText = this.getSelectionText(selection.type, selection.view);
            sendMessage('ping', selection.type);

			this.setState({ selection }, () => {
                console.log("SELECTION:", this.state.selection);
            });
		}
	}

	getViewText(view) {
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

	getSelectionText(type, view) {
		const viewText = this.getViewText(view);
		if(viewText) {
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

	resetStats() {
		console.log("RESET STATS CALLED");
	}

	/**
	 * Render the expert view footer.
	 * @return {ReactComponent}   ReactComponent instance
	 */
    render() {
        return (
            <div id="content-stats">
                <StatsView subscriber={true} selection={this.state.selection} selectView={this.selectView} selectType={this.selectType} resetStats={this.resetStats}/>
            </div>
        );
    }
}

export default Stats;
