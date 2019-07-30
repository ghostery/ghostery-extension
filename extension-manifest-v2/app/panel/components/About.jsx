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
						<PanelToTabLink href="https://github.com/ghostery/ghostery-extension/releases">{t('panel_about_release_notes')}</PanelToTabLink>
						<PanelToTabLink href="https://www.mozilla.org/en-US/MPL/2.0/">{t('panel_about_license')}</PanelToTabLink>
						<PanelToTabLink href="https://www.ghostery.com/about-ghostery/browser-extension-privacy-policy/">{t('panel_about_privacy_statement')}</PanelToTabLink>
						<PanelToTabLink href="https://www.ghostery.com/about-ghostery/ghostery-terms-and-conditions/">{t('panel_about_terms_and_conditions')}</PanelToTabLink>
						<PanelToTabLink href="https://www.ghostery.com/about-ghostery/imprint/">{t('panel_about_imprint')}</PanelToTabLink>
						<PanelToTabLink href={licensesUrl}>{t('panel_about_licenses')}</PanelToTabLink>
						<PanelToTabLink href="https://www.ghostery.com/">Ghostery.com</PanelToTabLink>
					</div>
				</div>
			</div>
		</div>
	);
};

export default About;
