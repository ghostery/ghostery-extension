/**
 * Side Navigation Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 *
 * ToDo: Add Proptypes (items)
 */

import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * @class Implement the Side Navigation for the Ghostery Hub
 * @extends Component
 * @memberof HubComponents
 */
class SideNavigationView extends Component {
	constructor(props) {
		super(props);

		const { items } = props;
		const topItems = [];
		const listItems = [];
		const bottomItems = [];

		for (let i = 0; i < items.length; i++) {
			const item = items[i] || {};
			switch (item.location) {
				case 'top':
					topItems.push(item);
					break;
				case 'list':
					listItems.push(item);
					break;
				case 'bottom':
					bottomItems.push(item);
					break;
				default:
					break;
			}
		}

		this.state = { topItems, listItems, bottomItems };
	}

	/**
	 * Function to tell you if a route has nested routes
	 * @param  {Object}  item  The route item in the Side Navigation
	 * @return {Boolean}       Whether the route item has a nested route
	 */
	_hasNestedRoutes(item) {
		const parentRoutes = ['setup', 'tutorial'];
		return parentRoutes.some(parentRoute => item.href.includes(parentRoute));
	}

	/**
	* Helper render function for rendering a Side Navigation List Item
	* @return {JSX} JSX for the Navigation Item
	*/
	_renderItem(item = {}, index) {
		switch (item.type) {
			case 'separator':
				return <hr key={index} />;
			case 'link':
				return (
					<NavLink exact={!this._hasNestedRoutes(item)} to={item.href} key={index} className="flex-container align-middle">
						<div className="flex-child-auto">{item.text}</div>
						<div className="arrow-left">
							<div className="arrow-left-top" />
							<div className="arrow-left-bottom" />
						</div>
					</NavLink>
				);
			default:
				return <div key={index}>{item.text}</div>;
		}
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Side Navigation of the Hub app
	 */
	render() {
		const { topItems, listItems, bottomItems } = this.state;

		return (
			<div className="SideNavigation__container flex-container flex-dir-column">
				<div className="SideNavigation__top">
					{topItems.map((item, i) => this._renderItem(item, i))}
				</div>
				<div className="SideNavigation__list flex-child-grow">
					<ul>
						{listItems.map((item, i) => (
							<li>
								{this._renderItem(item, i)}
							</li>
						))}
					</ul>
				</div>
				<div className="SideNavigation__bottom">
					{bottomItems.map((item, i) => this._renderItem(item, i))}
				</div>
			</div>
		);
	}
}

export default SideNavigationView;
