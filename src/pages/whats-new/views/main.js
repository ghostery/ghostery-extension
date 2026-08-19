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

import { html, msg, store } from 'hybrids';

import { numberFormatter } from '/ui/labels.js';
import { WTM_PAGE_URL, DISTRACTIONS_LEARN_MORE_URL } from '/utils/urls.js';
import { getPeriod } from '/utils/whats-new.js';

import { MergedStats } from '/store/daily-stats.js';
import Resources from '/store/resources.js';

import assets from '../assets/index.js';

const { dateFrom, dateTo } = getPeriod();

export default {
  mergedStats: store(MergedStats, { id: () => ({ dateFrom, dateTo }) }),
  resources: store(Resources),
  consentsHandled: ({ resources }) => {
    if (!store.ready(resources)) return 0;

    const fromTimestamp = new Date(dateFrom).getTime();
    return Object.values(resources.autoconsent).filter((timestamp) => timestamp >= fromTimestamp)
      .length;
  },
  stats: ({ mergedStats, consentsHandled }) => {
    if (!store.ready(mergedStats)) return [];

    const all = [
      {
        type: 'activities',
        value: mergedStats.trackers.length,
        label: msg`Activities observed`,
        description: msg`You saw what was really happening under every page you opened.`,
      },
      {
        type: 'blocked',
        value: mergedStats.trackersBlocked,
        label: msg`Trackers blocked`,
        description: msg`You browsed — Ghostery kept these from reaching you.`,
      },
      {
        type: 'pages',
        value: mergedStats.pages,
        label: msg`Pages visited`,
        description: msg`Ghostery stayed with you the whole way.`,
      },
      {
        type: 'cookies',
        value: mergedStats.cookiesRemoved,
        label: msg`Cookies removed`,
        description: msg`Cleared quietly, so your web stayed yours.`,
      },
      {
        type: 'consents',
        value: consentsHandled,
        label: msg`Consent requests handled`,
        description: msg`Pop-ups you never had to see`,
      },
      {
        type: 'modified',
        value: mergedStats.trackersModified,
        label: msg`Trackers modified`,
        description: msg`Pages still work – but trackers learn nothing about you`,
      },
    ];

    const visible = all.filter(({ value }) => value > 0);
    const highest = visible.reduce((a, b) => (b.value > a.value ? b : a), visible[0]);

    return highest ? [highest, ...visible.filter((stat) => stat !== highest)] : [];
  },
  render: ({ mergedStats, resources, stats }) => html`
    <template layout="column">
      <whats-new-hero>
        <div layout="column gap:5 padding:2:2:0" layout@992px="padding:2.5:2.5:0">
          <div layout="row items:center content:space-between gap:2">
            <img src="${assets.logo}" alt="Ghostery" layout="size:108px:4 shrink:0" />
            <ui-icon name="whats-new-badge" layout="size:8 shrink:0"></ui-icon>
          </div>
          <div layout="column center gap padding:0:0:8">
            <ui-text mobile-type="display-s" type="headline-l" uppercase layout="block:center">
              Your web, lately
            </ui-text>
            <ui-text type="body-l" balance layout="block:center width:::640px">
              The cleaner, calmer web you’ve been building – with Ghostery quietly handling the
              rest.
            </ui-text>
          </div>
        </div>
        <whats-new-wave></whats-new-wave>
      </whats-new-hero>
      ${
        store.ready(mergedStats, resources) &&
        html`
          <whats-new-facts layout="width:full::1200px self:center margin:bottom:5">
            <whats-new-fact>
              <ui-icon name="shield" color="brand-primary" layout="size:4 shrink:0"></ui-icon>
              <ui-text type="body-m">
                ${msg.html`
                  <strong>${numberFormatter.format(mergedStats.trackersBlocked)} trackers</strong>
                  stopped before they reached you – and that’s not even the biggest number below
                `}
              </ui-text>
            </whats-new-fact>
            <whats-new-fact>
              <ui-icon
                name="category-organization"
                color="brand-primary"
                layout="size:4 shrink:0"
              ></ui-icon>
              <ui-text type="body-m">
                ${msg.html`
                  The companies that <strong>wanted your data</strong>, named (you’ll
                  recognize a few)
                `}
              </ui-text>
            </whats-new-fact>
            <whats-new-fact>
              <ui-icon name="logo-zap" layout="size:7:4 shrink:0"></ui-icon>
              <ui-text type="body-m">
                ${msg.html`
                  The <strong>one-click way</strong> to give someone the same
                  <strong>quiet web</strong>, with Ghostery Zap
                `}
              </ui-text>
            </whats-new-fact>
            <whats-new-fact>
              <ui-icon name="block-ads" color="brand-primary" layout="size:4 shrink:0"></ui-icon>
              <ui-text type="body-m">
                ${msg.html`
                  A new way to <strong>make pages calmer</strong> that isn’t about
                  ads
                `}
              </ui-text>
            </whats-new-fact>
          </whats-new-facts>

          ${
            !!stats.length &&
            html`
              <section layout="column gap:3 margin:bottom:8">
                <div layout="column center gap padding:0:2 width:full::1200px self:center">
                  <ui-text mobile-type="display-s" type="display-m" layout="block:center">
                    Your impact
                  </ui-text>
                  <ui-text type="desc-m" layout="block:center">
                    The web you built – by the numbers (Last 3 months)
                  </ui-text>
                </div>
                <whats-new-stats>
                  ${stats.map(
                    ({ type, value, label, description }, index) => html`
                      <whats-new-stat
                        type="${type}"
                        value="${numberFormatter.format(value)}"
                        label="${label}"
                        description="${description}"
                        featured="${index === 0}"
                      ></whats-new-stat>
                    `,
                  )}
                </whats-new-stats>
              </section>
            `
          }
          ${
            !!mergedStats.groupedTrackers.length &&
            html`
              <section
                layout="column gap:3 padding:0:2 margin:bottom:8 width:full::1200px self:center"
              >
                <div layout="column center gap">
                  <ui-text mobile-type="display-s" type="display-m" layout="block:center">
                    Who wanted your data?
                  </ui-text>
                  <ui-text type="desc-m" layout="block:center">
                    While you browsed, Ghostery kept watch on these – and shut them out.
                  </ui-text>
                </div>
                <div layout="column gap" layout@768px="grid:3">
                  ${mergedStats.groupedTrackers
                    .slice(0, 3)
                    .map(
                      ({ id, name, category }) => html`
                        <whats-new-entity
                          name="${name}"
                          category="${category}"
                          href="${WTM_PAGE_URL}/trackers/${id}?utm_source=gbe&utm_campaign=yourweb"
                        ></whats-new-entity>
                      `,
                    )}
                </div>
              </section>
            `
          }

          <section layout="column padding:0:2 margin:bottom:8 width:full::880px self:center">
            <whats-new-panel
              layout="column center gap:5 padding:4:3"
              layout@768px="row gap:5 padding:4:6"
            >
              <img src="${assets['browse']}" alt="" layout="size:20 shrink:0" />
              <div layout="column gap">
                <ui-text mobile-type="display-s" type="headline-m"
                  >You browse with intention</ui-text
                >
                <ui-text type="desc-m">
                  This didn’t happen by accident. Every day you chose a calmer, more private web –
                  and Ghostery made those choices easy to keep.
                </ui-text>
                <ui-text type="desc-m">Better habits make a better web.</ui-text>
              </div>
            </whats-new-panel>
          </section>

          <whats-new-hero>
            <whats-new-wave flip></whats-new-wave>
            <div layout="column center gap padding:5:2" layout@992px="padding:8:15">
              <ui-text mobile-type="display-s" type="display-m" layout="block:center">
                Share a calmer web
              </ui-text>
              <ui-text type="desc-m" layout="block:center width:::640px">
                Someone in your life still puts up with ads, tracking and clutter. You can hand them
                the same quiet web you built – Ghostery makes the setup one tap.
              </ui-text>
            </div>
            <whats-new-wave></whats-new-wave>
          </whats-new-hero>

          <section layout="column gap:3 padding:0:2 margin:5:0:8 width:full::1200px self:center">
            <ui-text type="display-s" layout="block:center">
              Teach them these 3 steps to block ads with Ghostery Zap
            </ui-text>
            <whats-new-flow
              layout="column gap:2 padding:1.5"
              layout@992px="row items:stretch padding:1.5 margin:right:11"
            >
              <div layout="column gap:0.5 grow" layout@768px="grid:3">
                <whats-new-step
                  image="${assets['zap-flow-1']}"
                  step="${msg`Step 1`}"
                  name="${msg`Visit a site`}"
                  description="${msg`Open any website where ads get in the way`}"
                ></whats-new-step>
                <whats-new-step
                  image="${assets['zap-flow-2']}"
                  step="${msg`Step 2`}"
                  name="${msg`Click “Zap Ads!”`}"
                  description="${msg`One click instantly blocks ads across the entire site, not just this page`}"
                ></whats-new-step>
                <whats-new-step
                  image="${assets['zap-flow-3']}"
                  step="${msg`Step 3`}"
                  name="${msg`Stay ad-free`}"
                  description="${msg`The choice is saved, so it stays clean every visit`}"
                ></whats-new-step>
              </div>
              <whats-new-step
                compact
                image="${assets['zap-flow-4']}"
                name="${msg`Repeat for most visited websites`}"
                layout="shrink:0"
                layout@768px="shrink:0 self:center width:::22 margin:right:-13"
              ></whats-new-step>
            </whats-new-flow>
            <whats-new-panel
              type="secondary"
              layout="column center gap:2 padding:3 self:center"
              layout@768px="width:538px"
            >
              <div layout="column center gap:0.5">
                <ui-text mobile-type="headline-s" type="headline-m" layout="block:center">
                  Help them install Ghostery
                </ui-text>
                <ui-text type="body-m" color="secondary" layout="block:center">
                  Whatever browser they use, Ghostery’s got it
                </ui-text>
              </div>
              <div layout="row:wrap center gap:0.5">
                <whats-new-browser-link
                  name="Chrome"
                  icon="${assets['browser-chrome']}"
                  href="https://chrome.google.com/webstore/detail/mlomiejdfkolichcflejclcbmpeaniij"
                ></whats-new-browser-link>
                <whats-new-browser-link
                  name="Firefox"
                  icon="${assets['browser-firefox']}"
                  href="https://addons.mozilla.org/firefox/addon/ghostery/"
                ></whats-new-browser-link>
                <whats-new-browser-link
                  name="Safari"
                  icon="${assets['browser-safari']}"
                  href="https://apps.apple.com/app/apple-store/id6504861501"
                ></whats-new-browser-link>
                <whats-new-browser-link
                  name="Brave"
                  icon="${assets['browser-brave']}"
                  href="https://chrome.google.com/webstore/detail/mlomiejdfkolichcflejclcbmpeaniij"
                ></whats-new-browser-link>
                <whats-new-browser-link
                  name="Edge"
                  icon="${assets['browser-edge']}"
                  href="https://microsoftedge.microsoft.com/addons/detail/fclbdkbhjlgkbpfldjodgjncejkkjcme"
                ></whats-new-browser-link>
                <whats-new-browser-link
                  name="Opera"
                  icon="${assets['browser-opera']}"
                  href="https://addons.opera.com/extensions/details/ghostery/"
                ></whats-new-browser-link>
              </div>
            </whats-new-panel>
          </section>

          <whats-new-outro layout="column gap:3 margin:bottom:8">
            <whats-new-wave flip></whats-new-wave>
            <img src="${assets['distractions']}" alt="" />
            <div layout="column center gap:3 padding:0:2 width:full::1200px self:center">
              <div layout="column center gap:2">
                <ui-text mobile-type="display-s" type="display-m" layout="block:center">
                  Remove distractions
                </ui-text>
                <ui-text type="desc-m" layout="block:center width:::720px">
                  Ads aren’t the only thing competing for your attention.
                </ui-text>
                <ui-text type="desc-m" layout="block:center width:::720px">
                  Now you can hide sign-in prompts, short-video feeds, social widgets and the rest
                  of the noise – Ghostery clears them so your pages stay focused on what you came
                  for.
                </ui-text>
                <ui-text type="desc-m" layout="block:center width:::720px">
                  A calmer web isn’t only about privacy. It’s about attention too.
                </ui-text>
              </div>
              <ui-button type="primary" layout="height:6">
                <a
                  href="${DISTRACTIONS_LEARN_MORE_URL}?utm_source=gbe&utm_campaign=yourweb"
                  target="_blank"
                >
                  Learn to Remove Distractions
                </a>
              </ui-button>
            </div>
          </whats-new-outro>

          <whats-new-hero>
            <whats-new-wave flip></whats-new-wave>
            <div
              layout="column center gap:3 padding:0:2 margin:5:0:10"
              layout@992px="padding:0:15 margin:8:0:10"
            >
              <img src="${assets['footer-badge']}" alt="" layout="size:10" />
              <div layout="column center gap">
                <ui-text mobile-type="headline-m" type="headline-l" layout="block:center">
                  Thanks for being part of Ghostery
                </ui-text>
                <ui-text type="desc-m" layout="block:center width:::640px">
                  Every cleaner, calmer page is one you chose – and Ghostery is glad to be along for
                  it. Thanks for making the web a little better.
                </ui-text>
              </div>
            </div>
          </whats-new-hero>
        `
      }
    </template>
  `,
};
