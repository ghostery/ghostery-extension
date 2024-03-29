/**
 * Account Settings Import/Export Component
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
import globals from '../../../../src/classes/Globals';

class ImportExport extends React.Component {
	/**
	 * Trigger action to export settings in JSON format and save it to a file.
	 */
	clickExportSettings = () => {
		const { actions, settingsData } = this.props;
		actions.exportSettings(settingsData.pageUrl);
	};

	/**
	 * Trigger custom Import dialog or a native Open File dialog depending on browser.
	 */
	clickImportSettings = () => {
		const { actions, settingsData } = this.props;
		const browserName = globals.BROWSER_INFO.name;
		if (browserName === 'firefox') {
			// show ghostery dialog window for import
			actions.importSettingsDialog(settingsData.pageUrl);
		} else {
			// for chrome and opera, use the native File Dialog
			this.selectedFile.click();
		}
	};

	/**
	 * Parse settings file imported via native browser window. Called via input#select-file onChange.
	 */
	validateImportFile = () => {
		const { actions } = this.props;
		actions.importSettingsNative(this.selectedFile.files[0]);
	};

	/**
	* Render Account subview.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { settingsData } = this.props;
		return (
			<div>
				<p className="s-blue-header export" onClick={this.clickExportSettings}>{ t('settings_export_header') }</p>
				<p className={`s-regular ${settingsData.exportResultText ? 's-hide' : ''}`}>{ t('settings_export_text') }</p>
				<p className="s-regular export-result" style={settingsData.actionSuccess ? { color: '#2092BF' } : { color: 'red' }}>{ settingsData.exportResultText }</p>
				<div className="s-vgap-20" />
				<p className="s-blue-header import" onClick={this.clickImportSettings}>{ t('settings_import_header') }</p>
				<p className={`s-regular ${settingsData.importResultText ? 's-hide' : ''}`}>{ t('settings_import_text') }</p>
				<p className={`s-regular ${settingsData.importResultText ? 's-hide' : ''}`}>{ t('settings_import_warning') }</p>
				<p className="s-regular import-result" style={settingsData.actionSuccess ? { color: '#2092BF' } : { color: 'red' }}>{ settingsData.importResultText }</p>
				<input ref={(input) => { this.selectedFile = input; }} type="file" id="select-file" name="select-file" onChange={this.validateImportFile} />
			</div>
		);
	}
}

ImportExport.propTypes = {
	settingsData: PropTypes.shape({
		pageUrl: PropTypes.string.isRequired,
		exportResultText: PropTypes.string.isRequired,
		importResultText: PropTypes.string.isRequired,
		actionSuccess: PropTypes.bool.isRequired,
	}).isRequired,
	actions: PropTypes.shape({
		exportSettings: PropTypes.func.isRequired,
		importSettingsDialog: PropTypes.func.isRequired,
		importSettingsNative: PropTypes.func.isRequired,
	}).isRequired,
};

export default ImportExport;
