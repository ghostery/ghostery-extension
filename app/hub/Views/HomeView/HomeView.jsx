/**
 * Home View Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 *
 * ToDo: Update this file.
 */

import React from 'react';

/**
 * @class Implement the Home View for the Ghostery Hub
 * @memberof HubComponents
 */
const HomeView = () => (
	<div>
		<div className="row ready-header">
			<div className="columns small-6">
				<div className="ghosty-dialogue" />
			</div>
			<div className="columns small-6">
				<h1>Ghostery is Ready!</h1>
				<p>you are now protected with the Ghostery recommended default settings.</p>
				<span className="bold">Start browsing!</span>
				<label>
					<input type="checkbox" />
					Support Ghostery by sharing Human Web & Analytics data.
					<a>Learn more.</a>
				</label>
			</div>
		</div>
		<div className="row optimize-create">
			<div className="columns small-6">
				<span>Optimze your ghostery experience</span>
			</div>
			<div className="columns small-6">
				<a>Create Account</a>
			</div>
		</div>
		<div className="row tutorial-custom">
			<div className="columns small-6">
				tutorial
			</div>
			<div className="columns small-6">
				customize setup
			</div>
		</div>
		<div className="row supporter">
			<div className="columns small-6">
				become a ghostery support text
			</div>
			<div className="columns small-6">
				support button
			</div>
		</div>
	</div>
);


export default HomeView;
