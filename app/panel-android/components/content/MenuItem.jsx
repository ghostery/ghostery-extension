import React from 'react';
import PropTypes from 'prop-types';

export default class MenuItem extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			opening: false,
		};
	}

	menuItemClicked = () => {
		this.setState({
			opening: true,
		});

		this.props.updateHeadeText(this.props.title);
	}

	closeButtonClicked = () => {
		this.setState({
			opening: false,
		});

		this.props.updateHeadeText('');
	}

	switcherClicked = () => {
		this.context.callGlobalAction({
			actionName: 'cliqzFeatureToggle',
			actionData: {
				currentState: this.props.active,
				type: this.props.type,
			},
		});
	}

	render() {
		return (
			<div className="menuItemWrapper">
				<div onClick={this.menuItemClicked} className="menuItemOverview">
					<span className={this.props.type}>{this.props.numData}</span>
					<span className="title">{this.props.title}</span>
					<p className="description">{this.props.description}</p>
				</div>
				<span onClick={this.switcherClicked} className={`switcher ${this.props.active ? 'active' : ''}`} />
				<div className={`menuItemContent ${this.state.opening ? 'opening' : ''}`}>
					<span className={this.props.type}>{this.props.numData}</span>
					<p className="headline">{this.props.headline}</p>
					<p className="description">{this.props.description}</p>
					<button onClick={this.closeButtonClicked} className="close" />
				</div>
			</div>
		);
	}
}

MenuItem.propTypes = {
	active: PropTypes.bool,
	type: PropTypes.string,
	title: PropTypes.string,
	numData: PropTypes.number,
	headline: PropTypes.string,
	description: PropTypes.string,
};

MenuItem.defaultProps = {
	active: false,
	type: '',
	title: '',
	numData: 0,
	headline: '',
	description: '',
};

MenuItem.contextTypes = {
	callGlobalAction: PropTypes.func,
};
