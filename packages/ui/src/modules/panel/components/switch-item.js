import { html } from 'hybrids';

export default {
  active: false,
  render: () => html`<template
    layout="block width:full absolute top:2 left:2 height::118px"
    layout[active]="static top:auto left:auto"
  >
    <slot></slot>
  </template>`.css`
    :host {
      transition: transform 500ms cubic-bezier(0.4, 0.15, 0, 1);
      will-change: transform;
    }

    :host(:not([active]):first-child) {
      transform: translateX(-110%);
    }

    :host(:not([active]):last-child) {
      transform: translateX(110%);
    }
  `,
};
