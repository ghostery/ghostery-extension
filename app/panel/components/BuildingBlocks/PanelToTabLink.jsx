/**
 * PanelToTabLink Component
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
import { handleClickOnNewTabLink } from '../../utils/msg';

/**
 * Implement panel -> new tab links. Used in Help, About, and other panel views
 * @memberof PanelBuildingBlocks
 */
const PanelToTabLink = (props) => {
	const { href, children } = props;

	return (
		<a href={href} onClick={handleClickOnNewTabLink}>{children}</a>
	);
};

export default PanelToTabLink;
