// vim:set sts=2 ts=2 st=2 :
import * as fs from 'fs';
import {Riff} from './riff';
const cTable = require('console.table');

// params
const args = process.argv.slice(2);
if (args.length < 1) {
  process.exit(1);
}
const wavFile = args[0];

fs.readFile(wavFile, 'binary', (err, content) => {
  if (err) {
    console.error(err); return;
  }

  let buffer = Buffer.from(content, 'binary');
  let chunk = Riff.from(buffer);
  console.table(chunk.printTable(0));
});

