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

import { html, define, store } from 'hybrids';

import Options from '/store/options.js';

function toggleNeverConsent(host, event) {
  const { checked } = event.target;

  store.set(host.options, {
    dnrRules: {
      annoyances: checked,
    },
    autoconsent: null,
  });
}

export default define({
  tag: 'gh-options',
  options: store(Options),
  devtools: true,
  content: ({ options }) => html`
    <template layout="grid height::100%">
      <ui-page-layout>
        <ui-card>
          ${store.ready(options) &&
          html`
            <div layout="column gap:4">
              <ui-text type="headline-s">Privacy Protection</ui-text>
              <section layout="column gap:4">
                <section layout="column gap:2">
                  <div layout="column">
                    <ui-text type="headline-xs">Setup protection level</ui-text>
                    <ui-text type="body-s" color="gray-500">
                      Get extra protection and automated control with our
                      enhanced privacy features.
                    </ui-text>
                  </div>
                  <label layout="row items:center">
                    <div layout="column grow">
                      <ui-text>Ad-Blocking</ui-text>
                      <ui-text type="body-s" color="gray-500">
                        Praesent egestas tristique nibh. Cras ultricies mi eu
                        turpis hendrerit fringilla.
                      </ui-text>
                    </div>
                    <input
                      type="checkbox"
                      checked="${options.dnrRules.ads}"
                      onchange="${html.set(options, 'dnrRules.ads')}"
                      layout="shrink:0 size:2"
                    />
                  </label>
                  <label layout="row items:center">
                    <div layout="column grow">
                      <ui-text>Anti-Tracking</ui-text>
                      <ui-text type="body-s" color="gray-500">
                        Praesent egestas tristique nibh. Cras ultricies mi eu
                        turpis hendrerit fringilla.
                      </ui-text>
                    </div>
                    <input
                      type="checkbox"
                      checked="${options.dnrRules.tracking}"
                      onchange="${html.set(options, 'dnrRules.tracking')}"
                      layout="shrink:0 size:2"
                    />
                  </label>
                  <label layout="row items:center">
                    <div layout="column grow">
                      <ui-text>Never-Consent</ui-text>
                      <ui-text type="body-s" color="gray-500">
                        Praesent egestas tristique nibh. Cras ultricies mi eu
                        turpis hendrerit fringilla.
                      </ui-text>
                    </div>
                    <input
                      type="checkbox"
                      checked="${options.dnrRules.annoyances}"
                      onchange="${toggleNeverConsent}"
                      layout="shrink:0 size:2"
                    />
                  </label>
                </section>
              </section>
              <ui-text type="headline-s">WhoTracks.me</ui-text>
              <section layout="column gap:4">
                <section layout="column gap:2">
                  <div layout="column">
                    <ui-text type="headline-xs">Browser Settings</ui-text>
                    <ui-text type="body-s" color="gray-500">
                      Suspendisse feugiat. Nunc nulla. Vivamus consectetuer
                      hendrerit lacus. In ut quam vitae odio lacinia tincidunt.
                      Sed cursus turpis vitae tortor.
                    </ui-text>
                  </div>
                  <label layout="row items:center">
                    <div layout="column grow">
                      <ui-text>Trackers Wheel</ui-text>
                      <ui-text type="body-s" color="gray-500">
                        Praesent egestas tristique nibh. Cras ultricies mi eu
                        turpis hendrerit fringilla.
                      </ui-text>
                    </div>
                    <input
                      type="checkbox"
                      checked="${options.trackerWheel}"
                      onchange="${html.set(options, 'trackerWheel')}"
                      layout="shrink:0 size:2"
                    />
                  </label>
                </section>

                <section layout="column gap:2">
                  <div layout="column">
                    <ui-text type="headline-xs">Tracker Settings</ui-text>
                    <ui-text type="body-s" color="gray-500">
                      Vivamus quis mi. Vestibulum ante ipsum primis in faucibus
                      orci luctus et ultrices posuere cubilia Curae; Fusce id
                      purus.
                    </ui-text>
                  </div>
                  <label layout="row items:center">
                    <div layout="column grow">
                      <ui-text>Trackers Preview on SERP</ui-text>
                      <ui-text type="body-s" color="gray-500">
                        Praesent egestas tristique nibh. Cras ultricies mi eu
                        turpis hendrerit fringilla.
                      </ui-text>
                    </div>
                    <input
                      type="checkbox"
                      checked="${options.wtmSerpReport}"
                      onchange="${html.set(options, 'wtmSerpReport')}"
                      layout="shrink:0 size:2"
                    />
                  </label>
                </section>

                <gh-options-devtools></gh-options-devtools>
              </section>
            </div>
          `}
        </ui-card>
      </ui-page-layout>
    </template>
  `.css`
    html, body { height: 100%; }
  `,
});
