/**
 * About Component
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
import globals from '../../../src/classes/Globals';
import PanelToTabLink from './BuildingBlocks/PanelToTabLink';

const { BROWSER_INFO, EXTENSION_VERSION } = globals;
/**
 * Render About view which opens from the main drop-down menu.
 */
const About = () => {
	const licensesUrl = chrome.runtime.getURL('./app/templates/licenses.html');

	return (
		<div id="content-about">
			<div className="row">
				<div className="small-12 columns">
					<h1>{ t('panel_about_panel_header') }</h1>
					<div className="support-section">
						<h3>{ t('panel_about_version_header', [BROWSER_INFO.displayName, EXTENSION_VERSION]) }</h3>
						<PanelToTabLink href="https://github.com/ghostery/ghostery-extension/releases" label={t('panel_about_release_notes')} />
						<PanelToTabLink href="https://www.mozilla.org/en-US/MPL/2.0/" label={t('panel_about_license')} />
						<PanelToTabLink href="https://www.ghostery.com/about-ghostery/browser-extension-privacy-policy/" label={t('panel_about_privacy_statement')} />
						<PanelToTabLink href="https://www.ghostery.com/about-ghostery/ghostery-terms-and-conditions/" label={t('panel_about_terms_and_conditions')} />
						<PanelToTabLink href="https://www.ghostery.com/about-ghostery/imprint/" label={t('panel_about_imprint')} />
						<PanelToTabLink href={licensesUrl} label={t('panel_about_licenses')} />
						<PanelToTabLink href="https://www.ghostery.com/" label="Ghostery.com" />
					</div>
				</div>
			</div>
		</div>
	);
};

export default About;
