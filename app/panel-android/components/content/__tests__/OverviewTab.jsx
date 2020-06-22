/**
 * OverviewTab Test Component
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

import React from 'react';
import renderer from 'react-test-renderer';
import OverviewTab from '../OverviewTab';

describe('app/panel-android/components/content/OverviewTab.jsx', () => {
	describe('Snapshot tests with react-test-renderer', () => {
		test('OverviewTab component with SiteNotScanned', () => {
			const testElement = () => (<div>Test Element</div>);
			const component = renderer.create(
				<OverviewTab
					notScanned={testElement()}
					donutGraph={testElement()}
					pageHost={testElement()}
					trackersBlocked={testElement()}
					requestsModified={testElement()}
					ghosteryFeatures={testElement()}
					cliqzFeatures={testElement()}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});

		test('OverviewTab component with DonutGraph', () => {
			const testElement = () => (<div>Test Element</div>);
			const component = renderer.create(
				<OverviewTab
					notScanned={false}
					donutGraph={testElement()}
					pageHost={testElement()}
					trackersBlocked={testElement()}
					requestsModified={testElement()}
					ghosteryFeatures={testElement()}
					cliqzFeatures={testElement()}
				/>
			).toJSON();
			expect(component).toMatchSnapshot();
		});
	});
});
