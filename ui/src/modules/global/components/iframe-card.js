import { html } from 'hybrids';

export default {
  header: '',
  render: ({ header }) =>
    html`
      <template layout="column">
        ${header &&
        html`
          <header layout="row center">
            <ui-text
              type="display-2xs"
              color="primary-500"
              layout="row gap items:center margin"
            >
              <ui-icon
                name="ghosty"
                layout="block width:16px height:16px"
              ></ui-icon>
              ${header}
            </ui-text>
          </header>
        `}
        <slot></slot>
      </template>
    `.css`
      :host {
        background: white;
        border-radius: 16px;
      }

      header {
        background: rgba(0, 174, 240, 0.15);
      }

      header ui-text {
        background: white;
        border-radius: 16px;
        padding: 4px 10px;
      }
    `,
};
