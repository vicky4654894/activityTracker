function getAndProcessTotalTimeKeys() {
    const keys = Object.keys(localStorage); // Get all keys from localStorage
    const totalTimeKeys = keys.filter(key => key.includes('totalTime')); // Filter keys that include "totalTime"
    
    // Create a new array with "totalTime" removed from each key
    const processedKeys = totalTimeKeys.map(key => key.replace('totalTime', ''));

    return processedKeys; // Return the array of processed keys
}

function showChart(processedKeys) {
    console.log("calling");

    // Initialize arrays for chart data
    let labels = [];
    let backgroundColor = [];
    let data = [];

    // Loop through each processed key to retrieve and process data
    processedKeys.forEach(key => {
        let fullKey = `totalTime${key}`;
        let strData = localStorage.getItem(fullKey);

        if (strData) {
            let timeInMilliseconds = Number(strData); // Convert string to number
            labels.push(key); // Use the processed key as the label
            backgroundColor.push(getRandomColor()); // Generate a random color for each entry
            data.push(timeInMilliseconds / 1000); // Convert time to seconds
        }
    });

    // Create a Pie Chart
    const pieChart = new Chart("myPieChart", {
        type: "doughnut",
        data: {
            labels: labels,
            datasets: [{
                backgroundColor: backgroundColor,
                data: data,
            }],
        },
        options: {
            title: {
                display: true,
                text: "Website Traffic Distribution",
            },
        },
    });

    // Create a Bar Chart
    const barChart = new Chart("myBarChart", {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Total Time (seconds)",
                backgroundColor: backgroundColor,
                data: data,
            }],
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                    },
                }],
            },
            title: {
                display: true,
                text: "Total Time Distribution",
            },
        },
    });
}

// Function to generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Example usage
const processedKeys = getAndProcessTotalTimeKeys();
showChart(processedKeys);
