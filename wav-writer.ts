// vim:set sts=2 ts=2 st=2 :
import * as fs from 'fs';
import {Riff} from './riff';
const cTable = require('console.table');

fs.readFile('sample.wav', 'binary', (err, content) => {
  if (err) {
    console.error(err); return;
  }

  // read
  let buffer = Buffer.from(content, 'binary');
  let riff = Riff.from(buffer);
  console.table(riff.printTable(0));
  console.log('----------------------------------------');

  // write
  let wbuffer = Buffer.alloc(riff.chunkLength);
  riff.write(wbuffer);
  fs.writeFile('sample-out.wav', wbuffer, 'binary', (err) => {
    if (err) {
      console.error(err); return;
    }
    console.log('write done.');
  });
});

