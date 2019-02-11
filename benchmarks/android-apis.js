module.exports = (emulator) => {
  emulator.addChromeApi('cliqzSearchEngines', {
    getEngines: () => {
      return [{
        isDefault: true,
        name: 'cliqz',
        searchForm: 'https://search.cliqz.com/',
      }];
    },
    getDefaultEngine: () => ({
        isDefault: true,
        name: 'cliqz',
      searchForm: 'https://search.cliqz.com/',
    })
  });
  emulator.addChromeApi('cliqzNativeBridge', {
    callAction: (action, args) => {
      if (action == 'getInstallDate') {
        return '16917'
      }
      return;
    }
  });
  emulator.addChromeApi('cliqzAppConstants', {
    get: () => '',
  });
};
