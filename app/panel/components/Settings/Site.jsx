/**
 * Trust/Restrict Site Component
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
/**
 * @class Implement site entry in the lists of whitelisted/blacklisted site. See Sites.jsx.
 * @memberOf SettingsComponents
 */
class Site extends React.Component {
	constructor(props) {
		super(props);

		this.removeSite = this.removeSite.bind(this);
	}

	/**
	 * Trigger action for removing site from the list.
	 */
	removeSite() {
		this.props.updateSitePolicy({ type: this.props.listType, pageHost: this.props.site });
	}

	/**
	* Render site entry.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { site } = this.props;
		return (
			<div className="s-site row align-middle align-justify">
				<div className="columns">
					<div className="s-site-name">{ site }</div>
				</div>
				<div className="columns shrink">
					<div className="s-site-x-container" onClick={this.removeSite} />
				</div>
			</div>
		);
	}
}

Site.defaultProps = {
	site: '',
};

export default Site;
