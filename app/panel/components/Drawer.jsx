/**
 * Drawer Component
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

/* eslint react/no-string-refs: 0 */

import React, { Component } from 'react';
import Tooltip from './Tooltip';
/**
 * @class Implement panel at the bottom of the main panel
 * which slides up when user clicks on feature icon on the panel.
 * It allows to toggle a feature and display its stats.
 * @memberof PanelClasses
 */
class Drawer extends React.Component {
	componentDidMount() {
		document.body.addEventListener('click', this.clickOutsideHandler);
		this.props.actions.getCliqzModuleData();
	}
	/**
	 * Lifecycle event
	 */
	componentWillUnmount() {
		document.body.removeEventListener('click', this.clickOutsideHandler);
	}
	/**
	 * Calculate total number of trackers being accosted by a specified feature
	 * @param  {string} type  		name of the feature
	 * @return {number} 	      	total number of trackers
	 */
	getCount = (type) => {
		let total = 0;
		switch (type) {
			case 'enable_anti_tracking':
				for (const category in this.props.antiTracking) {
					if (this.props.antiTracking.hasOwnProperty(category)) {
						for (const app in this.props.antiTracking[category]) {
							if (this.props.antiTracking[category][app] === 'unsafe') {
								total++;
							}
						}
					}
				}
				return total;
			case 'enable_ad_block':
				return this.props.adBlock && this.props.adBlock.totalCount || 0;
			case 'enable_smart_block':
				Object.keys(this.props.smartBlock.blocked).forEach((key) => {
					total++;
				});
				Object.keys(this.props.smartBlock.unblocked).forEach((key) => {
					total++;
				});
				return total;
			default:
				return 0;
		}
	}

	/**
	 * Map active feature name to a locator of the corresponding button.
	 *
	 * @return {string} 	 style class name of the corresponding button
	 */
	getButtonClassName = () => {
		switch (this.props.activeDrawerType) {
			case 'enable_anti_tracking':
				return 'anti-track-btn';
			case 'enable_ad_block':
				return 'ad-block-btn';
			case 'enable_smart_block':
				return 'smart-block-btn';
			default:
				return false;
		}
	}
	/**
	 * Handle clicks outside buttons. This action should close the drawer.
	 * @param {Object} evt 		mouseclick event
	 */
	clickOutsideHandler = (evt) => {
		const activeClassName = this.getButtonClassName();
		if (!this.refs.drawer.contains(evt.target)
			&& (!evt.target.classList.contains('cliqz-control-btn') ||
			evt.target.classList.contains(activeClassName))
			&& !evt.target.classList.contains('needs-reload-link')) {
			evt.preventDefault();
			evt.stopPropagation();
			this.props.actions.closeDrawer();
		}
	}

	isChecked = () => this.props[this.props.activeDrawerType] || false

	toggleSetting = () => {
		this.props.actions.showNotification({
			updated: this.props.activeDrawerType,
			reload: true,
		});
		this.props.actions.toggleDrawerSetting(this.props.activeDrawerType, this.isChecked());
	}
	/**
	 * Render drawer at the bottom of the main view.
	 * @return {ReactComponent}   ReactComponent instance
	 */
	render() {
		return (
			<div className="drawer-drawer" ref="drawer">
				<div className="drawer-header">
					<span>
						{ t(`drawer_title_${this.props.activeDrawerType}`) }
					</span>
					<div className="close-drawer" onClick={this.props.actions.closeDrawer}>
						<img src="../images/drawer/x.svg" />
					</div>
				</div>
				<div className="drawer-body row align-center align-middle">
					<div className="columns shrink">
						<div className="cliqz-controls">
							<button className={`${this.getButtonClassName()} ${this.isChecked() ? 'active' : ''} button controls-trust`} />
						</div>
						<div className="tracker-count">
							{this.getCount(this.props.activeDrawerType)}
						</div>
					</div>
					<div className="columns drawer-details">
						<div className="drawer-title">
							{ t(`drawer_label_${this.props.activeDrawerType}`) }
							<div className="g-tooltip">
								<img src="../../app/images/panel/icon-information-tooltip.svg" />
								<Tooltip
									header={false}
									body={t(`drawer_tooltip_${this.props.activeDrawerType}`)}
									position="top"
								/>
							</div>
						</div>
						<div className="drawer-description">{t(`drawer_desc_${this.props.activeDrawerType}`)}</div>
					</div>
					<div className="columns shrink">
						<div className="drawer-status">
							{ t(`drawer_status_${this.props.activeDrawerType}`) }
							<span>{this.isChecked() ? t('drawer_on') : t('drawer_off')}</span>
						</div>
						<label className="switch">
							<input checked={this.isChecked()} type="checkbox" onChange={this.toggleSetting} />
							<span className="slider" />
							<span className="slider-circle" />
						</label>
					</div>
				</div>
			</div>
		);
	}
}

export default Drawer;
