let isTrackingPaused = false;
let activeTabId;
let startTime = 0;
let pausedTime = 0;
let websiteBlocker = null;
const generatedColors = new Set();

setInterval(updateElapsedTime, 1000);

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'pause') {
    isTrackingPaused = true;
  } else if (message.action === 'resume') {
    isTrackingPaused = false;
  } else {
    websiteBlocker = message.action;
  }
});


function extractDomain(url) {
  const match = url.match(/^https?\:\/\/(?:www\.)?([^\/?#]+)(?:[\/?#]|$)/i);
  let domain = match && match[1];
  if (domain && domain.endsWith('.com')) {
    domain = domain.slice(0, -4);
  }
  return domain;
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';

  do {
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
  } while (generatedColors.has(color));

  generatedColors.add(color);

  return color;
}

function websiteBlockerFunction() {
  console.log("Function is called");
  chrome.tabs.update(activeTabId, { url: chrome.runtime.getURL('block.html') });
}

function pad(number) {
  return (number < 10 ? '0' : '') + number;
}

function updateElapsedTime() {
  if (!isTrackingPaused && activeTabId !== undefined) {
    let elapsedTime;
    elapsedTime=1000;
    chrome.tabs.get(activeTabId, function (tab) {
      if (tab && tab.url !== undefined) {
        const domain = extractDomain(tab.url);
        chrome.storage.local.get({ "data": [] }, function (result) {
          const storedData = result.data || [];
          const index = storedData.findIndex(entry => entry.domain === domain);

          if (index !== -1) {
            storedData[index].time += elapsedTime;
            let remainderWebsite = JSON.parse(websiteBlocker);
            let blockDomainName = "";
            let blockDomainTime = null;
            let time = storedData[index].time / 1000;

            if (remainderWebsite) {
              remainderWebsite.forEach((item) => {
                if (item.url === domain) {
                  blockDomainName = item.url;
                  blockDomainTime = item.time * 60;
                }
              });
            }

            if (blockDomainName === domain && blockDomainTime <= time) {
              websiteBlockerFunction();
            }
          } else {
            let color = getRandomColor();
            if (domain != null) {
              storedData.push({ domain, time: elapsedTime, color });
            }
          }

          chrome.storage.local.set({ "data": storedData });
         
        });
      } else {
        console.log("Error: Tab information or URL not available");
      }
    });
  }
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  activeTabId = activeInfo.tabId;
  updateElapsedTime();
});
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  if (tabId === activeTabId) {
    updateElapsedTime();
  }
});
chrome.runtime.onSuspend.addListener(function () {
  updateElapsedTime();
});