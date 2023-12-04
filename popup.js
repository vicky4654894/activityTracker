document.addEventListener('DOMContentLoaded', function () {
  const port = chrome.runtime.connect({ name: 'popup' });

  // Retrieve stored data from local storage and display in the popup
  refreshData();

  // Refresh data every second
  const intervalId = setInterval(refreshData, 1000);

  // Send a message to the background script when the popup is closed
  window.addEventListener('beforeunload', function () {
    clearInterval(intervalId);
    port.postMessage({ action: 'popupClosed' });
  });
});

function refreshData() {
  // Retrieve stored data from local storage
  chrome.storage.local.get({ "data": [] }, function (result) {
    const storedData = result.data;
    const activityList = document.getElementById('activityList');

    // Clear existing content
    activityList.innerHTML = '';

    // Display stored data in the popup
    storedData.forEach(entry => {
      const listItem = document.createElement('li');
      console.log(entry.domain); // Corrected property name
      if(entry.domain == null){
        entry.domain="chrome";
      }
      listItem.textContent = `Domain: ${entry.domain}, Time: ${formatTime(entry.time)}`;
      activityList.appendChild(listItem);
    });

    // Update the current time
    const currentTimeElement = document.getElementById('currentTime');
    currentTimeElement.textContent = `Current Time: ${getCurrentTime()}`;
  });
}

// Function to format time in HH:mm:ss format
function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
}

// Function to pad single-digit numbers with leading zero
function pad(number) {
  return (number < 10 ? '0' : '') + number;
}

// Function to get the current time
function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
