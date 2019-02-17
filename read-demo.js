'use strict';

if (!process.argv[2]) {
  console.error('Error: file not specified. Hint: run `npm run generate` first.');
  process.exitCode = 1;
} else {    
  const FileReadStream = require('./main/file-read-stream');
  new FileReadStream(process.argv[2]).pipe(process.stdout);
}
