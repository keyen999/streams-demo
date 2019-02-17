'use strict';

const fs = require('fs');

const FileHandle = function (fileDescriptor) {

  this.read = function (buffer, offset, length, position) {
    return new Promise(function (resolve, reject) {
      fs.read(fileDescriptor, buffer, offset, length, position, function (error, bytesRead, readBuffer) {
        if (error) {
          reject(error);
        } else {
          resolve({bytesRead: bytesRead, buffer: readBuffer});
        }
      });
    });
  };

  this.write = function (buffer, offset, length, position) {
    return new Promise(function (resolve, reject) {
      fs.write(fileDescriptor, buffer, offset, length, position, function (error, bytesWritten, writtenBuffer) {
        if (error) {
          reject(error);
        } else {
          resolve({bytesWritten: bytesWritten, buffer: writtenBuffer});
        }
      });
    });
  };

  this.close = function () {
    return new Promise(function (resolve, reject) {
      fs.close(fileDescriptor, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  };
};

const open = function (path, flags, mode) {
  return new Promise(function (resolve, reject) {
    fs.open(path, flags, mode, function (error, fileDescriptor) {
      if (error) {
        reject(error);
      } else {
        resolve(new FileHandle(fileDescriptor));
      }
    });
  });
};

const unlink = function (path) {
  return new Promise((resolve, reject) => {
    fs.unlink(path, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
};

module.exports = {open, unlink};
