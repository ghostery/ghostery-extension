/**
 * Point of entry index.js file for Shared Components
 *
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2019 Ghostery, Inc. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 *
 * ToDo:	- Migrate other shared components into this folder.
 *
 * @namespace SharedComponents
 */

import ExitButton from './ExitButton';
import Modal from './Modal';
import PremiumPromoModalContent from './ModalContent/PremiumPromoModalContent';
import PlusPromoModalContent from './ModalContent/PlusPromoModalContent';
import InsightsPromoModalContent from './ModalContent/InsightsPromoModalContent';
import SteppedNavigation from './SteppedNavigation';
import ToastMessage from './ToastMessage';
import ToggleCheckbox from './ToggleCheckbox';
import ToggleSwitch from './ToggleSwitch';

export {
	ExitButton,
	Modal,
	PremiumPromoModalContent,
	PlusPromoModalContent,
	InsightsPromoModalContent,
	SteppedNavigation,
	ToastMessage,
	ToggleCheckbox,
	ToggleSwitch
};
