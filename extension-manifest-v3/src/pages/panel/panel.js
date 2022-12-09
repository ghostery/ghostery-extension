import { define, html, router } from 'hybrids';

import Main from './views/main.js';

export default define({
  tag: 'gh-panel',
  stack: router([Main]),
  content: ({ stack }) =>
    html`<template layout="block width::375px">${stack}</template>`,
});
