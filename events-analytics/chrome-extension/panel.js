console.log('panel');

const events = [];

const count_span = document.querySelector('#count');
const events_ul = document.querySelector('#events');

function update_ui() {
  count_span.textContent = `${events.length} event${
    events.length > 1 ? 's' : ''
  }`;
  events_ul.innerHTML = events
    .map(event => {
      return `<li><strong>${event.name}</strong> <div>${JSON.stringify(
        event.value
      )}<div></li>`;
    })
    .join('');
}

update_ui();

const port = chrome.runtime.connect({
  name: `devtools/${chrome.devtools.inspectedWindow.tabId}`,
});
function subscribe(listener) {
  port.onMessage.addListener(listener);
  return () => port.onMessage.removeListener(listener);
}

subscribe(event => {
  console.log('event', event);
  if (event.type === 'new_event') {
    const data = event.data;
    events.push(data);
    update_ui();
  }
});
