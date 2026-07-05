// ===========================================
// AIR QUALITY DASHBOARD
// PART 1
// ===========================================

// Socket.IO
const socket = io("http://localhost:3000");;

// Sensor Card Elements
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const aqi = document.getElementById("aqi");
const status = document.getElementById("status");

// Gauge
const gaugeValue = document.getElementById("gaugeValue");
const gaugeText = document.getElementById("gaugeText");

// Time
const liveTime = document.getElementById("liveTime");
const lastUpdate = document.getElementById("lastUpdate");

// Maximum Points
const MAX_POINTS = 20;

// Arrays
const labels = [];

const tempData = [];
const humidityData = [];
const aqiData = [];

// ===========================================
// LIVE CLOCK
// ===========================================

setInterval(() => {

    const now = new Date();

    liveTime.innerHTML = now.toLocaleTimeString();

},1000);

// ===========================================
// TEMPERATURE CHART
// ===========================================

const tempChart = new Chart(
document.getElementById("tempChart"),
{

type:"line",

data:{

labels:labels,

datasets:[{

label:"Temperature",

data:tempData,

borderColor:"#ff6b6b",

backgroundColor:"rgba(255,107,107,.15)",

fill:true,

tension:.4,

borderWidth:3

}]

},

options:{

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{
display:false
}

},

scales:{

x:{
ticks:{color:"#ffffff"}
},

y:{
ticks:{color:"#ffffff"}
}

}

}

});

// ===========================================
// HUMIDITY CHART
// ===========================================

const humidityChart = new Chart(
document.getElementById("humidityChart"),
{

type:"line",

data:{

labels:labels,

datasets:[{

label:"Humidity",

data:humidityData,

borderColor:"#4dabf7",

backgroundColor:"rgba(77,171,247,.15)",

fill:true,

tension:.4,

borderWidth:3

}]

},

options:{

responsive:true,

maintainAspectRatio:false,

plugins:{
legend:{
display:false
}
},

scales:{

x:{
ticks:{color:"#ffffff"}
},

y:{
ticks:{color:"#ffffff"}
}

}

}

});

// ===========================================
// AQI CHART
// ===========================================

const aqiChart = new Chart(
document.getElementById("aqiChart"),
{

type:"line",

data:{

labels:labels,

datasets:[{

label:"AQI",

data:aqiData,

borderColor:"#22c55e",

backgroundColor:"rgba(34,197,94,.15)",

fill:true,

tension:.4,

borderWidth:3

}]

},

options:{

responsive:true,

maintainAspectRatio:false,

plugins:{

legend:{
display:false
}

},

scales:{

x:{
ticks:{color:"#ffffff"}
},

y:{
ticks:{color:"#ffffff"}
}

}

}

});
// ===========================================
// PART 2
// SOCKET.IO LIVE DATA
// ===========================================

socket.on("sensorData", (data) => {

    console.log("New Data:", data);

    // ===============================
    // Update Cards
    // ===============================

    temperature.innerHTML = Number(data.temperature).toFixed(1);

    humidity.innerHTML = Number(data.humidity).toFixed(1);

    aqi.innerHTML = data.aqi;

    status.innerHTML = data.status;

    gaugeValue.innerHTML = data.aqi;

    gaugeText.innerHTML = data.status;

    // ===============================
    // AQI Status Color
    // ===============================

    status.className = "";

    gaugeText.className = "";

    let gaugeColor = "#22c55e";

    if(data.status === "Good"){

        status.classList.add("good");

        gaugeText.classList.add("good");

        gaugeColor = "#22c55e";

    }

    else if(data.status === "Moderate"){

        status.classList.add("moderate");

        gaugeText.classList.add("moderate");

        gaugeColor = "#facc15";

    }

    else if(data.status === "Bad"){

        status.classList.add("bad");

        gaugeText.classList.add("bad");

        gaugeColor = "#fb923c";

    }

    else{

        status.classList.add("danger");

        gaugeText.classList.add("danger");

        gaugeColor = "#ef4444";

    }

    // ===============================
    // Update AQI Gauge
    // ===============================

    let degree = (Number(data.aqi) / 200) * 360;

    document.getElementById("gaugeCircle").style.background =
        `conic-gradient(${gaugeColor} ${degree}deg,
        rgba(255,255,255,.08) ${degree}deg)`;

    // ===============================
    // Last Updated
    // ===============================

    lastUpdate.innerHTML = new Date().toLocaleTimeString();

    // ===============================
    // Store Chart Data
    // ===============================

    labels.push("");

    tempData.push(Number(data.temperature));

    humidityData.push(Number(data.humidity));

    aqiData.push(Number(data.aqi));

    // ===============================
    // Keep only last 20 readings
    // ===============================

    if(labels.length > MAX_POINTS){

        labels.shift();

        tempData.shift();

        humidityData.shift();

        aqiData.shift();

    }

    // ===============================
    // Refresh Charts
    // ===============================

    tempChart.update();

    humidityChart.update();

    aqiChart.update();

});
// ===========================================
// PART 3
// DOWNLOAD CSV + CONNECTION STATUS
// ===========================================

// Store all received data
const csvData = [];

// Save every reading
socket.on("sensorData", (data) => {

    csvData.push({
        Time: new Date().toLocaleTimeString(),
        Temperature: Number(data.temperature).toFixed(1),
        Humidity: Number(data.humidity).toFixed(1),
        AQI: data.aqi,
        Status: data.status
    });

});

// ===========================================
// DOWNLOAD CSV
// ===========================================

document
.getElementById("downloadCSV")
.addEventListener("click", () => {

    let csv =
        "Time,Temperature (°C),Humidity (%),AQI,Status\n";

    csvData.forEach(row => {

        csv += `${row.Time},${row.Temperature},${row.Humidity},${row.AQI},${row.Status}\n`;

    });

    const blob = new Blob([csv], {
        type: "text/csv"
    });

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "AirQualityData.csv";

    a.click();

    window.URL.revokeObjectURL(url);

});

// ===========================================
// CONNECTION STATUS
// ===========================================

socket.on("connect", () => {

    console.log("Socket Connected");

});

socket.on("disconnect", () => {

    console.log("Socket Disconnected");

});

// ===========================================
// CARD ANIMATION
// ===========================================

function animateValue(element){

    element.style.transform="scale(1.08)";

    setTimeout(()=>{

        element.style.transform="scale(1)";

    },250);

}

socket.on("sensorData",(data)=>{

    animateValue(temperature);

    animateValue(humidity);

    animateValue(aqi);

    animateValue(status);

});

// ===========================================
// CHART ANIMATION
// ===========================================

Chart.defaults.animation.duration = 900;

Chart.defaults.animation.easing = "easeOutQuart";

// ===========================================
// TOOLTIP STYLE
// ===========================================

Chart.defaults.plugins.tooltip.backgroundColor="#1e293b";

Chart.defaults.plugins.tooltip.titleColor="#ffffff";

Chart.defaults.plugins.tooltip.bodyColor="#ffffff";

Chart.defaults.plugins.tooltip.borderColor="#38bdf8";

Chart.defaults.plugins.tooltip.borderWidth=1;

// ===========================================
// GRID COLOR
// ===========================================

Chart.defaults.scale.grid.color="rgba(255,255,255,.08)";

// ===========================================
// CHART FONT
// ===========================================

Chart.defaults.font.family="Poppins";

// ===========================================
// END
// ===========================================