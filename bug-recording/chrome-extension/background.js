const ports = {};
const NAME_REGEX = /^(popup|content-script)(\/(\d*))?$/;

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
      background: getBackground(tab),
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

function getBackground(tabId) {
  const background = {
    postMessage: handleBackgroundMessage,
  };

  function handleBackgroundMessage({ type }) {
    if (type === 'start-recording') {
      captureScreenRecording(function(stream) {
        const mediaRecorder = createRecorder({ stream, onFinishRecording });

        function onFinishRecording(chunks) {
          const blobUrl = createBlobUrl(chunks);
          reportBugWithRecording(blobUrl);
        }

        changeIconToStopRecord(tabId, stopRecording);

        function stopRecording() {
          mediaRecorder.stop();
          stream.getTracks().map(track => {
            track.stop();
          });
          resetIconAfterRecording(tabId, stopRecording);
        }
      });
    }
  }

  return background;
}
function reportBugWithRecording(blobUrl) {
  // TODO
  console.log('report bug to in-house bug tracker');
  console.log('Recording: ', blobUrl)
}

function captureScreenRecording(callback) {
  chrome.tabCapture.capture({ audio: true, video: true }, callback);
}

function createRecorder({ stream, onFinishRecording }) {
  const chunks = [];
  const mediaRecorder = new MediaRecorder(stream);
  mediaRecorder.onstop = () => onFinishRecording(chunks);
  mediaRecorder.ondataavailable = function(event) {
    chunks.push(event.data);
  };
  mediaRecorder.start();
  return mediaRecorder;
}

function createBlobUrl(byteArray) {
  const time = new Date().getTime();
  const blob = new Blob(byteArray, { type: 'video/webm' });
  const file = new File([blob], time.toString(10) + '.webm', {
    lastModified: time,
    type: 'video/webm',
  });
  return URL.createObjectURL(file);
}

function changeIconToStopRecord(tabId, stopRecording) {
  chrome.browserAction.setIcon({ tabId, path: 'record_stop.png' });
  chrome.browserAction.setPopup({ tabId, popup: '' });
  chrome.browserAction.onClicked.addListener(stopRecording);
}

function resetIconAfterRecording(tabId, stopRecording) {
  chrome.browserAction.setIcon({
    tabId,
    path: {
      '16': 'img_16.png',
      '32': 'img_32.png',
      '64': 'img_64.png',
    },
  });
  chrome.browserAction.setPopup({ tabId, popup: 'popup.html' });
  chrome.browserAction.onClicked.removeListener(stopRecording);
}
