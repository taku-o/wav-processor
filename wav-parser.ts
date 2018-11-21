// vim:set sts=2 ts=2 st=2 :
import * as fs from 'fs';

function split2c(chars) {
  const result = [];
  result.push(chars.substr(0, 2));
    console.log(String.fromCharCode(0x52));
  if (chars.substr(2) != '') {
    const rest = split2c(chars.substr(2));
    result.concat(rest);
  }
  return result;
}

function toAscii(num) {
  let result = '';
  const ars = split2c(num);
  for (let num of ars) {
    const c = String.fromCharCode(num);
    result += c;
  }
  return result;
}

fs.readFile('sample.wav', 'binary', (err, content) => {
  if (err) {
    console.error(err); return;
  }

  let offset = 0;
  let buffer = new Buffer(content, 'binary');

  // 1-4 Chunk ID "RIFF"
  console.log('1-4 Chunk ID "RIFF"');
  let d = buffer.readUIntBE(offset, 4);
  console.log(toAscii(d.toString(16)));
  offset += 4;
  // 5-8 Chunk Size
  console.log('5-8 Chunk Size');
  d = buffer.readUIntLE(offset, 4);
  console.log(d.toString(16));
  offset += 4;
  // 9-12  Format "WAVE"
  console.log('9-12  Format "WAVE"');
  d = buffer.readUIntBE(offset, 4);
  console.log(d.toString(16));
  offset += 4;
  // 13-16 Subchunk1 ID "fmt"
  console.log('13-16 Subchunk1 ID "fmt"');
  d = buffer.readUIntBE(offset, 3);
  console.log(d.toString(16));
  offset += 3;
  // 17-20 Subchunk1 Size
  console.log('17-20 Subchunk1 Size');
  d = buffer.readUIntLE(offset, 4);
  console.log(d.toString(16));
  offset += 4;
  // 21-22 Audio Format "1"
  console.log('21-22 Audio Format "1"');
  d = buffer.readUIntBE(offset, 2);
  console.log(d.toString(16));
  offset += 2;
  // 23-24 Num Channels
  console.log('23-24 Num Channels');
  d = buffer.readUIntBE(offset, 2);
  console.log(d.toString(16));
  offset += 2;
  // 25-28 Sample Rate
  console.log('25-28 Sample Rate');
  d = buffer.readUIntLE(offset, 4);
  console.log(d.toString(16));
  offset += 4;
  // 29-32 Byte Rate
  console.log('29-32 Byte Rate');
  d = buffer.readUIntLE(offset, 4);
  console.log(d.toString(16));
  offset += 4;
  // 33-34 Block Align
  console.log('33-34 Block Align');
  d = buffer.readUIntBE(offset, 2);
  console.log(d.toString(16));
  offset += 2;
  // 35-36 Bits Per Sample
  console.log('35-36 Bits Per Sample');
  d = buffer.readUIntLE(offset, 2);
  console.log(d.toString(16));
  offset += 2;
  // 37-40 Subchunk2 ID "data"
  console.log('37-40 Subchunk2 ID "data"');
  d = buffer.readUIntBE(offset, 4);
  console.log(d.toString(16));
  offset += 4;
  // 41-44 Subchunk2 Size
  console.log('41-44 Subchunk2 Size');
  d = buffer.readUIntLE(offset, 4);
  console.log(d.toString(16));
  offset += 4;
  // 45-   Subchunk2 data

});

