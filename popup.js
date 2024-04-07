let data;

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
     // activityList.append(colorbox);
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

// function refreshData() {
//   chrome.storage.local.get({ "data": [] }, function (result) {
//     const storedData = result.data;
//     drawPieChartFromArray(storedData);
//     const activityTable = document.getElementById('activityTable');

//     // Clear the table body
//     activityTable.innerHTML = '';

//     storedData.forEach(entry => {
//       const row = activityTable.insertRow(); // Create a new row

//       // Create cell for domain
//       const domainCell = row.insertCell();
//       domainCell.textContent = entry.domain || "chrome";
//       domainCell.classList.add('domain-cell'); // Add class name

//       // Create cell for time
//       const timeCell = row.insertCell();
//       timeCell.textContent = formatTime(entry.time);
//       timeCell.classList.add('time-cell'); // Add class name

//       // Create cell for color box
//       const colorCell = row.insertCell();
//       const colorBox = document.createElement('span');
//       colorBox.style.width = "20px";
//       colorBox.style.height = "20px";
//       colorBox.style.backgroundColor = entry.color;
//       colorBox.classList.add('color-box'); // Add class name
//       colorCell.appendChild(colorBox);
//     });
//   });
// }



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
  console.log("draw pie Chart");
  console.log(data);
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

// Example data in the array format
const sampleDataArray = [
  { color: '#718D0E', domain: 'www.youtube.com', time: 701675 },
  { color: '#A3A7E7', domain: null, time: 342874 },
  { color: '#2B55F4', domain: 'chat.openai.com', time: 101561 }
];





