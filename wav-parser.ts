// vim:set sts=2 ts=2 st=2 :
import * as fs from 'fs';
import {Riff} from './riff';
const cTable = require('console.table');

fs.readFile('sample.wav', 'binary', (err, content) => {
  if (err) {
    console.error(err); return;
  }

  let buffer = Buffer.from(content, 'binary');
  let chunk = Riff.from(buffer, 0);
  console.table(chunk.printTable(0));
});

