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

import { store } from 'hybrids';
import { session } from '../utils/api.js';

export const UPDATE_SESSION_ACTION_NAME = 'updateSession';

const Session = {
  user: '',
  firstName: '',
  lastName: '',
  email: '',
  scopes: [String],
  contributor: ({ scopes }) => !!scopes.length,
  name: ({ firstName, lastName }) =>
    [firstName, lastName].filter((s) => s).join(' '),
  [store.connect]: {
    cache: false,
    async get() {
      try {
        const data = await session();

        return data
          ? {
              user: data.sub,
              firstName: data.first_name,
              lastName: data.last_name,
              email: data.email,
              scopes: data.scopes || [],
            }
          : {};
      } catch (e) {
        console.error("[store|session] Failed to fetch user's session", e);
        return {};
      }
    },
  },
};

export default Session;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === UPDATE_SESSION_ACTION_NAME) {
    store.clear(Session, false);
  }
});
