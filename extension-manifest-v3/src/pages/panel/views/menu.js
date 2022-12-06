import { define, html, msg, router } from 'hybrids';

const MENU = [
  {
    icon: 'panel-user',
    label: msg`Sign in`,
    href: 'https://signon.ghostery.com/',
  },
  {
    icon: 'panel-heart',
    label: msg`Become a contributor`,
    href: 'https://www.ghostery.com/become-a-contributor',
  },
  {},
  {
    icon: 'panel-alert',
    label: msg`Report a broken page`,
    href: 'https://www.ghostery.com/support',
  },
  {
    icon: 'panel-send',
    label: msg`Submit a new tracker`,
    href: 'https://www.ghostery.com/submit-a-tracker',
  },
  {
    icon: 'panel-help',
    label: msg`Contact support`,
    href: 'https://www.ghostery.com/support',
  },
  {},
  {
    icon: 'panel-shield',
    label: msg`Unprotected sites`,
    href: chrome.runtime.getURL('/pages/options/index.html'),
  },
  {
    icon: 'panel-settings',
    label: msg`Settings`,
    href: chrome.runtime.getURL('/pages/options/index.html'),
  },
  {
    icon: 'panel-info',
    label: msg`About`,
    href: 'https://www.ghostery.com/',
  },
];

export default define({
  tag: 'gh-panel-menu-view',
  content: () => html`
    <template layout="grid">
      <gh-panel-menu>
        <ui-header slot="header">
          Menu
          <ui-action slot="actions">
            <a href="${router.backUrl({ scrollToTop: true })}">
              <ui-icon name="close" color="gray-900"></ui-icon>
            </a>
          </ui-action>
        </ui-header>
        ${MENU.map(({ icon, label, href }) =>
          label
            ? html`
                <ui-text>
                  <a href="${href}" target="_blank" layout="block margin:1:2">
                    <gh-panel-menu-item icon="${icon}">
                      ${label}
                    </gh-panel-menu-item>
                  </a>
                </ui-text>
              `
            : html`<hr />`,
        )}
      </gh-panel-menu>
    </template>
  `,
});
