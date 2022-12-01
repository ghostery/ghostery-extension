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

import { define, html, router } from 'hybrids';
import { getCategoryColor } from '../utils/categories.js';
import * as labels from '../utils/labels.js';

export default define({
  tag: 'ui-stats',
  categories: undefined,
  categoryList: ({ categories = [] }) =>
    Object.entries(
      categories.reduce(
        (all, current) => ({
          ...all,
          [current]: (all[current] || 0) + 1,
        }),
        {},
      ),
    ),
  trackers: undefined,
  domain: '',
  type: 'list',
  dialog: undefined,
  render: ({
    categories,
    categoryList,
    trackers,
    domain,
    type,
    dialog,
  }) => html`
    <template layout="column gap:2">
      <div layout="row items:center gap">
        <div layout="grow"><slot></slot></div>
        <ui-tooltip>
          <span slot="content">WhoTracks.Me Statistical Report</span>
          <a
            class="action"
            href="https://www.whotracks.me/websites/${domain}.html"
            target="_blank"
          >
            <ui-icon name="panel-whotracksme"></ui-icon>
          </a>
        </ui-tooltip>
        ${trackers &&
        html`<div class="action-group">
          <ui-tooltip>
            <span slot="content">Graph View</span>
            <button
              class="action ${type === 'graph' ? 'active' : ''}"
              onclick="${html.set('type', 'graph')}"
            >
              <ui-icon name="panel-chart"></ui-icon>
            </button>
          </ui-tooltip>
          <ui-tooltip>
            <span slot="content">Detailed View</span>
            <button
              class="action ${type === 'list' ? 'active' : ''}"
              onclick="${html.set('type', 'list')}"
            >
              <ui-icon name="panel-list"></ui-icon>
            </button>
          </ui-tooltip>
        </div>`}
      </div>
      ${type === 'graph' &&
      html`
        <div layout="row gap:3">
          <ui-tracker-wheel
            categories="${categories}"
            layout="shrink:0 size:12 margin:top"
          ></ui-tracker-wheel>
          <div layout="column grow">
            ${categoryList.map(
              ([category, count]) => html`
                <ui-stats-category
                  name="${category}"
                  count="${count}"
                ></ui-stats-category>
              `,
            )}
          </div>
        </div>
      `}
      ${type === 'list' &&
      html`
        <section>
          ${trackers.map(
            ([name, { count, trackers }]) => html`
              <ui-stats-category-list name="${name}">
                <div slot="header" layout="row items:center gap">
                  <ui-stats-badge>
                    ${count} in ${trackers.length}
                  </ui-stats-badge>
                </div>
                ${trackers.map(
                  (t) =>
                    html`
                      <ui-text type="body-s" ellipsis>
                        <ui-link
                          clean
                          href="${t.company && dialog
                            ? router.url(dialog, { company: t.company })
                            : ''}"
                        >
                          <div layout="row items:center gap:0.5">
                            ${t.name}
                            <ui-stats-badge>${t.count}</ui-stats-badge>
                          </div>
                        </ui-link>
                      </ui-text>
                    `,
                )}
              </ui-stats-category-list>
            `,
          )}
        </section>
      `}
    </template>
  `.css`
    .action {
      cursor: pointer;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      appearance: none;
      border: none;
      background: var(--ui-color-white);
      border: 1px solid var(--ui-color-gray-200);
      box-shadow: 0px 2px 6px rgba(32, 44, 68, 0.08);
      border-radius: 8px;
      width: 36px;
      height: 36px;
      transition: all 0.2s;
      padding: 0;
    }

    .action { color: var(--ui-color-gray-900); }
    .action:hover { color: var(--ui-color-primary-500); }
    .action:active { color: var(--ui-color-primary-700); }

    .action-group {
      display: flex;
      background: var(--ui-color-gray-100);
      border: 1px solid  var(--ui-color-gray-200);
      border-radius: 8px;
      padding: 2px;
      gap: 2px;
    }

    .action-group .action {
      width: 30px;
      height: 30px;
    }

    .action-group .action:not(.active) {
      background: none;
      border: none;
      box-shadow: none;
    }
  `,
});

define({
  tag: 'ui-stats-category',
  name: '',
  count: 0,
  render: ({ name, count }) => html`
    <template layout="row gap items:center">
      <div id="pill" layout="size:12px:6px"></div>
      <div id="label" layout="row gap items:center grow">
        <ui-text type="body-s" color="gray-500" layout="grow">
          ${labels.categories[name]}
        </ui-text>
        <ui-text type="label-s" id="count">${count}</ui-text>
      </div>
    </template>
  `.css`
    #pill {
      background: ${getCategoryColor(name)};
      border-radius: 3px;
    }

    #count {
      font-weight: 600;
    }

    #label {
      border-bottom: 1px solid var(--ui-color-gray-200);
      padding: 4px 0;
    }

    :host(:last-child) #label {
      border-bottom: none;
    }
  `,
});

define({
  tag: 'ui-stats-category-list',
  name: '',
  closed: false,
  render: ({ name, closed }) => html`
    <template layout="column gap:1.5">
      <button
        id="header"
        onclick="${html.set('closed', !closed)}"
        layout="row items:center gap"
      >
        <ui-icon
          id="icon"
          name="panel-heart"
          layout="relative size:2"
        ></ui-icon>
        <ui-text type="label-m">${labels.categories[name]}</ui-text>
        <slot name="header"></slot>
        <div layout="grow"></div>
        <ui-icon id="arrow" name="arrow-down" color="gray-500"></ui-icon>
      </button>
      <section id="content" layout="column gap:1.5 margin:left:4">
        <slot></slot>
      </section>
    </template>
  `.css`
    :host {
      padding: 8px 8px 12px 12px;
      border: 1px solid var(--ui-color-gray-200);
      border-bottom: none;
    }

    :host(:first-of-type) {
      border-radius: 8px 8px 0 0;
    }

    :host(:last-of-type) {
      border-radius: 0 0 8px 8px;
      border-bottom: 1px solid var(--ui-color-gray-200);
    }

    #header {
      cursor: pointer;
      padding: 0;
      background: none;
      appearance: none;
      border: none;
      overflow: hidden;
    }

    #header:is(:hover, :focus-visible) ui-text {
      color: var(--ui-color-primary-700);
    }

    #icon {
      padding: 4px;
      color: ${getCategoryColor(name)};
    }

    #icon::before {
      content: '';
      display: block;
      position: absolute;
      inset: 0;
      background: ${getCategoryColor(name)};
      opacity: 0.15;
      border-radius: 4px;
    }

    #arrow {
      transition: transform 0.1s;
    }

    :host([closed]) #arrow {
      transform: rotate(180deg);
    }

    #content ::slotted(*) {
      --ui-link-color-hover: var(--ui-color-primary-700);
    }

    :host([closed]) #content {
      display: none;
    }
  `,
});

define({
  tag: 'ui-stats-badge',
  render: () => html`
    <template layout="row center width::2 height:2">
      <ui-text type="label-xs" color="gray-500"><slot></slot></ui-text>
    </template>
  `.css`
    :host {
      box-sizing: border-box;
      padding: 0px 2px;
      border: 1px solid var(--ui-color-gray-200);
      border-radius: 4px;
    }
  `,
});
