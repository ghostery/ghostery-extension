/**
 * Blocking Category Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2020 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React from 'react';
import PropTypes from 'prop-types';
import BlockingCategory from './BlockingCategory';

class BlockingCategories extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			openCategoryIndex: -1,
		};
	}

	getOpenStatus = (index) => {
		const { openCategoryIndex } = this.state;
		return index === openCategoryIndex;
	}

	getTrackersFromCategory = (categoryId) => {
		const { categories } = this.props;
		const category = categories[categories.findIndex(cat => cat.id === categoryId)];
		return category.trackers;
	}

	toggleCategoryOpen = (index) => {
		const { openCategoryIndex } = this.state;
		if (openCategoryIndex === index) {
			this.setState({ openCategoryIndex: -1 });
		} else {
			this.setState({ openCategoryIndex: index });
		}
	}

	render() {
		const {
			categories,
			type,
			siteProps,
			callGlobalAction,
		} = this.props;
		return (
			<div className="BlockingCategories">
				{
					categories.map((category, index) => (
						<BlockingCategory
							key={category.id}
							index={index}
							category={category}
							toggleCategoryOpen={this.toggleCategoryOpen}
							open={this.getOpenStatus(index)}
							type={type}
							siteProps={siteProps}
							callGlobalAction={callGlobalAction}
						/>
					))
				}
			</div>
		);
	}
}

BlockingCategories.propTypes = {
	categories: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
	type: PropTypes.oneOf([
		'site-trackers',
		'global-trackers',
	]).isRequired,
	siteProps: PropTypes.shape({}).isRequired,
	callGlobalAction: PropTypes.func.isRequired,
};

export default BlockingCategories;
