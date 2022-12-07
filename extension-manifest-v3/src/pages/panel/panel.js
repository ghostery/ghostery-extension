import { define, html, router } from 'hybrids';

import Home from './views/home.js';

export default define({
  tag: 'gh-panel',
  stack: router([Home]),
  content: ({ stack }) =>
    html`<template layout="block width::375px">${stack}</template>`,
});
