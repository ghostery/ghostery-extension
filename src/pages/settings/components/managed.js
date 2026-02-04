/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

import { html } from 'hybrids';

export default {
  value: false,
  render: ({ value }) =>
    value
      ? html`
          <template layout="block">
            <ui-tooltip position="bottom" autohide="5" delay="0">
              <div slot="content">
                <ui-text type="body-s" color="secondary" slot="content">
                  The feature is managed by your organization
                </ui-text>
              </div>
              <div inert><slot></slot></div>
            </ui-tooltip>
          </template>
        `.css`
          :host { cursor: not-allowed; }
          div[inert] { opacity: 0.5; }
        `
      : html`<template layout="contents"><slot></slot></template>`,
};
