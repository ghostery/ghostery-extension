import { define, html } from 'hybrids';

export default define({
  tag: 'ui-panel-action-group',
  render: () => html`<template layout="row padding:2px gap:2px">
    <slot></slot>
  </template>`.css`
    :host {
      background: var(--ui-color-gray-100);
      border: 1px solid  var(--ui-color-gray-200);
      border-radius: 8px;
    }
  `,
});
