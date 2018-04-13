import React from 'react';
import PropTypes from 'prop-types';

export default class DotsMenu extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			opening: false,
		};
	}

	componentDidMount() {
		window.addEventListener('click', this.handleClick, false);
	}

	componentWillUnmount() {
		window.removeEventListener('click', this.handleClick, false);
	}

	/* Close the menu if user clicks anywhere on the window */
	handleClick = (event) => {
		if (this.state.opening && event.target.className.indexOf('dots-menu-btn') === -1) {
			this.setState({
				opening: false,
			});
		}
	}

	/* Toggle menu */
	dotsButtonClicked = () => {
		const currentState = this.state.opening;

		this.setState({
			opening: !currentState,
		});
	}

	render() {

		return (
			<div className="dots-menu">
				<button className="dots-menu-btn" onClick={this.dotsButtonClicked}></button>
				<div className={`dots-menu-content ${this.state.opening ? 'opening' : ''}`}>
					<ul>
						{this.props.actions.map((action, index) =>
							<li key={index}>
								<button className="dots-menu-item" onClick={action.callback}>{action.name}</button>
							</li>
						)}
					</ul>
				</div>
			</div>
		);
	}
}

DotsMenu.propTypes = {
	actions: PropTypes.array,
};
