interface Chunk {
  readonly id: string;
  size: number;
  printTable(offset: number): any;
}

export class Riff implements Chunk {
  readonly id: string     = 'RIFF';
  size: number;
  readonly format: string = 'WAVE';
  subChunks: Chunk[]      = [];

  constructor() {}
  static isChunk(buffer: Buffer, offset: number) {
    const id = buffer.readUIntBE(offset, 4);
    const idName = Buffer.from(id.toString(16), 'hex').toString();
    return idName == 'RIFF';
  }
  static from(buffer: Buffer, offset: number) {
    const chunk = new Riff();
    // 1-4 Chunk ID "RIFF"
    // 5-8 Chunk Size
    chunk.size = buffer.readUIntLE(offset+4, 4);
    // 9-12  Format "WAVE"
    // 13-   SubChunks
    let pos = 12;
    while (pos < chunk.size + 8) {
      if (Fmt.isChunk(buffer, pos)) {
        const sub = Fmt.from(buffer, pos);
        chunk.subChunks.push(sub);
        pos += 8 + sub.size;
        continue;
      } else if (WavData.isChunk(buffer, pos)) {
        const sub = WavData.from(buffer, pos);
        chunk.subChunks.push(sub);
        pos += 8 + sub.size;
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
      let tableInfos = chunk.printTable(offset);
      tables = tables.concat(tableInfos);
      offset += 8 + chunk.size;
    }
    return tables;
  }
}

class Fmt implements Chunk {
  readonly id: string          = 'fmt ';
  readonly size: number        = 16;
  readonly audioFormat: number = 1;
  numChannels: number;
  sampleRate: number;
  byteRate: number;
  blockAlign: number;
  bitsPerSample: number;

  constructor() {}
  static isChunk(buffer: Buffer, offset: number) {
    const id = buffer.readUIntBE(offset, 4);
    const idName = Buffer.from(id.toString(16), 'hex').toString();
    return idName == 'fmt ';
  }
  static from(buffer: Buffer, offset: number) {
    const chunk = new Fmt();
    // 1-4 Subchunk1 ID "fmt"
    // 5-8 Subchunk1 Size "16"
    // 9-10 Audio Format "1"
    // 11-12 Num Channels
    chunk.numChannels = buffer.readUIntLE(offset+10, 2);
    // 13-16 Sample Rate
    chunk.sampleRate = buffer.readUIntLE(offset+12, 4);
    // 17-20 Byte Rate
    chunk.byteRate = buffer.readUIntLE(offset+16, 4);
    // 21-22 Block Align
    chunk.blockAlign = buffer.readUIntLE(offset+20, 2);
    // 23-24 Bits Per Sample
    chunk.bitsPerSample = buffer.readUIntLE(offset+22, 2);
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
  readonly id: string = 'data';
  size: number;
  wavBuffer: Buffer;

  constructor() {}
  static isChunk(buffer: Buffer, offset: number) {
    const id = buffer.readUIntBE(offset, 4);
    const idName = Buffer.from(id.toString(16), 'hex').toString();
    return idName == 'data';
  }
  static from(buffer: Buffer, offset: number) {
    const chunk = new WavData();
    // 1-4 Subchunk2 ID "data"
    // 5-8 Subchunk2 Size
    chunk.size = buffer.readUIntLE(offset+4, 4);
    // 9-   Subchunk2 data
    chunk.wavBuffer = Buffer.alloc(8 + chunk.size);
    buffer.copy(chunk.wavBuffer, 0, offset+8, chunk.size)
    // return
    return chunk;
  }
  printTable(offset: number): any {
    let tables = [];
    tables.push({ position: offset,    length: 4, header: 'Subchunk2 ID "data"', data: this.id, });
    tables.push({ position: offset+4,  length: 4, header: 'Subchunk2 Size',      data: this.size, });
    return tables;
  }
}

