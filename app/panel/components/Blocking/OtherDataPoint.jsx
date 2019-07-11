/**
 * Tracker Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

/* eslint react/no-array-index-key: 0 */

import React from 'react';
/**
 * @class Implement Tracker component which represents single tracker
 * in the Blocking view.
 * @memberOf BlockingComponents
 */
class OtherDataPoint extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			trackerClasses: '',
		};
	}
	/**
	 * Lifecycle event.
	 */
	componentWillMount() {
		this.updateTrackerClasses(this.props.tracker);
	}
	/**
	 * Lifecycle event.
	 */
	componentWillReceiveProps(nextProps) {
		this.updateTrackerClasses(nextProps.tracker);
	}
	/**
	 * Set dynamic classes on .blocking-trk and save it in state.
	 * @param  {Object} tracker    tracker object
	 */
	updateTrackerClasses(tracker) {
		const classes = [];
		classes.push((tracker.blocked) ? 'blocked' : '');
		classes.push((tracker.ss_allowed) ? 'individual-trust' : '');

		this.setState({
			trackerClasses: classes.join(' '),
		});
	}

	/**
	 * Implement handler for clicking on the tracker site-specific trust icon.
	 * Trigger actions which persist the new setting and notify user
	 * that the page should be reloaded.
	 */
	clickTrackerTrust() {
		const ss_allowed = !this.props.tracker.ss_allowed;
		this.props.actions.updateTrackerTrustRestrict({
			app_id: this.props.tracker.id,
			cat_id: this.props.cat_id,
			trust: ss_allowed,
			restrict: false,
		});

		this.props.actions.showNotification({
			updated: `${this.props.tracker.id}_ss_allowed`,
			reload: true,
		});
	}

	/**
	 * Implement handler for clicking on the tracker site-specific block icon.
	 * Trigger actions which persist the new setting and notify user
	 * that the page should be reloaded.
	 */
	clickTrackerRestrict() {
		const ss_blocked = !this.props.tracker.ss_blocked;
		this.props.actions.updateTrackerTrustRestrict({
			app_id: this.props.tracker.id,
			cat_id: this.props.cat_id,
			trust: false,
			restrict: ss_blocked,
		});

		this.props.actions.showNotification({
			updated: `${this.props.tracker.id}_ss_blocked`,
			reload: true,
		});
	}
	/**
	* Render a tracker in Blocking view.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { tracker } = this.props;

		return (
			<div className={`${this.state.trackerClasses} blocking-trk`}>
				<div className="row align-middle trk-header">
					<div className="columns collapse-left">
						<div className="data-point trk-name">{ tracker.name }</div>
					</div>
					<div className="columns shrink align-self-justify collapse-right">
						<div className="OtherDataPoint__svgGroup">

							{/* USE INLINE SVG FOR TRUST CIRCLE TO CHANGE COLORS WITH CSS */}
							<span className="t-tooltip-up-left" data-g-tooltip="Trust on this site">
								<svg className="" onClick={this.clickTrackerTrust} width="20px" height="20px" viewBox="0 0 20 20">
									<g transform="translate(1 1)" fill="none" fillRule="evenodd">
										<path className="border" stroke="#96c761" d="M-.5-.5h18.3v18.217H-.5z" />
										<path className="background" stroke="#FFF" fill="#96c761" d="M.5.5h16.3v16.217H.5z" />
										<svg width="20px" height="20px" viewBox="-2.75 -2.75 20 20">
											<circle stroke="#FFF" cx="5.875" cy="5.875" r="5.875" fillRule="evenodd" />
										</svg>
									</g>
								</svg>
							</span>

							{/* USE INLINE SVG FOR ANTI-TRACKING SHIELD TO CHANGE COLORS WITH CSS */}
							<span className="t-tooltip-up-left" data-g-tooltip="Scrub on this site" >
								<svg className="" onClick={this.clickTrackerRestrict} width="20px" height="20px" viewBox="0 0 20 20">
									<g transform="translate(1 1)" fill="none" fillRule="evenodd">
										<path className="border" stroke="#00AEF0" d="M-.5-.5h18.3v18.217H-.5z" />
										<path className="background" stroke="#FFF" fill="#00AEF0" d="M.5.5h16.3v16.217H.5z" />
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 19.5 19.5">
											<g transform="translate(2.5 2.5)">
												<path fill="none" fillRule="evenodd" stroke="#FFF" strokeWidth="1.4" d="M8.149 1.022a.505.505 0 0 0-.298 0l-6.404 1.7A.574.574 0 0 0 1 3.286c.03 4.56 2.472 8.792 6.672 11.624.09.06.209.089.328.089.12 0 .238-.03.328-.09 4.2-2.83 6.642-7.063 6.672-11.623a.574.574 0 0 0-.447-.566L8.15 1.022z" />
											</g>
										</svg>
									</g>
								</svg>
							</span>

						</div>
					</div>
				</div>
			</div>
		);
	}
}

OtherDataPoint.defaultProps = {
	tracker: {},
};

export default OtherDataPoint;
