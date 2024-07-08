const express = require('express');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cors = require('cors');
const config = require('config');

const app = express();
app.use(cors());

// const options = {
//     key: fs.readFileSync("/var/www/html/backend/certificate/_.protomock.com_private_key.key"),
//     cert: fs.readFileSync("/var/www/html/backend/certificate/solved-trust-chain.crt")
// };

// Connect Database
connectDB();

// Init Middleware
app.use(express.json());

// Define Routes
app.use('/api/users', require('./routes/api/users'));
app.use('/api/auth', require('./routes/api/auth'));
app.use('/api/traits', require('./routes/api/twm'));
app.use('/api/treasury', require('./routes/api/treasury'));

const PORT = process.env.PORT || 5000;
const http = require("http");
const server = http.createServer(
    app);

const io = require("socket.io")(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

//https.createServer(options, app).listen(PORT, () => console.log(`WatchMaker app listening on port ${PORT}!`));
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));