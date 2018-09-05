/**
 * About Component
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
import React from 'react';
import { openSupporterPage } from '../utils/msg';
/**
 * Render Subscribe panel.
 * @return {ReactComponent}   ReactComponent instance
 */
function Subscribe() {
	return (
		<div className="content-subscription">
			<div className="badge" />
			<div className="pitch-container">
				<span className="pitch-text">{t('subscribe_pitch')}</span>
				<a href="https://www.ghostery.com/supporter/" target="_blank" rel="noopener noreferrer">
					<span className="pitch-learn-more">{t('subscribe_pitch_learn_more')}</span>
				</a>
				<span className="pitch-become-subscriber" onClick={openSupporterPage}>{t('subscribe_pitch_button_label')}</span>
				{/*
				<NavLink to="/login">
					<span className="pitch-already-subscriber">{t('subscribe_pitch_sign_here')}</span>
				</NavLink>
			*/}
			</div>
		</div>
	);
}

export default Subscribe;
