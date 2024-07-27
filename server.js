// server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cameraRoutes = require('./backend/routes/camera');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Используйте маршруты для камер
app.use('/cameras', cameraRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
