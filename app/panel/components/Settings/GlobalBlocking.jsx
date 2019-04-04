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
		this.props.actions.toggleExpanded();
	}
	/**
	* Render full list of categories and trackers.
	* @return {ReactComponent}   ReactComponent instance
	*/
	render() {
		const { settingsData } = this.props;
		const categories = this.props.settingsData ? this.props.settingsData.categories : [];
		const filterText = this.props.settingsData ? this.props.settingsData.filterText : t('settings_filter_all_label');
		const expandAll = this.props.settingsData ? this.props.settingsData.expand_all_trackers : false;
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
					actions={this.props.actions}
					showToast={this.props.showToast}
					sitePolicy={settingsData.sitePolicy}
					paused_blocking={settingsData.paused_blocking}
					selected_app_ids={settingsData.selected_app_ids}
					globalBlocking
				/>
				<div className="blocking-trackers">
					{ categories && categories.length > 0 &&
						<Categories
							expandAll={expandAll}
							categories={categories}
							filtered={this.props.filtered}
							actions={this.props.actions}
							showToast={this.props.showToast}
							language={this.props.language}
							globalBlocking
						/>
					}
				</div>
			</div>
		);
	}
}

export default GlobalBlocking;
