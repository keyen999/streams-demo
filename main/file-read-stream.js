'use strict';

const {Readable} = require('stream');
const fs = require('./fs-promise');

module.exports = function (path) {
  const open = fs.open(path, 'r');
  let position = 0;

  const shrinkIfNeeded = function (buffer, targetLength) {
    if (buffer.length > targetLength) {
      const tmp = Buffer.alloc(targetLength);
      buffer.copy(tmp, 0, 0, targetLength);
      return tmp;
    } else {
      return buffer;
    }
  };

  return new Readable({
    async read(size) {
      try {
        const file = await open;
        const res = await file.read(Buffer.alloc(size), 0, size, position);
        position += res.bytesRead;
        if (res.bytesRead > 0) {
          res.buffer = shrinkIfNeeded(res.buffer, res.bytesRead);
          this.push(res.buffer);
        } else {
          await file.close();
          this.push(null);
        }
      } catch (error) {
        process.nextTick(() => this.emit('error', error));
      }
    }
  });
};
