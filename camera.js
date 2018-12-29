const gphoto2 = require('gphoto2');

class Camera {
  constructor() {
    this.GPhoto = new gphoto2.GPhoto2();
    this.GPhoto.setLogLevel(3);
  }

  initialize() {
    return new Promise((resolve, reject) => {
      this.GPhoto.list((list) => {
        if (!list.length) {
          reject('No camera found');
        } else {
          this.camera = list[0];

          resolve();
        }
      });
    });
  }

  configure(key, value) {
    return new Promise((resolve, reject) => {
      this.camera.setConfigValue(key, value, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  takePicture(opts = { download: true }) {
    return new Promise((resolve, reject) => {
      this.camera.takePicture(opts, function(err, data) {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }

  get info() {
    return this.camera.model;
  }
}

module.exports = Camera;
