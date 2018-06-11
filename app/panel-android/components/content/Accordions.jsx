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

	getOpenStatus = index => index === this.state.openAccordionIndex;

	getTrackersFromCategory = (categoryId) => {
		const category = this.props.categories[this.props.categories.findIndex(cat => cat.id === categoryId)];
		return category.trackers;
	}

	toggleAccordion = (index) => {
		if (this.state.openAccordionIndex === index) {
			this.setState({ openAccordionIndex: -1 });
		} else {
			this.setState({ openAccordionIndex: index });
		}
	}

	render() {
		return (
			<div className="accordions">
				{
					this.props.categories.map((category, index) =>
						(<Accordion
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
							type={this.props.type}
						/>)
					)
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
