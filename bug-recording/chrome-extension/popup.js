async function init() {
  const tabId = await getCurrentTabId();

  const button = document.querySelector('button');
  button.addEventListener('click', event => {
    send({
      from: 'popup',
      to: 'background',
      type: 'start-recording',
    });
    window.close();
  });

  const port = chrome.runtime.connect({ name: `popup/${tabId}` });
  function subscribe(listener) {
    port.onMessage.addListener(listener);
    return () => port.onMessage.removeListener(listener);
  }
  function send(message) {
    port.postMessage(message);
  }
}

function getCurrentTabId() {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      resolve(tabs[0].id);
    });
  });
}

init();
