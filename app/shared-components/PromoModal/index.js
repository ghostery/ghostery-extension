/**
 * Point of entry index.js file for PromoModal
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

import { connect } from 'react-redux';
import PromoModalContainer from './PromoModalContainer';

// We may be in the Hub, where state.panel may be undefined
const mapStateToProps = state => ({ tab_id: ((state.panel && state.panel.tab_id) || null) });

export default connect(mapStateToProps, undefined)(PromoModalContainer);
