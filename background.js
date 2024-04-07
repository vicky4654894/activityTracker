let activeTabId;
let startTime = 0;

const refreshInterval = 1000;

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

setInterval(updateElapsedTime, refreshInterval);

function updateElapsedTime() {
  if (activeTabId !== undefined) {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - startTime;
    chrome.tabs.get(activeTabId, function (tab) {
      if (tab && tab.url !== undefined) {
        const domain = extractDomain(tab.url);

        chrome.storage.local.get({ "data": [] }, function (result) {
          const storedData = result.data || [];
          const index = storedData.findIndex(entry => entry.domain === domain);

          if (index !== -1) {
            storedData[index].time += elapsedTime;
          } else {
            // console.log("First Time");
            let color = getRandomColor();
            storedData.push({ domain, time: elapsedTime,color });
          }
          console.log(storedData);
          chrome.storage.local.set({ "data": storedData });

          startTime = currentTime;

        //  console.log(`Domain: ${domain}, Time: ${formatTime(elapsedTime)}`);
        });
      } else {
        console.log("Error: Tab information or URL not available");
      }
    });
  }
}

chrome.tabs.onActivated.addListener(function (activeInfo) {
  updateElapsedTime(); 
  activeTabId = activeInfo.tabId;
  startTime = new Date().getTime();
});

chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
  if (tabId === activeTabId) {
    updateElapsedTime(); 
  }
});


chrome.runtime.onSuspend.addListener(function () {
  updateElapsedTime();
});

function extractDomain(url) {
  const match = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  return match && match[1];
}

function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
}

function pad(number) {
  return (number < 10 ? '0' : '') + number;
}
