/**
 * Dawn Hub onboarding flow Choose Default Search View Component
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2021 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import React, { Component, Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import ClassNames from 'classnames';
import { alwaysLog } from '../../../../../src/utils/common';
import RadioButton from '../../../../shared-components/RadioButton';
import { ONBOARDING, CHOOSE_DEFAULT_SEARCH, CHOOSE_PLAN } from '../../OnboardingView/OnboardingConstants';
import {
	SEARCH_GHOSTERY,
	SEARCH_BING,
	SEARCH_YAHOO,
	SEARCH_STARTPAGE,
	SEARCH_DUCKDUCK_GO,
	SEARCH_ECOSIA,
	SEARCH_EKORU,
	SEARCH_GIBIRU,
	SEARCH_GOOGLE,
	SEARCH_ONESEARCH,
	SEARCH_PRIVADO,
	SEARCH_QWANT,
	SEARCH_ENCRYPT,
	SEARCH_TAILCAT,
	SEARCH_OTHER,
	DAWN_SETUP_NUMBER_FOR_UNLISTED_OR_RENAMED_SEARCH
} from './ChooseDefaultSearchConstants';
import { Modal } from '../../../../shared-components';

const searchSetupNumbers = [
	{ name: SEARCH_GHOSTERY, dawn_setup_number: 1 },
	{ name: SEARCH_BING, dawn_setup_number: 2 },
	{ name: SEARCH_YAHOO, dawn_setup_number: 3 },
	{ name: SEARCH_STARTPAGE, dawn_setup_number: 4 },
	{ name: SEARCH_GOOGLE, dawn_setup_number: 5 },
	{ name: SEARCH_DUCKDUCK_GO, dawn_setup_number: 6 },
	{ name: SEARCH_ECOSIA, dawn_setup_number: 7 },
	{ name: SEARCH_EKORU, dawn_setup_number: 8 },
	{ name: SEARCH_GIBIRU, dawn_setup_number: 9 },
	{ name: SEARCH_ONESEARCH, dawn_setup_number: 10 },
	{ name: SEARCH_PRIVADO, dawn_setup_number: 11 },
	{ name: SEARCH_QWANT, dawn_setup_number: 12 },
	{ name: SEARCH_ENCRYPT, dawn_setup_number: 13 },
	{ name: SEARCH_TAILCAT, dawn_setup_number: 14 },
];

const GLOW_BROWSER_SEARCH_GET_NAME = 'Ghostery Glow';
const STARTPAGE_BROWSER_SEARCH_GET_NAME = 'StartPage';

class ChooseDefaultSearchView extends Component {
	constructor(props) {
		super(props);

		this.state = {
			chosenSearch: SEARCH_GHOSTERY,
			searchBeingConsidered: null,
			otherSearchSelected: null,
			otherListOpen: false,
			modalActive: false,
			otherSearchOptionsFetched: false,
			otherSearchOptions: [],
		};

		this.fetchSearchEnginesAsync = this.fetchSearchEnginesAsync.bind(this);
	}

	componentDidMount() {
		document.addEventListener('click', this.handleClickAway);

		this.fetchSearchEnginesAsync();
	}

	componentWillUnmount() {
		document.removeEventListener('click', this.handleClickAway);
	}

	async fetchSearchEnginesAsync() {
		// eslint-disable-next-line no-undef
		if (typeof browser === 'undefined' || typeof browser.search === 'undefined') { // we are not in Dawn
			this.setState(state => ({
				...state,
				otherSearchOptionsFetched: true,
			}));
			return;
		}
		// eslint-disable-next-line no-undef
		const response = await browser.search.get(); // we are in Dawn, where this API is supported (unlike Chrome), and where the necessary search permission is added at build time (unlike non-Dawn builds of GBE)

		// a successful response is guaranteed to be an array of search engine objects
		// see https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/search/get
		const otherOptions = response
			.map(item => item.name)
			// Two versions of the Startpage identifier are included for safety as it's unclear which version is / will be used
			.filter(name => ![SEARCH_YAHOO, GLOW_BROWSER_SEARCH_GET_NAME, STARTPAGE_BROWSER_SEARCH_GET_NAME, SEARCH_STARTPAGE, SEARCH_BING].includes(name));

		this.setState(state => ({
			...state,
			otherSearchOptionsFetched: true,
			otherSearchOptions: otherOptions
		}));
	}

	updateSelection = () => this.setState(prevState => (
		{
			chosenSearch: prevState.searchBeingConsidered,
			searchBeingConsidered: null,
			modalActive: false
		}
	));

	cancelSelection = () => this.setState({ modalActive: false, searchBeingConsidered: null });

	updateOtherSearchSelection = otherSelected => this.setState({ otherSearchSelected: otherSelected });

	updateOtherListOpen = open => this.setState({ otherListOpen: open });

	triggerConfirmationModal = selection => this.setState({ modalActive: true, searchBeingConsidered: selection });

	handleClickAway = (e) => {
		const { otherListOpen } = this.state;

		const closeDropdownOnClickAway = (open, key, ref) => {
			if (open && !ref.contains(e.target)) {
				this.setState({ [`${key}`]: false });
			}
		};
		closeDropdownOnClickAway(otherListOpen, 'otherListOpen', this.otherListRef);
	}

	handleSubmit = () => {
		const { chosenSearch, otherSearchSelected } = this.state;
		const { actions, history } = this.props;
		const { setSetupStep, setDefaultSearch } = actions;

		const chosenSearchName = chosenSearch === SEARCH_OTHER
			? otherSearchSelected
			: chosenSearch;

		const payload = {
			type: 'setDefaultSearch',
			search: chosenSearchName,
			isOther: chosenSearch === SEARCH_OTHER,
		};

		// The try/catch wrapper facilitates testing in non-Dawn browsers which have no search@ghostery.com extension
		try {
			chrome.runtime.sendMessage('search@ghostery.com', payload, () => {
			});
		} catch (error) {
			alwaysLog(['Ilya: If you are seeing this error in Dawn, please report it. In other browsers, it is expected', error]);
		}

		setDefaultSearch(chosenSearchName);

		const chosenSearchNameIndex = searchSetupNumbers.findIndex(el => el.name === chosenSearchName);

		const dawn_setup_number = (chosenSearchNameIndex === -1)
			? DAWN_SETUP_NUMBER_FOR_UNLISTED_OR_RENAMED_SEARCH
			: searchSetupNumbers[chosenSearchNameIndex].dawn_setup_number;

		setSetupStep({
			setup_step: CHOOSE_DEFAULT_SEARCH,
			dawn_setup_number,
			origin: ONBOARDING
		});
		history.push(`/${ONBOARDING}/${CHOOSE_PLAN}`);
	}

	renderGhosteryOptionDescription = () => (
		<Fragment>
			<div className="ChooseSearchView__optionDescriptionTitle">{t('ghostery_dawn_onboarding_ad_free_private_search')}</div>
			<div className="ChooseSearchView__optionDescriptionSubtitle">{t('ghostery_dawn_onboarding_recommended')}</div>
		</Fragment>
	);

	renderStartpageOptionDescription = () => (
		<div className="ChooseSearchView__optionDescriptionTitle">{t('ghostery_dawn_onboarding_ad_supported_private_search')}</div>
	);

	renderOtherOptionDescription = () => {
		const { otherSearchSelected, otherListOpen } = this.state;
		const dropdownOpen = otherListOpen ? 'expanded' : '';
		return (
			<Fragment>
				<div className="ChooseSearchView__optionDescriptionHeader">
					<div className="ChooseSearchView__optionTitle">{SEARCH_OTHER}</div>
					<div className="ChooseSearchView__optionDescriptionSubtitle">{t('ghostery_dawn_onboarding_choose_alternate_search')}</div>
				</div>
				<div
					ref={(node) => { this.otherListRef = node; }}
					className={`ChooseSearchView__optionDropdownContainer ${dropdownOpen}`}
					onClick={() => this.updateOtherListOpen(!otherListOpen)}
				>
					<div className="ChooseSearchView__optionDropdown">
						<div className="ChooseSearchView__optionDropdownItem">
							{otherSearchSelected || t('ghostery_dawn_onboarding_select_option')}
							<img
								className={`ChooseSearchView__optionDropdownCaret ${dropdownOpen}`}
								src="/app/images/hub/ChooseDefaultSearchView/dropdown-caret.svg"
							/>
						</div>
						{otherListOpen && this.renderOtherOptionsList()}
					</div>
				</div>
			</Fragment>
		);
	}

	renderOtherOptionsList = () => {
		const { otherSearchOptions } = this.state;

		return (
			<Fragment>
				{otherSearchOptions.map(otherSearchOption => (
					<div
						key={`option-${otherSearchOption}`}
						className="ChooseSearchView__optionDropdownItem"
						onClick={() => {
							this.updateOtherSearchSelection(otherSearchOption);
							this.triggerConfirmationModal(SEARCH_OTHER);
						}}
					>
						{otherSearchOption}
					</div>
				))}
			</Fragment>
		);
	}

	renderOptionContainer = (chosenSearch, optionName) => {
		const selected = (chosenSearch === optionName);
		const containerClasses = ClassNames('ChooseSearchView__optionContainer', { selected });
		const logoFilename = `/app/images/hub/ChooseDefaultSearchView/search-engine-logo-${optionName.toLocaleLowerCase()}.svg`;

		return (
			<div
				onClick={() => {
					if (optionName !== SEARCH_OTHER) {
						this.triggerConfirmationModal(optionName);
					}
				}}
				className={containerClasses}
			>
				<div className="ChooseSearchView__optionRadioButtonContainer">
					{(optionName !== SEARCH_OTHER || (optionName === SEARCH_OTHER && selected)) && (
						<RadioButton
							checked={selected}
							handleClick={() => {}}
							altDesign
						/>
					)
					}
				</div>
				<div className="ChooseSearchView__optionDescriptionContainer">
					{(optionName !== SEARCH_OTHER) && (
						<img src={logoFilename} />
					)}
					{(optionName === SEARCH_GHOSTERY) && this.renderGhosteryOptionDescription()}
					{(optionName === SEARCH_STARTPAGE) && this.renderStartpageOptionDescription()}
					{(optionName === SEARCH_OTHER) && this.renderOtherOptionDescription()}
				</div>
			</div>
		);
	}

	renderConfirmationModal = () => {
		const { searchBeingConsidered, otherSearchSelected } = this.state;
		const logoFilename = `/app/images/hub/ChooseDefaultSearchView/search-engine-logo-${searchBeingConsidered.toLocaleLowerCase()}.svg`;

		return (
			<Modal show>
				<div className="ChooseSearchView__modalContent">
					<img src="/app/images/hub/ChooseDefaultSearchView/ghostery-browser-logo.svg" />
					<div className="ChooseSearchView__modalMain">
						{searchBeingConsidered === SEARCH_OTHER ? (
							<div className="ChooseSearchView__modalHeader">
								{SEARCH_OTHER}
							</div>
						) :
							<img className="ChooseSearchView__modalOptionLogo" src={logoFilename} />
						}
						<div className="ChooseSearchView__modalDescription">
							{searchBeingConsidered === SEARCH_STARTPAGE && t('ghostery_dawn_onboarding_startpage_warning')}
							{searchBeingConsidered === SEARCH_BING && t('ghostery_dawn_onboarding_bing_warning')}
							{searchBeingConsidered === SEARCH_YAHOO && t('ghostery_dawn_onboarding_yahoo_warning')}
							{searchBeingConsidered === SEARCH_GHOSTERY && t('ghostery_dawn_onboarding_glow_benefit')}
							{(searchBeingConsidered === SEARCH_OTHER) && (
								<Fragment>
									{
										`${t('ghostery_dawn_onboarding_you_have_selected_an_alternate_search_engine')} \n
										${otherSearchSelected}`
									}
								</Fragment>
							)}
						</div>
						<div className="ChooseSearchView__modalButtonsContainer">
							<button
								className="ChooseSearchView__modalCancelButton"
								type="button"
								onClick={this.cancelSelection}
							>
								{t('ghostery_dawn_onboarding_go_back')}
							</button>
							<div className="ChooseSearchView__modalButtonDivider" />
							<button
								className="ChooseSearchView__modalConfirmButton"
								type="button"
								onClick={this.updateSelection}
							>
								{t('ghostery_dawn_onboarding_confirm')}
							</button>
						</div>
					</div>

				</div>
			</Modal>
		);
	}

	renderSearchOptions = () => {
		const { chosenSearch, otherSearchOptions } = this.state;

		// No sense showing dropdown if there are no other options
		const showOtherOptionsDropdown = otherSearchOptions.length > 0;

		return (
			<Fragment>
				<div className="ChooseSearchView__relativeContainer">
					<div className="ChooseSearchView__backContainer">
						<span className="ChooseSearchView__caret left" />
						<NavLink to="/onboarding/2">
							<span className="ChooseSearchView__back">{t('ghostery_dawn_onboarding_back')}</span>
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
						{showOtherOptionsDropdown && this.renderOptionContainer(chosenSearch, SEARCH_OTHER)}
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
		const { modalActive, otherSearchOptionsFetched } = this.state;

		if (!otherSearchOptionsFetched) return null;

		return (
			<div className="full-height">
				{modalActive && this.renderConfirmationModal()}
				{!modalActive && this.renderSearchOptions()}
			</div>
		);
	}
}

export default ChooseDefaultSearchView;
