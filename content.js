// content.js
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "getURL") {
      sendResponse({ url: window.location.href });
    }
  });
  