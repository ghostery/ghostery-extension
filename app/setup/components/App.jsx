/**
 * App Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2018 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */
/**
 * @namespace SetupViews
 */
import React, { Component } from 'react';
import Header from '../containers/HeaderContainer';
import TopContent from '../containers/TopContentContainer';
import Navigation from '../containers/NavigationContainer';
import Footer from './Footer';

/**
 * @class Implements the container for the Setup flow
 * @extends Component
 * @memberof SetupViews
 */
class App extends Component {
	/**
	* Lifecycle event
	*/
	componentWillMount() {
		window.document.title = t('setup_title');
	}

	/**
	 * React's required render function. Returns JSX
	 * @return {JSX} JSX for rendering the Setup Flow App
	 */
	render() {
		const isSetup = !window.location.hash.includes('#upgrade');
		return (
			<div id="setup-page">
				<header>
					<Header />
				</header>
				<div id="content" className={!isSetup ? 'upgrade-page' : ''}>
					<div id="top-content">
						{isSetup && (
							<TopContent />
						)}
					</div>
					<div id="bottom-content">
						{this.props.children}
					</div>
				</div>
				<Navigation />
				<footer>
					<Footer />
				</footer>
			</div>
		);
	}
}

export default App;
