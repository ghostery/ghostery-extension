import { html, msg, store } from 'hybrids';

import Options from '/store/options.js';
import { getCategories } from '/utils/trackerdb';

const PATTERNS_LIMIT = 50;

function loadMore(category) {
  return (host) => {
    host.limits = {
      ...host.limits,
      [category]: (host.limits[category] || PATTERNS_LIMIT) + PATTERNS_LIMIT,
    };
  };
}

function search(categories, query) {
  if (!query || query.length < 3) return categories;
  query = query.trim().toLowerCase();

  const result = [];

  for (const category of categories) {
    const patterns = category.patterns.filter((p) => {
      return (
        p.name.toLowerCase().includes(query) ||
        p.organization?.name.toLowerCase().includes(query)
      );
    });

    if (patterns.length) {
      result.push({ ...category, patterns });
    }
  }

  return result;
}

export default {
  options: store(Options),
  categories: () => getCategories(),
  limits: {
    set: (host, value = {}) => value,
  },
  query: {
    value: '',
    observe(host, value) {
      if (value.length >= 3) {
        host.category = '_all';
      } else {
        host.category = '';
      }

      host.limits = {};
    },
  },
  category: {
    value: '',
    observe(host) {
      host.limits = {};
    },
  },
  content: ({ options, categories, category, limits, query }) => html`
    <template layout="column gap:4">
      ${store.ready(options) &&
      html`
        <section layout="column gap:4" layout@768px="gap:5">
          <div layout="column gap" layout@992px="margin:bottom">
            <ui-text type="headline-l" mobile-type="headline-m">
              Tracker database
            </ui-text>
            <ui-text type="body-l" mobile-type="body-m" color="gray-600">
              Listed entities may or may not be trackers, meaning not all of
              them are collecting your personal data.
            </ui-text>
            <ui-text
              type="label-m"
              mobile-type="body-m"
              color="primary-700"
              underline
            >
              <a
                href="https://github.com/ghostery/trackerdb"
                rel="noreferrer"
                layout="row gap:0.5"
                target="_blank"
              >
                View trackerdb on GitHub
                <ui-icon name="arrow-right-s"></ui-icon>
              </a>
            </ui-text>
          </div>
          <div layout="row gap items:center">
            <gh-settings-button
              onclick="${html.set(
                'category',
                category !== '_all' ? '_all' : '',
              )}"
              layout="width::12"
            >
              ${category !== '_all' ? msg`Expand` : msg`Collapse`}
            </gh-settings-button>
            <gh-settings-input layout="grow">
              <input
                type="search"
                value="${query}"
                oninput="${html.set('query')}"
                placeholder="Search for a tracker or organization..."
              />
            </gh-settings-input>
          </div>
          <div layout="column gap:0.5">
            ${html.resolve(
              categories.then((list) =>
                search(list, query).map(
                  ({ key, description, patterns }) =>
                    html`
                      <gh-settings-trackers-list
                        name="${key}"
                        description="${description}"
                        open="${key === category || category === '_all'}"
                        blocked="${patterns.length}"
                        ontoggle="${html.set(
                          'category',
                          key === category || category === '_all' ? '' : key,
                        )}"
                      >
                        ${(key === category || category === '_all') &&
                        patterns.map(
                          (p, index) =>
                            index <= (limits[key] || PATTERNS_LIMIT) &&
                            html`
                              <div layout="row items:center gap">
                                <div
                                  layout="column grow"
                                  layout@768px="row gap:2"
                                >
                                  <ui-text type="label-m"> ${p.name} </ui-text>
                                  ${p.organization &&
                                  html`
                                    <ui-text color="gray-600">
                                      ${p.organization.name}
                                    </ui-text>
                                  `}
                                </div>
                                <ui-panel-protection-status-toggle
                                  responsive
                                ></ui-panel-protection-status-toggle>
                              </div>
                            `,
                        )}
                        ${(limits[key] || PATTERNS_LIMIT) < patterns.length &&
                        html`
                          <div layout="row center margin:bottom:2">
                            <gh-settings-button onclick="${loadMore(key)}">
                              Load more
                            </gh-settings-button>
                          </div>
                        `}
                      </gh-settings-trackers-list>
                    `,
                ),
              ),
            )}
          </div>
        </section>
      `}
    </template>
  `,
};
