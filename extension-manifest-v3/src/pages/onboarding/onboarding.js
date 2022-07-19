import { define, html, store } from 'hybrids';
import Options, { DNR_RULES_LIST } from '/store/options';

function updateOptions(host, event) {
  const success = event.type === 'success';

  store.set(Options, {
    dnrRules: DNR_RULES_LIST.reduce(
      (all, rule) => ({ ...all, [rule]: success }),
      {},
    ),
    terms: success,
    onboarding: { done: true },
  });
}

export default define({
  tag: 'gh-onboarding',
  content: () =>
    html`<ui-onboarding
      onsuccess="${updateOptions}"
      onskip="${updateOptions}"
    ></ui-onboarding>`,
});
