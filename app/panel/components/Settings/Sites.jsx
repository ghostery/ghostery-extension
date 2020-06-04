/**
 * Trust/Restrict Sites Component
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
import Site from './Site';
/**
 * @class Implement generic component for the list of sites.
 * Component is used in TrustAndRestrict.jsx to represent the
 * lists of whitelisted and blacklisted sites.
 * @memberOf SettingsComponents
 */
const Sites = (props) => {
	const { sites, listType } = props;
	const siteList = sites.map(site => (
		<Site key={site} site={site} listType={listType} updateSitePolicy={props.updateSitePolicy} />
	));
	return <div className="s-sites">{ siteList }</div>;
};

Sites.defaultProps = {
	sites: {},
};

export default Sites;
