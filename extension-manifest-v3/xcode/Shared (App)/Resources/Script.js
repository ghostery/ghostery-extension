function show(platform, enabled) {
  const body = document.body;

  body.classList.add(`platform-${platform}`);

  if (typeof enabled === 'boolean') {
    body.classList.toggle('state-on', enabled);
    body.classList.toggle('state-off', !enabled);
  } else {
    body.classList.remove('state-on');
    body.classList.remove('state-off');
    body.classList.add('state-unknown');
  }
}

function postMessage(name) {
  webkit.messageHandlers.controller.postMessage(name);
}

function localize(messages) {
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key =
      element.dataset.i18n ||
      element.innerHTML.trim().replace(/[\s\n\t]+/g, ' ');
    const value = messages[key];
    if (value) element.innerHTML = value;
  });
}

document
  .querySelector('#button-subscribe')
  .addEventListener('click', () => postMessage('open-subscriptions'));

document
  .querySelector('#button-preferences')
  .addEventListener('click', () => postMessage('open-preferences'));

document.querySelector('#button-help').addEventListener('click', (ev) => {
  ev.preventDefault();
  postMessage('open-support');
});
