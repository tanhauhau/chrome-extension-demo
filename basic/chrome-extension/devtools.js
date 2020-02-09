console.log('devtools');

// create panel
chrome.devtools.panels.create(
  'My Devtools',
  'img_16.png',
  'panel.html'
);
