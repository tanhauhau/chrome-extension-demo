const ports = {};
const NAME_REGEX = /^(popup|content-script|devtools)(\/(\d*))?$/;

chrome.runtime.onConnect.addListener(function(port) {
  const match = port.name.match(NAME_REGEX);
  if (!match) return;
  
  const tab = match[3] || port.sender.tab.id;
  const name = match[1];

  if (!ports[tab]) {
    ports[tab] = {
      devtools: null,
      'content-script': null,
      popup: null,
    };
  }
  ports[tab][name] = port;
  port.onMessage.addListener(function(message) {
    const to = message.to;
    if (ports[tab][to]) {
      ports[tab][to].postMessage(message);
    }
  });
});
