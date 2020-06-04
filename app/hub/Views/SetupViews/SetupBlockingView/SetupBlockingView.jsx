/**
 * Setup Blocking View Component
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
import PropTypes from 'prop-types';
import ClassNames from 'classnames';

/**
 * A Functional React component for rendering the Setup Blocking View
 * @return {JSX} JSX for rendering the Setup Blocking View of the Hub app
 * @memberof HubComponents
 */
const SetupBlockingView = ({
	blockingPolicy,
	handleSelection,
	handleCustomClick,
	choices
}) => (
	<div className="row align-center">
		<div className="columns small-12 large-10">
			<div className="SetupBlocking">
				<div className="row small-up-1 medium-up-2 large-up-4 align-center">
					{choices.map((choice) => {
						const choiceSelected = choice.name === blockingPolicy;
						const bigCheckSrc = '/app/images/hub/setup/block-selected.svg';
						const choiceBoxClassNames = ClassNames('clickable', 'flex-container', 'flex-dir-column', {
							SetupBlocking__choiceBox: true,
							'SetupBlocking--selected': choiceSelected,
						});

						return (
							<div key={`block-value-${choice.name}`} className="columns">
								<div>
									<label
										htmlFor={`input-block-${choice.name}`}
										className={choiceBoxClassNames}
										onClick={() => {
											if (choice.name === 'BLOCKING_POLICY_CUSTOM') {
												handleCustomClick();
											}
										}}
									>
										<div className="SetupBlocking__imageContainer flex-container align-center-middle">
											<img src={choiceSelected ? bigCheckSrc : choice.image} />
										</div>
										<div className="SetupBlocking__textContainer flex-child-grow flex-container align-center-middle">
											{choice.text}
										</div>
									</label>
									<div className="SetupBlocking__description show-for-large">{choice.description}</div>
								</div>

								<input
									type="radio"
									name={choice.name}
									value={choice.name}
									id={`input-block-${choice.name}`}
									checked={blockingPolicy === choice.name}
									onChange={handleSelection}
								/>
							</div>
						);
					})}
				</div>
			</div>
		</div>
	</div>
);

// PropTypes ensure we pass required props of the correct type
SetupBlockingView.propTypes = {
	blockingPolicy: PropTypes.string.isRequired,
	handleSelection: PropTypes.func.isRequired,
	handleCustomClick: PropTypes.func.isRequired,
	choices: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string.isRequired,
		image: PropTypes.string.isRequired,
		text: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
	})).isRequired,
};

export default SetupBlockingView;
