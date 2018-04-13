import React from 'react';
import PropTypes from 'prop-types';
import Accordions from './content/Accordions';
import DotsMenu from './content/DotsMenu';

export default class SiteTrackers extends React.Component {
	actions = [
		{
			name: 'Block All',
			callback: () => {
				this.context.callGlobalAction({
					actionName: 'blockUnBlockAllTrackers',
					actionData: {
						block: true,
						type: 'site',
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
						type: 'site',
					}
				});
			},
		}
	]

	render() {
		return (
			<div className="site-trackers">
				<div className="header">
					<h2>Trackers on this site</h2>
					<DotsMenu actions={this.actions} />
				</div>
				<Accordions type="site-trackers" categories={this.props.categories} />
			</div>
		)
	}
}

SiteTrackers.propTypes = {
	categories: PropTypes.array,
}

SiteTrackers.contextTypes = {
	callGlobalAction: PropTypes.func,
};
