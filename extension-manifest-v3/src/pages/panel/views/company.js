import { define, html, router, store } from 'hybrids';
import Stats, { Company } from '/store/stats';

function cleanUp(text) {
  return text.replace(/(\\"|\\n|\\t|\\r)/g, '').trim();
}

export default define({
  [router.connect]: { dialog: true },
  tag: 'gh-panel-company-view',
  company: store(Company),
  stats: store(Stats),
  trackers: ({ company, stats }) =>
    store.ready(stats) && stats.trackers.filter((t) => t.company === company),
  content: ({ company, trackers }) => html`
    <template layout="column">
      <gh-panel-dialog>
        <ui-text slot="header" type="label-l">${company.name}</ui-text>
        ${trackers &&
        html`
          <ui-text slot="header" type="body-s" color="gray-500">
            ${trackers.length} trackers
          </ui-text>
          <ui-text type="body-s">${cleanUp(company.description)}</ui-text>
          <hr />
          <section
            layout="
              grid:max|1 items:start:stretch content:start gap:1:3 
              grow:1 
              padding:bottom:4
            "
          >
            <ui-icon name="browser"></ui-icon>
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
              <ui-icon name="globe"></ui-icon>
              <div layout="column gap">
                <ui-text type="label-xs">Website</ui-text>
                <ui-text
                  type="label-xs"
                  color="primary-700"
                  ellipsis
                  layout="padding margin:-1"
                >
                  <a href="${company.website}" target="_blank">
                    ${company.website}
                  </a>
                </ui-text>
              </div>
            `}
            ${company.privacyPolicy &&
            html`
              <ui-icon name="privacy"></ui-icon>
              <div layout="column gap">
                <ui-text type="label-xs">
                  <!-- | Panel Company -->Privacy policy
                </ui-text>
                <ui-text
                  type="label-xs"
                  color="primary-700"
                  ellipsis
                  layout="padding margin:-1"
                >
                  <a href="${company.privacyPolicy}" target="_blank">
                    ${company.privacyPolicy}
                  </a>
                </ui-text>
              </div>
            `}
            ${company.contact &&
            html`
              <ui-icon name="mail"></ui-icon>
              <div layout="column gap">
                <ui-text type="label-xs">Contact</ui-text>
                <ui-text
                  type="label-xs"
                  color="primary-700"
                  ellipsis
                  layout="padding margin:-1"
                >
                  <a
                    href="${company.contact.startsWith('http')
                      ? ''
                      : 'mailto:'}${company.contact}"
                    target="_blank"
                  >
                    ${company.contact}
                  </a>
                </ui-text>
              </div>
            `}
          </section>
        `}
      </gh-panel-dialog>
    </template>
  `,
});
