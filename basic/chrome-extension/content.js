// 1. Listen message from web page
window.addEventListener('message', listenFromWebPage);
function listenFromWebPage(event) {
  if (event.data && event.data.source === 'my-chrome-extension-web-page') {
    port.postMessage(event.data.data);
  }
}

// 2. Listen message from background script
const port = chrome.runtime.connect({
  name: 'content-script',
});
port.onMessage.addListener(handleMessageFromBackground);
function handleMessageFromBackground(message) {
  window.postMessage({
    source: 'my-chrome-extension-content-script',
    ...message,
  });
}

// 3. Install extension hook into the web page
const script = document.createElement('script');
script.textContent = `;(${installHook.toString()})();`;
document.documentElement.appendChild(script);

function installHook() {
  if (window.__MY_EXTENSION_HOOK__) {
    return;
  }

  const listeners = new Map();
  const hook = {
    subscribe(eventName, listener) {
      if (!listeners.has(eventName)) listeners.set(eventName, []);
      listeners.get(eventName).push(listener);
    },
    sendMessage(data) {
      window.postMessage({
        source: 'my-chrome-extension-web-page',
        data,
      });
    },
  };
  // listen for events
  window.addEventListener('message', listenFromContentScript);
  function listenFromContentScript(event) {
    if (
      event.source === window &&
      event.data &&
      event.data.source === 'my-chrome-extension-content-script'
    ) {
      if (listeners.has(event.data.type)) {
        listeners
          .get(event.data.type)
          .forEach(listener => listener(event.data));
      }
    }
  }

  // define a read only, non-overridable and couldn't be found on globalThis property keys
  Object.defineProperty(window, '__MY_EXTENSION_HOOK__', {
    configurable: false,
    enumerable: false,
    get() {
      return hook;
    },
  });
}
