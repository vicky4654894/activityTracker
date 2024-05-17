let data;
document.getElementById('pauseButton').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: 'pause' });
});

document.getElementById('resumeButton').addEventListener('click', function () {
  chrome.runtime.sendMessage({ action: 'resume' });
});

// Open a popup window with specified width and height
document.addEventListener('DOMContentLoaded', function () {
  const port = chrome.runtime.connect({ name: 'popup' });

  refreshData();

  const intervalId = setInterval(refreshData, 1000);
  window.addEventListener('beforeunload', function () {
    clearInterval(intervalId);
    port.postMessage({ action: 'popupClosed' });
  });
});

function refreshData() {
  chrome.runtime.sendMessage({action:localStorage.getItem("websiteBlocker")});
  chrome.storage.local.get({ "data": [] }, function (result) {
    const storedData = result.data;
    
    drawPieChartFromArray(storedData);
    const activityList = document.getElementById('activityList');

    activityList.innerHTML = '';

    storedData.forEach(entry => {
      const listItem = document.createElement('li'); 
      const colorbox = document.createElement('span');
      colorbox.style.width="20px";
      colorbox.style.height="20px";

      if(entry.domain == null){
        entry.domain="chrome";
      }
      listItem.textContent = `Domain: ${entry.domain}, Time: ${formatTime(entry.time)}`;
     
      colorbox.style.backgroundColor=entry.color;
      colorbox.textContent =`${entry.color}`
      listItem.style.backgroundColor=entry.color;
      activityList.appendChild(listItem);
      
    });

    // Generate data for pie chart
    const domainData = {}; // Object to store domain data for the chart
    storedData.forEach(entry => {
      if (entry.domain in domainData) {
        domainData[entry.domain] += entry.time;
      } else {
        domainData[entry.domain] = entry.time;
      }
    });

    const currentTimeElement = document.getElementById('currentTime');
    currentTimeElement.textContent = `Current Time: ${getCurrentTime()}`;
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

function drawPieChartFromArray(data) {
  // console.log("Data = ",data);
  const canvas = document.getElementById('myPieChart');
  const ctx = canvas.getContext('2d');

  // Calculate the total time for all domains
  const total = data.reduce((acc, obj) => acc + obj.time, 0);

  // Initialize the starting angle
  let startAngle = -Math.PI / 2; // Start from the top (12 o'clock position)

  // Draw each slice of the pie chart
  for (const obj of data) {
    const sliceAngle = (obj.time / total) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2); // Center of the canvas
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.height / 3, startAngle, startAngle + sliceAngle);
    ctx.fillStyle = obj.color; // Set the color from the data object
    ctx.fill();

    // Update the starting angle for the next slice
    startAngle += sliceAngle;

  }
}

document.getElementById('timeLimitForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const websiteUrl = document.getElementById('websiteUrl').value;
  const timeLimit = parseInt(document.getElementById('timeLimit').value);
  let websiteData = JSON.parse(localStorage.getItem("websiteBlocker"));

  // Ensure that websiteData is an array
  if (websiteData===null) {
    websiteData = [];
  }
  websiteData.push({ url: websiteUrl, time: timeLimit });
  localStorage.setItem("websiteBlocker", JSON.stringify(websiteData));
  displayWebsiteBlocker();
});

function displayWebsiteBlocker(){
  const submittedList = document.querySelector('.submittedList');
  submittedList.innerHTML = ''; // Clear previous content
  
  // Retrieve website blocker data from local storage
  const websiteData = JSON.parse(localStorage.getItem("websiteBlocker")) || [];

  // Iterate over the websiteData and create list items to display each entry
  websiteData.forEach((item, index) => {
    const li = document.createElement('li');
    li.setAttribute( 'class', 'd-flex justify-content-between p-1' );
    li.textContent = `URL: ${item.url}, Time Limit: ${item.time} minutes`;
    
    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.setAttribute('class','btn btn-warning')
    deleteButton.addEventListener('click', () => {
      // Remove item from websiteData array
      websiteData.splice(index, 1);
      // Update local storage
      
      localStorage.setItem('websiteBlocker', JSON.stringify(websiteData));
      displayWebsiteBlocker();
    });

    // Append delete button to list item
    li.appendChild(deleteButton);
    // Append list item to UL
    submittedList.appendChild(li);
  });
}

displayWebsiteBlocker();
