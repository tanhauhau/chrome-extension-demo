async function init() {
  const tabId = await getCurrentTabId();

  const select = document.querySelector('select');
  select.addEventListener('change', event => {
    send({
      from: 'popup',
      to: 'content-script',
      type: 'language.change',
      data: event.target.value,
    });
  });

  const checkboxes = document.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach(checkbox => {
    checkbox.addEventListener('change', event => {
      send({
        from: 'popup',
        to: 'content-script',
        type: `feature.${event.target.value}`,
        data: event.target.checked,
      });
    });
  });

  const port = chrome.runtime.connect({ name: `popup/${tabId}` });
  function subscribe(listener) {
    port.onMessage.addListener(listener);
    return () => port.onMessage.removeListener(listener);
  }
  function send(message) {
    port.postMessage(message);
  }

  send({
    from: 'popup',
    to: 'content-script',
    type: 'init',
  });

  subscribe(event => {
    if (event.type === 'init_data') {
      const { language, feature_toggles } = event.data;
      checkboxes.forEach(checkbox => {
        checkbox.checked = feature_toggles[checkbox.value.replace('toggle-', '')];
      });
      select.value = language;
    }
  });
}

function getCurrentTabId() {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      resolve(tabs[0].id);
    });
  });
}

init();
