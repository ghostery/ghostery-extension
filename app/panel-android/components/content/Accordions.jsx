/**
 * Accordions Component
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

import React from 'react';
import PropTypes from 'prop-types';

import Accordion from './Accordion';

class Accordions extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			openAccordionIndex: -1,
		};
	}

	getOpenStatus = (index) => {
		const { openAccordionIndex } = this.state;
		return index === openAccordionIndex;
	}

	getTrackersFromCategory = (categoryId) => {
		const { categories } = this.props;
		const category = categories[categories.findIndex(cat => cat.id === categoryId)];
		return category.trackers;
	}

	toggleAccordion = (index) => {
		const { openAccordionIndex } = this.state;
		if (openAccordionIndex === index) {
			this.setState({ openAccordionIndex: -1 });
		} else {
			this.setState({ openAccordionIndex: index });
		}
	}

	render() {
		const { categories, type } = this.props;
		return (
			<div className="accordions">
				{
					categories.map((category, index) => (
						<Accordion
							key={category.id}
							index={index}
							numBlocked={category.num_blocked}
							name={category.name}
							numTotal={category.num_total}
							logo={category.img_name}
							getTrackersFromCategory={this.getTrackersFromCategory}
							toggleAccordion={this.toggleAccordion}
							open={this.getOpenStatus(index)}
							id={category.id}
							type={type}
						/>
					))
				}
			</div>
		);
	}
}

Accordions.propTypes = {
	categories: PropTypes.arrayOf(PropTypes.object),
	type: PropTypes.string,
};

Accordions.defaultProps = {
	categories: [],
	type: '',
};

export default Accordions;
