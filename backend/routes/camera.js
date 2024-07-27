// backend/routes/camera.js
const express = require('express');
const router = express.Router();
const Camera = require('../models/Camera');

// Получение всех камер
router.get('/', (req, res) => {
  Camera.all((err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Добавление новой камеры
router.post('/', (req, res) => {
  const camera = req.body;
  Camera.create(camera, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(201).json(camera);
    }
  });
});

// Обновление информации о камере
router.put('/:id', (req, res) => {
  const id = req.params.id;
  const camera = req.body;
  Camera.update(id, camera, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(camera);
    }
  });
});

// Удаление камеры
router.delete('/:id', (req, res) => {
  const id = req.params.id;
  Camera.delete(id, (err) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Camera deleted' });
    }
  });
});

module.exports = router;
