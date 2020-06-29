/**
 * Overview Tab Component
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

const OverviewTab = ({
	navigationLinks,
	notScanned,
	donutGraph,
	pageHost,
	trackersBlocked,
	requestsModified,
	ghosteryFeatures,
	cliqzFeatures,
}) => (
	<div className="OverviewTab">
		{navigationLinks}

		{!!notScanned && (
			<div className="OverviewTab__NotScannedContainer">
				{notScanned}
			</div>
		)}

		{!notScanned && (
			<div>
				<div className="OverviewTab__DonutGraphContainer">
					{donutGraph}
				</div>
				<div className="OverviewTab__PageHostContainer">
					{pageHost}
				</div>
				<div className="OverviewTab__PageStatsContainer">
					{trackersBlocked}
					{requestsModified}
				</div>
			</div>
		)}

		<div className="OverviewTab__GhosteryFeaturesContainer">
			{ghosteryFeatures}
		</div>

		<div className="OverviewTab__CliqzFeaturesContainer">
			{cliqzFeatures}
		</div>
	</div>
);

OverviewTab.propTypes = {
	navigationLinks: PropTypes.node.isRequired,
	notScanned: PropTypes.oneOfType([
		PropTypes.bool,
		PropTypes.node,
	]).isRequired,
	donutGraph: PropTypes.node.isRequired,
	pageHost: PropTypes.node.isRequired,
	trackersBlocked: PropTypes.node.isRequired,
	requestsModified: PropTypes.node.isRequired,
	ghosteryFeatures: PropTypes.node.isRequired,
	cliqzFeatures: PropTypes.node.isRequired,
};

export default OverviewTab;
