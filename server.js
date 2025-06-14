const express = require('express');
const routes = require("./routes")

// Remove commenst as feature is added(but they are already in package.json)
// const bodyParser = require('body-parser');
// const cors = require('cors');
const db = require('./config/db');
require('dotenv').config();

const app = express();


// Connect to MongoDB
db.connectDB();

// Middleware
// app.use();

// Routes 
app.use("/", routes)


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
