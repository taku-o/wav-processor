interface Chunk {
  chunkLength: number;
  readonly id: string;
  size: number;
  printTable(offset: number): any;
  //write(buffer: Buffer): void;
}

export class Riff implements Chunk {
  chunkLength: number;
  readonly id: string     = 'RIFF';
  size: number;
  readonly format: string = 'WAVE';
  subChunks: Chunk[]      = [];

  constructor() {}
  static isChunk(buffer: Buffer) {
    const id = buffer.readUIntBE(0, 4);
    const idName = Buffer.from(id.toString(16), 'hex').toString();
    return idName == 'RIFF';
  }
  static from(buffer: Buffer) {
    const chunk = new Riff();
    // 1-4 Chunk ID "RIFF"
    // 5-8 Chunk Size
    chunk.size = buffer.readUIntLE(4, 4);
    chunk.chunkLength = chunk.size + 8;
    // 9-12  Format "WAVE"
    // 13-   SubChunks
    let pos = 12;
    while (pos < chunk.chunkLength) {
      if (Fmt.isChunk(buffer.slice(pos))) {
        const sub = Fmt.from(buffer.slice(pos));
        chunk.subChunks.push(sub);
        pos += sub.chunkLength;
        continue;
      } else if (WavData.isChunk(buffer.slice(pos))) {
        const sub = WavData.from(buffer.slice(pos));
        chunk.subChunks.push(sub);
        pos += sub.chunkLength;
        continue;
      } else {
        break;
      }
    }
    // return
    return chunk;
  }
  printTable(offset: number): any {
    let tables = [];
    tables.push({ position: offset,   length: 4, header: 'Chunk ID "RIFF"', data: this.id, });
    tables.push({ position: offset+4, length: 4, header: 'Chunk Size',      data: this.size, });
    tables.push({ position: offset+8, length: 4, header: 'Format "WAVE"',   data: this.format, });

    offset = 12;
    for (let chunk of this.subChunks) {
      let tableInfos = chunk.printTable(offset = 0);
      tables = tables.concat(tableInfos);
      offset += chunk.chunkLength;
    }
    return tables;
  }
}

class Fmt implements Chunk {
  readonly chunkLength: number = 24;
  readonly id: string          = 'fmt ';
  readonly size: number        = 16;
  readonly audioFormat: number = 1;
  numChannels: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: number;

  constructor() {}
  static isChunk(buffer: Buffer) {
    const id = buffer.readUIntBE(0, 4);
    const idName = Buffer.from(id.toString(16), 'hex').toString();
    return idName == 'fmt ';
  }
  static from(buffer: Buffer) {
    const chunk = new Fmt();
    // 1-4 Subchunk1 ID "fmt"
    // 5-8 Subchunk1 Size "16"
    // 9-10 Audio Format "1"
    // 11-12 Num Channels
    chunk.numChannels = buffer.readUIntLE(10, 2);
    // 13-16 Sample Rate
    chunk.sampleRate = buffer.readUIntLE(12, 4);
    // 17-20 Byte Rate
    chunk.byteRate = buffer.readUIntLE(16, 4);
    // 21-22 Block Align
    chunk.blockAlign = buffer.readUIntLE(20, 2);
    // 23-24 Bits Per Sample
    chunk.bitsPerSample = buffer.readUIntLE(22, 2);
    // return
    return chunk;
  }
  printTable(offset: number): any {
    let tables = [];
    tables.push({ position: offset,    length: 4, header: 'Subchunk1 ID "fmt "',  data: this.id, });
    tables.push({ position: offset+4,  length: 4, header: 'Subchunk1 Size',       data: this.size, });
    tables.push({ position: offset+8,  length: 2, header: 'Audio Format "1" PCM', data: this.audioFormat, });
    tables.push({ position: offset+10, length: 2, header: 'Num Channels',         data: this.numChannels, });
    tables.push({ position: offset+12, length: 4, header: 'Sample Rate',          data: this.sampleRate, });
    tables.push({ position: offset+16, length: 4, header: 'Byte Rate',            data: this.byteRate, });
    tables.push({ position: offset+20, length: 2, header: 'Block Align',          data: this.blockAlign, });
    tables.push({ position: offset+22, length: 2, header: 'Bits Per Sample',      data: this.bitsPerSample, });
    return tables;
  }
}

class WavData implements Chunk {
  chunkLength: number;
  readonly id: string = 'data';
  size: number;
  wavBuffer: Buffer;

  constructor() {}
  static isChunk(buffer: Buffer) {
    const id = buffer.readUIntBE(0, 4);
    const idName = Buffer.from(id.toString(16), 'hex').toString();
    return idName == 'data';
  }
  static from(buffer: Buffer) {
    const chunk = new WavData();
    // 1-4 Subchunk2 ID "data"
    // 5-8 Subchunk2 Size
    chunk.size = buffer.readUIntLE(4, 4);
    chunk.chunkLength = chunk.size + 8;
    // 9-   Subchunk2 data
    chunk.wavBuffer = buffer.slice(8, chunk.size);
    // return
    return chunk;
  }
  printTable(offset: number): any {
    let tables = [];
    tables.push({ position: offset,    length: 4,         header: 'Subchunk2 ID "data"', data: this.id, });
    tables.push({ position: offset+4,  length: 4,         header: 'Subchunk2 Size',      data: this.size, });
    tables.push({ position: offset+8,  length: this.size, header: 'Wave Data',           data: '******', });
    return tables;
  }
}

