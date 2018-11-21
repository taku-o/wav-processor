// vim:set sts=2 ts=2 st=2 :
import * as fs from 'fs';
const cTable = require('console.table');

fs.readFile('sample.wav', 'binary', (err, content) => {
  if (err) {
    console.error(err); return;
  }

  let offset = 0;
  let d = null;
  let data:any = null;
  const tables = [];
  let buffer = Buffer.from(content, 'binary');

  // 1-4 Chunk ID "RIFF"
  d = buffer.readUIntBE(offset, 4);
  data = Buffer.from(d.toString(16), 'hex').toString();
  offset += 4;
  tables.push({ position: '1-4', header: 'Chunk ID "RIFF"', data: data, });

  // 5-8 Chunk Size
  d = buffer.readUIntLE(offset, 4);
  data = d;
  offset += 4;
  tables.push({ position: '5-8', header: 'Chunk Size', data: data, });

  // 9-12  Format "WAVE"
  d = buffer.readUIntBE(offset, 4);
  data = Buffer.from(d.toString(16), 'hex').toString();
  offset += 4;
  tables.push({ position: '9-12', header: 'Format "WAVE"', data: data, });

  // 13-16 Subchunk1 ID "fmt"
  d = buffer.readUIntBE(offset, 4);
  data = Buffer.from(d.toString(16), 'hex').toString();
  offset += 4;
  tables.push({ position: '13-16', header: 'Subchunk1 ID "fmt "', data: data, });

  // 17-20 Subchunk1 Size "16"
  d = buffer.readUIntLE(offset, 4);
  data = d;
  offset += 4;
  tables.push({ position: '17-20', header: 'Subchunk1 Size', data: data, });

  // 21-22 Audio Format "1"
  d = buffer.readUIntLE(offset, 2);
  data = d;
  offset += 2;
  tables.push({ position: '21-22', header: 'Audio Format "1" PCM', data: data, });

  // 23-24 Num Channels
  d = buffer.readUIntLE(offset, 2);
  data = d;
  offset += 2;
  tables.push({ position: '23-24', header: 'Num Channels', data: data, });

  // 25-28 Sample Rate
  d = buffer.readUIntLE(offset, 4);
  data = d;
  offset += 4;
  tables.push({ position: '25-28', header: 'Sample Rate', data: data, });

  // 29-32 Byte Rate
  d = buffer.readUIntLE(offset, 4);
  data = d;
  offset += 4;
  tables.push({ position: '29-32', header: 'Byte Rate', data: data, });

  // 33-34 Block Align
  d = buffer.readUIntLE(offset, 2);
  data = d;
  offset += 2;
  tables.push({ position: '33-34', header: 'Block Align', data: data, });

  // 35-36 Bits Per Sample
  d = buffer.readUIntLE(offset, 2);
  data = d;
  offset += 2;
  tables.push({ position: '35-36', header: 'Bits Per Sample', data: data, });

  // 37-40 Subchunk2 ID "data"
  d = buffer.readUIntBE(offset, 4);
  data = Buffer.from(d.toString(16), 'hex').toString();
  offset += 4;
  tables.push({ position: '37-40', header: 'Subchunk2 ID "data"', data: data, });

  // 41-44 Subchunk2 Size
  d = buffer.readUIntLE(offset, 4);
  data = d;
  offset += 4;
  tables.push({ position: '41-44', header: 'Subchunk2 Size', data: data, });

  // 45-   Subchunk2 data

  console.table(tables);
});

