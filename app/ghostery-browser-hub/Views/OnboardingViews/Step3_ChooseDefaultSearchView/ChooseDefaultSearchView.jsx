/**
 * Ghostery Browser Hub Choose Default Search View Component
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

import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import ClassNames from 'classnames';
import RadioButton from '../../../../shared-components/RadioButton';
import { ONBOARDING, CHOOSE_PLAN, CHOOSE_DEFAULT_SEARCH } from '../../OnboardingView/OnboardingConstants';
import { Modal } from '../../../../shared-components';

const SEARCH_GHOSTERY = 'Ghostery';
const SEARCH_BING = 'Bing';
const SEARCH_YAHOO = 'Yahoo';
const SEARCH_STARTPAGE = 'StartPage';
const SEARCH_CUSTOM = 'Custom';

class ChooseDefaultSearchView extends Component {
	constructor(props) {
		super(props);

		this.customURLInputRef = React.createRef();

		this.state = {
			chosenSearch: SEARCH_GHOSTERY,
			searchBeingConsidered: null,
			modalActive: false,
		};
	}

	updateSelection = () => this.setState(prevState => (
		{
			chosenSearch: prevState.searchBeingConsidered,
			searchBeingConsidered: null,
			modalActive: false
		}
	));

	cancelSelection = () => this.setState({ modalActive: false, searchBeingConsidered: null });

	triggerConfirmationModal = selection => this.setState({ modalActive: true, searchBeingConsidered: selection });

	handleSubmit = () => {
		const { chosenSearch } = this.state;
		const { actions, history } = this.props;
		const { setSetupStep } = actions;

		const payload = {
			type: 'setDefaultSearch',
			search: chosenSearch,
		};

		// chrome.runtime.sendMessage('search@ghostery.com', payload, () => {
		// 	// TODO handle errors if needed
		// 	// TODO save user's search setting to redux / background if needed
		// 	setSetupStep({ setup_step: CHOOSE_PLAN, origin: ONBOARDING });
		// 	history.push(`/${ONBOARDING}/${CHOOSE_PLAN}`);
		// });

		setSetupStep({ setup_step: CHOOSE_PLAN, origin: ONBOARDING });
		history.push(`/${ONBOARDING}/${CHOOSE_PLAN}`);
	}

	renderGhosteryOptionDescription = () => (
		<Fragment>
			<div className="ChooseSearchView__optionDescriptionTitle">Ad-free private search</div>
			<div className="ChooseSearchView__optionDescriptionSubtitle">(Recommended)</div>
		</Fragment>
	);

	renderStartpageOptionDescription = () => (
		<div className="ChooseSearchView__optionDescriptionTitle">Ad-supported private search</div>
	)

	renderOptionContainer = (chosenSearch, optionName) => {
		const selected = (chosenSearch === optionName);
		const containerClasses = ClassNames('ChooseSearchView__optionContainer', { selected });
		const logoFilename = `/app/images/hub/ChooseDefaultSearchView/search-engine-logo-${optionName.toLocaleLowerCase()}.svg`;

		return (
			<div onClick={() => this.triggerConfirmationModal(optionName)} className={containerClasses}>
				<div className="ChooseSearchView__optionRadioButtonContainer">
					<RadioButton
						checked={selected}
						handleClick={() => {}}
						altDesign
					/>
				</div>
				<div className="ChooseSearchView__optionDescriptionContainer">
					<img src={logoFilename} />
					{(optionName === SEARCH_GHOSTERY) && this.renderGhosteryOptionDescription()}
					{(optionName === SEARCH_STARTPAGE) && this.renderStartpageOptionDescription()}
				</div>
			</div>
		);
	}

	renderConfirmationModal = () => {
		const { searchBeingConsidered } = this.state;
		const logoFilename = `/app/images/hub/ChooseDefaultSearchView/search-engine-logo-${searchBeingConsidered.toLocaleLowerCase()}.svg`;

		return (
			<Modal show>
				<div className="ChooseSearchView__modalContent">
					<img src="/app/images/hub/ChooseDefaultSearchView/ghostery-browser-logo.svg" />
					<div className="ChooseSearchView__modalMain">
						<img className="ChooseSearchView__modalOptionLogo" src={logoFilename} />
						<div className="ChooseSearchView__modalDescription">
							{`Just so you know: ${searchBeingConsidered}'s search engine will log your data and use it to serve you targeted ads.`}
						</div>
						<div className="ChooseSearchView__modalButtonsContainer">
							<button
								className="ChooseSearchView__modalCancelButton"
								type="button"
								onClick={this.cancelSelection}
							>
								Go Back
							</button>
							<div className="ChooseSearchView__modalButtonDivider" />
							<button
								className="ChooseSearchView__modalConfirmButton"
								type="button"
								onClick={this.updateSelection}
							>
								Confirm
							</button>
						</div>
					</div>

				</div>
			</Modal>
		);
	}

	renderSearchOptions = () => {
		const { chosenSearch } = this.state;

		return (
			<Fragment>
				<div className="ChooseSearchView__relativeContainer">
					<div className="ChooseSearchView__backContainer">
						<span className="ChooseSearchView__caret left" />
						<NavLink to="/onboarding/2">
							<span className="ChooseSearchView__back">{t('ghostery_browser_hub_onboarding_back')}</span>
						</NavLink>
					</div>
				</div>
				<div className="ChooseSearchView__container">
					<div className="ChooseSearchView__title">{t('choose_your_default_search')}</div>
					<div className="ChooseSearchView__subtitle">{t('pick_a_default_search_engine')}</div>
					<div className="ChooseSearchView__optionsContainer">
						{this.renderOptionContainer(chosenSearch, SEARCH_GHOSTERY)}
						{this.renderOptionContainer(chosenSearch, SEARCH_STARTPAGE)}
						{this.renderOptionContainer(chosenSearch, SEARCH_BING)}
						{this.renderOptionContainer(chosenSearch, SEARCH_YAHOO)}
					</div>
					<button
						className="ChooseSearchView__nextButton"
						type="button"
						onClick={() => this.handleSubmit()}
					>
						{t('next')}
					</button>
				</div>
			</Fragment>
		);
	}

	render() {
		const { modalActive } = this.state;

		return (
			<div className="full-height">
				{modalActive && this.renderConfirmationModal()}
				{!modalActive && this.renderSearchOptions()}
			</div>
		);
	}
}

export default ChooseDefaultSearchView;
