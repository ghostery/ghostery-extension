/**
 * Categories Component
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
import Category from './Category';

/**
 * @class Implement Categories component, which represents a
 * container of available categories. This component is shared
 * by Blocking view and Global Blocking subview in Settings.
 * @memberOf BlockingComponents
 */
class Categories extends React.Component {
	componentDidMount() {}

	/**
	* Render a list of categories. Pass globalBlocking flag to all categories
	* in the list, so that they would know which view they are part of.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { categories, expandAll } = this.props;
		const globalBlocking = !!this.props.globalBlocking;
		const filtered = !!this.props.filtered;
		const categoryList = categories.map((cat, index) => (
			<Category
				expandAll={expandAll}
				globalBlocking={globalBlocking}
				index={index}
				category={cat}
				actions={this.props.actions}
				key={cat.id}
				filtered={filtered}
				showToast={this.props.showToast}
				show_tracker_urls={this.props.show_tracker_urls}
				sitePolicy={this.props.sitePolicy}
				paused_blocking={this.props.paused_blocking}
				language={this.props.language}
				smartBlockActive={this.props.smartBlockActive}
				smartBlock={this.props.smartBlock}
			/>
		));
		return <div className="scroll-content">{ categoryList }</div>;
	}
}

Categories.defaultProps = {
	categories: [],
};

export default Categories;
