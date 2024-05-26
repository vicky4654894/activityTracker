function formatDate(date) {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = String(date.getDate()).padStart(2, "0");
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function showChart(inputDate) {
    console.log("calling");
    let date = inputDate;
    let dateShow = document.getElementById('todayDate');
    dateShow.innerHTML = date.replace('data ', '');
    let labels = [];
    let backgroundColor = [];
    let data = [];
    let strData = localStorage.getItem(date);
    let dataStored = JSON.parse(strData);
    if (dataStored) {
        dataStored.forEach((item) => {
            labels.push(item.domain);
            backgroundColor.push(item.color);
            data.push(item.time / 1000);
        });
        // Pie Chart
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

        // Bar Chart
        const barChart = new Chart("myBarChart", {
            type: "bar",
            data: {
                labels: labels,
                datasets: [{
                    label: "Average Time (seconds)",
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
                    text: "Average Response Time",
                },
            },
        });
    }
}

function getLocalStorageKeys() {
    return Object.keys(localStorage);
}

function isValidDateKey(key) {
    const datePattern = /^data \d{2}-[A-Za-z]{3}-\d{4}$/;
    return datePattern.test(key);
}

function extractDateFromKey(key) {
    
    return key.replace(/^data /, '');
}

function populateDropdown() {
    let keys = getLocalStorageKeys();
    keys = keys.sort();
    keys= keys.reverse();
    let dropdown = document.getElementById('keysDropdown');

    keys.forEach(key => {
        if (isValidDateKey(key)) {
            let dateKey = extractDateFromKey(key);
            let option = document.createElement('option');
            option.value = dateKey;
            option.textContent = dateKey;
            dropdown.appendChild(option);
        }
    });

    dropdown.addEventListener('change', function(event) {
        let selectedValue = event.target.value;
        let prefixedValue = "data " + selectedValue;
        showChart(prefixedValue);
    });
}

document.addEventListener("DOMContentLoaded", function(event) {
    let today = new Date();
    let formattedToday = "data " + formatDate(today);
    showChart(formattedToday);
});

populateDropdown();
