/**
 * Global Blocking Settings Component
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
import ClassNames from 'classnames';
import Categories from '../Blocking/Categories';
import BlockingHeader from '../Blocking/BlockingHeader';
/**
 * @class Implement General Settings subview which opens from the
 * left-side menu of the main Settings view.
 * @memberOf SettingsComponents
 */
class GlobalBlocking extends React.Component {
	constructor(props) {
		super(props);
		// event bindings
		this.toggleExpanded = this.toggleExpanded.bind(this);
	}

	/**
	 * Trigger action which toggles expanded state.
	 */
	toggleExpanded() {
		const { actions } = this.props;
		actions.toggleExpanded();
	}

	/**
	* Render full list of categories and trackers.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const {
			actions,
			settingsData,
			showToast,
			filtered,
			language,
			setup_complete,
		} = this.props;
		const categories = settingsData ? settingsData.categories : [];
		const filterText = settingsData ? settingsData.filterText : t('settings_filter_all_label');
		const expandAll = settingsData ? settingsData.expand_all_trackers : false;
		const condensedToggleClassNames = ClassNames('condensed-toggle', {
			condensed: settingsData.is_expanded,
		});
		return (
			<div id="settings-global-blocking" className={(settingsData.is_expanded ? 'expanded' : '')}>
				<div className={condensedToggleClassNames} onClick={this.toggleExpanded} />
				<BlockingHeader
					categories={categories}
					filterText={filterText}
					expandAll={expandAll}
					actions={actions}
					showToast={showToast}
					sitePolicy={settingsData.sitePolicy}
					paused_blocking={settingsData.paused_blocking}
					selected_app_ids={settingsData.selected_app_ids}
					globalBlocking
					setup_complete={setup_complete}
				/>
				<div className="blocking-trackers">
					{ categories && categories.length > 0 && (
						<Categories
							expandAll={expandAll}
							categories={categories}
							filtered={filtered}
							actions={actions}
							showToast={showToast}
							language={language}
							globalBlocking
							setup_complete={setup_complete}
						/>
					)}
				</div>
			</div>
		);
	}
}

export default GlobalBlocking;
