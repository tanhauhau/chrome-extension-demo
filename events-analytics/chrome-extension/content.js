function installHook() {
  if (window.__MY_EXTENSION_HOOK__) {
    return;
  }

  const listeners = new Map();
  const hook = {
    recordEvent(data) {
      window.postMessage({
        source: 'my-chrome-extension-web-page',
        data,
      });
      console.groupCollapsed(data.name);
      console.log('timestamp:', new Date());
      console.log('event:', data.name);
      console.log('data:', data.value);
      console.groupEnd();
    },
  };

  Object.defineProperty(window, '__MY_EXTENSION_HOOK__', {
    configurable: false,
    enumerable: false,
    get() {
      return hook;
    },
  });
}

window.addEventListener('message', listenFromWebPage);
function listenFromWebPage(event) {
  if (event.data && event.data.source === 'my-chrome-extension-web-page') {
    port.postMessage({
      type: 'new_event',
      to: 'devtools',
      data: event.data.data,
    });
  }
}

const port = chrome.runtime.connect({
  name: 'content-script',
});

// execute the install hook in web page context
const script = document.createElement('script');
script.textContent = `;(${installHook.toString()})();`;
document.documentElement.appendChild(script);
