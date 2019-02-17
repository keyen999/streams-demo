'use strict';

const fileReadStream = require('../main/file-read-stream');
const fs = require('../main/fs-promise');
const {Writable} = require('stream');

const testFile = 'test.txt';

describe('FileReadStream', () => {

  const createSpyWriteStream = () => new Writable({
    write(chunk, encoding, callback) {
      this.result = (this.result) ? this.result + chunk.toString() : chunk.toString();
      callback();
    }
  });

  const writeTestFile = async (content) => {
    const file = await fs.open(testFile, 'w');
    const buffer = Buffer.from(content);
    await file.write(buffer, 0, buffer.length);
    await file.close();
  };

  const generateContent = (pattern, repetitions) => {
    let content = '';
    for (let i = 0; i < repetitions; i++) {
      content += pattern;
    }
    return content;
  };

  afterEach(async () => {
      await fs.unlink(testFile);
  });

  it('throws an error if the file does not exist', async () => {
    const spyWriteStream = createSpyWriteStream();
    
    const error = await new Promise((resolve, reject) => {
      fileReadStream(testFile).on('error', (err) => {
        // console.error(err);
        resolve(err);
      }).pipe(spyWriteStream).on('finish', () => {
        reject(new Error('file could be read, this should not happen'));
      });
    });

    expect(error.code).toBe('ENOENT');

    await writeTestFile(''); //just so that the teardown doesn't fail
  });

  it('can read short files', async () => {
    await writeTestFile('hello world');
    const spyWriteStream = createSpyWriteStream();
    
    const result = await new Promise((resolve, reject) => {
      fileReadStream(testFile).on('error', (error) => {
        reject(error);
      }).pipe(spyWriteStream).on('finish', () => {
        resolve(spyWriteStream.result);
      });
    });

    expect(result).toBe('hello world');
  });

  it('can read long files', async () => {
    await writeTestFile(generateContent('hello world\n', 2000));
    const spyWriteStream = createSpyWriteStream();
    
    const result = await new Promise((resolve, reject) => {
      fileReadStream(testFile).on('error', (error) => {
        reject(error);
      }).pipe(spyWriteStream).on('finish', () => {
        resolve(spyWriteStream.result);
      });
    });

    expect(result).toBe(require('fs').readFileSync(testFile).toString());
    expect(result.length).toBe(24000);
  });
});
