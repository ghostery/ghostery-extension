/**
 * Setup Choice View Container
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

import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import SetupChoiceView from '../../components/Views/SetupChoiceView';
import * as actions from '../../actions/SetupChoiceViewActions';
import * as blockingActions from '../../actions/BlockingViewActions';
import * as additionalFeaturesActions from '../../actions/AdditionalFeaturesViewActions';
import * as displayActions from '../../actions/DisplayViewActions';
import * as dataCollectionActions from '../../actions/DataCollectionViewActions';
import * as topContentActions from '../../actions/TopContentActions';
import * as navigationActions from '../../actions/NavigationActions';

/**
 * Map redux store state properties to the component's own properties.
 * @param  {Object} state    entire Redux store's state
 * @param  {Object} ownProps props passed to the connected component
 * @return {function}        this function returns plain object, which will be merged into the component's props
 * @memberof SetupContainers
 */
const mapStateToProps = (state, ownProps) => Object.assign({}, state.setupChoice, {
	dataCollection: state.dataCollection,
});

/**
 * Bind the component's action creators using Redux's bindActionCreators.
 * @param  {function} 	dispatch  redux store method which dispatches actions
 * @param  {Object} 	ownProps  the component's own props
 * @return {function}          	  to be used as an argument in redux connect call
 * @memberof SetupContainers
 */
const mapDispatchToProps = (dispatch, ownProps) => ({
	actions: bindActionCreators(Object.assign(
		actions,
		blockingActions,
		additionalFeaturesActions,
		displayActions,
		dataCollectionActions,
		topContentActions,
		navigationActions,
	), dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SetupChoiceView);
