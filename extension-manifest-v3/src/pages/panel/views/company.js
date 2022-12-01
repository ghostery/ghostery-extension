import { define, html, router, store } from 'hybrids';
import Stats, { Company } from '/store/stats';

export default define({
  [router.connect]: { dialog: true },
  tag: 'gh-panel-company-view',
  company: store(Company),
  stats: store(Stats),
  trackers: ({ company, stats }) =>
    store.ready(stats) && stats.trackers.filter((t) => t.company === company),
  content: ({ company, trackers }) => html`
    <template layout="contents">
      <gh-panel-dialog>
        <ui-text slot="header" type="label-l">${company.name}</ui-text>
        ${trackers &&
        html`
          <ui-text slot="header" type="body-s" color="gray-500">
            ${trackers.length} trackers
          </ui-text>
          <ui-text type="body-s">${company.description}</ui-text>
          <hr />
          <section layout="grid:max|1 items:start:stretch gap:1:3">
            <ui-icon name="panel-browser"></ui-icon>
            <div layout="column gap">
              <ui-text type="label-s">Detected trackers:</ui-text>
              ${trackers.map(
                ({ url }) =>
                  html`<ui-text type="label-xs" color="primary-700" ellipsis>
                    ${url}
                  </ui-text>`,
              )}
            </div>
            ${company.website &&
            html`
              <ui-icon name="panel-globe"></ui-icon>
              <div layout="column gap">
                <ui-text type="label-xs">Website</ui-text>
                <ui-text type="label-xs" color="primary-700" ellipsis>
                  <ui-link href="${company.website}" external clean>
                    ${company.website}
                  </ui-link>
                </ui-text>
              </div>
            `}
            ${company.privacyPolicy &&
            html`
              <ui-icon name="panel-privacy"></ui-icon>
              <div layout="column gap">
                <ui-text type="label-xs">
                  <!-- | Panel Company -->Privacy policy
                </ui-text>
                <ui-text type="label-xs" color="primary-700" ellipsis>
                  <ui-link href="${company.privacyPolicy}" external clean>
                    ${company.privacyPolicy}
                  </ui-link>
                </ui-text>
              </div>
            `}
            ${company.contact &&
            html`
              <ui-icon name="panel-mail"></ui-icon>
              <div layout="column gap">
                <ui-text type="label-xs">Contact</ui-text>
                <ui-text type="label-xs" color="primary-700" ellipsis>
                  <ui-link
                    href="${company.contact.startsWith('http')
                      ? ''
                      : 'mailto:'}${company.contact}"
                    external
                    clean
                  >
                    ${company.contact}
                  </ui-link>
                </ui-text>
              </div>
            `}
          </section>
        `}
      </gh-panel-dialog>
    </template>
  `,
});
