// backend/models/Camera.js
const db = require('../db');

class Camera {
  static all(callback) {
    db.all('SELECT * FROM cameras', callback);
  }

  static find(id, callback) {
    db.get('SELECT * FROM cameras WHERE id = ?', [id], callback);
  }

  static create(camera, callback) {
    const { x, y, drawing, floor, switchName, port, cabinetName, ipAddress, vlan } = camera;
    db.run(`
      INSERT INTO cameras (x, y, drawing, floor, switchName, port, cabinetName, ipAddress, vlan)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [x, y, drawing, floor, switchName, port, cabinetName, ipAddress, vlan], callback);
  }

  static update(id, camera, callback) {
    const { x, y, drawing, floor, switchName, port, cabinetName, ipAddress, vlan } = camera;
    db.run(`
      UPDATE cameras SET x = ?, y = ?, drawing = ?, floor = ?, switchName = ?, port = ?, cabinetName = ?, ipAddress = ?, vlan = ?
      WHERE id = ?`,
      [x, y, drawing, floor, switchName, port, cabinetName, ipAddress, vlan, id], callback);
  }

  static delete(id, callback) {
    db.run('DELETE FROM cameras WHERE id = ?', [id], callback);
  }
}

module.exports = Camera;
