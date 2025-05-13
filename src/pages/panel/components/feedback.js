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
  render: () => html`<template layout="row padding:0.5 margin:1.5:0">
    <slot></slot>
  </template>`.css`
    :host {
      background: var(--background-secondary);
    }

    ::slotted(*:not(:last-child)) {
      border-right: 1px solid var(--border-primary);
    }
  `,
};
