const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*"
    }
});

app.use(cors());
app.use(express.json());

// Serve website files
app.use(express.static(path.join(__dirname, "../website")));

let sensorData = {
    temperature: 0,
    humidity: 0,
    aqi: 0,
    status: "Waiting..."
};

// ESP32 sends data here
app.post("/data", (req, res) => {

    sensorData = req.body;

    console.log("New Data:", sensorData);

    io.emit("sensorData", sensorData);

    res.sendStatus(200);
});

// Send latest data when a client connects
io.on("connection", (socket) => {

    console.log("Website Connected");

    socket.emit("sensorData", sensorData);

    socket.on("disconnect", () => {
        console.log("Website Disconnected");
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log("=================================");
    console.log("Server Running");
    console.log(`Port: ${PORT}`);
    console.log("=================================");
});
