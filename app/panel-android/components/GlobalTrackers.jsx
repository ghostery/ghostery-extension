import React from 'react';
import PropTypes from 'prop-types';
import Accordions from './content/Accordions';
import DotsMenu from './content/DotsMenu';

export default class GlobalTrackers extends React.Component {
	actions = [
		{
			name: 'Block All',
			callback: () => {
				this.context.callGlobalAction({
					actionName: 'blockUnBlockAllTrackers',
					actionData: {
						block: true,
						type: 'global',
					}
				});
			},
		},
		{
			name: 'Unblock All',
			callback: () => {
				this.context.callGlobalAction({
					actionName: 'blockUnBlockAllTrackers',
					actionData: {
						block: false,
						type: 'global',
					}
				});
			},
		},
		{
			name: 'Reset Settings',
			callback: () => {
				this.context.callGlobalAction({
					actionName: 'resetSettings',
				});
			},
		}
	]

	get categories() {
		return this.props.categories;
	}

	render() {
		return (
			<div className="global-trackers">
				<div className="header">
					<h2>Global Trackers</h2>
					<DotsMenu actions={this.actions} />
				</div>
				<Accordions type="global-trackers" categories={this.categories} />
			</div>
		)
	}
}

GlobalTrackers.propTypes = {
	categories: PropTypes.array,
};

GlobalTrackers.contextTypes = {
	callGlobalAction: PropTypes.func,
};
