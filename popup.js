document.getElementById('pauseButton').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: 'pause' });
});

document.getElementById('resumeButton').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: 'resume' });
});

function formatDate() {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = months[currentDate.getMonth()];
  const year = currentDate.getFullYear();
  return `${day}-${month}-${year}`;
}

function storageHelper(data) {
  let dateKey = `data ${formatDate()}`;
  if(data){
    localStorage.setItem(dateKey, JSON.stringify(data));
  }
}

function refreshData() {
  chrome.runtime.sendMessage({ action: localStorage.getItem("websiteBlocker") });
  let dateKey = `data ${formatDate()}`;
  chrome.storage.local.get({ [dateKey]: [] }, function (result) {
    const storedData = result[dateKey];
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = '';
    totalTime = 0; // Reset total time
    storedData.forEach(entry => {
      const listItem = document.createElement('li');
      const colorbox = document.createElement('span');
      colorbox.style.width = "20px";
      colorbox.style.height = "20px";
      listItem.style.color="black";

      if (entry.domain == null) {
        entry.domain = "chrome";
      }
      listItem.textContent = `Domain: ${entry.domain}, Time: ${formatTime(entry.time)}`;
      console.log(entry.time);

      colorbox.style.backgroundColor = entry.color;
      colorbox.textContent = `${entry.color}`;
      listItem.style.backgroundColor = entry.color;
      activityList.appendChild(listItem);
      totalTime += entry.time; // Accumulate total time
    });

    const domainData = {};
    storedData.forEach(entry => {
      if (entry.domain in domainData) {
        domainData[entry.domain] += entry.time;
      } else {
        domainData[entry.domain] = entry.time;
      }
    });

    const currentTimeElement = document.getElementById('currentTime');
    currentTimeElement.textContent = `Current Time: ${getCurrentTime()}`;

    const totalTimeElement = document.getElementById('timeSpent');
    totalTimeElement.textContent = `Total Time Spent: ${formatTime(totalTime)}`; // Display total time
    localStorage.setItem("totalTime "+formatDate(),totalTime);
    storageHelper(storedData);
  });
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

function getCurrentTime() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

document.getElementById('timeLimitForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const websiteUrl = document.getElementById('websiteUrl').value;
  const timeLimit = parseInt(document.getElementById('timeLimit').value);
  let websiteData = JSON.parse(localStorage.getItem("websiteBlocker"));

  if (websiteData === null) {
    websiteData = [];
  }
  websiteData.push({ url: websiteUrl, time: timeLimit });
  localStorage.setItem("websiteBlocker", JSON.stringify(websiteData));
  displayWebsiteBlocker();
});

function displayWebsiteBlocker() {
  const submittedList = document.querySelector('.submittedList');
  submittedList.innerHTML = '';

  const websiteData = JSON.parse(localStorage.getItem("websiteBlocker")) || [];
  websiteData.forEach((item, index) => {
    const li = document.createElement('li');
    li.setAttribute('class', 'd-flex justify-content-between p-1');
    li.textContent = `URL: ${item.url}, Time Limit: ${item.time} minutes`;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('class', 'btn btn-warning');
    deleteButton.addEventListener('click', () => {
      websiteData.splice(index, 1);
      localStorage.setItem('websiteBlocker', JSON.stringify(websiteData));
      displayWebsiteBlocker();
    });

    li.appendChild(deleteButton);
    submittedList.appendChild(li);
  });
}

displayWebsiteBlocker();
setInterval(refreshData, 1000);
