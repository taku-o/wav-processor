interface Chunk {
  chunkLength: number;
  readonly id: string;
  size: number;
  printTable(offset: number): any;
  write(buffer: Buffer): void;
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
      } else if (iXml.isChunk(buffer.slice(pos))) {
        const sub = iXml.from(buffer.slice(pos));
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
      let tableInfos = chunk.printTable(0);
      tables = tables.concat(tableInfos);
      offset += chunk.chunkLength;
    }
    return tables;
  }
  write(buffer: Buffer): void {
    // 1-4 Chunk ID "RIFF"
    Buffer.from(this.id).copy(buffer, 0, 0, 4)
    // 5-8 Chunk Size
    buffer.writeUIntLE(this.size, 4, 4);
    // 9-12  Format "WAVE"
    Buffer.from(this.format).copy(buffer, 8, 0, 4)
    // 13-   SubChunks
    let offset = 12;
    for (let chunk of this.subChunks) {
      chunk.write(buffer.slice(offset));
      offset += chunk.chunkLength;
    }
  }
  appendChunk(chunk: Chunk): void {
    this.subChunks.push(chunk);
    this.size += chunk.chunkLength;
    this.chunkLength += chunk.chunkLength;
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
  write(buffer: Buffer): void {
    // 1-4 Subchunk1 ID "fmt"
    Buffer.from(this.id).copy(buffer, 0, 0, 4)
    // 5-8 Subchunk1 Size "16"
    buffer.writeUIntLE(this.size, 4, 4);
    // 9-10 Audio Format "1"
    buffer.writeUIntLE(this.audioFormat, 8, 2);
    // 11-12 Num Channels
    buffer.writeUIntLE(this.numChannels, 10, 2);
    // 13-16 Sample Rate
    buffer.writeUIntLE(this.sampleRate, 12, 4);
    // 17-20 Byte Rate
    buffer.writeUIntLE(this.byteRate, 16, 4);
    // 21-22 Block Align
    buffer.writeUIntLE(this.blockAlign, 20, 2);
    // 23-24 Bits Per Sample
    buffer.writeUIntLE(this.bitsPerSample, 22, 2);
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
  write(buffer: Buffer): void {
    // 1-4 Subchunk2 ID "data"
    Buffer.from(this.id).copy(buffer, 0, 0, 4)
    // 5-8 Subchunk2 Size
    buffer.writeUIntLE(this.size, 4, 4);
    // 9-   Subchunk2 data
    this.wavBuffer.copy(buffer, 8, 0, this.size);
  }
}

export class iXml implements Chunk {
  chunkLength: number;
  readonly id: string = 'iXML';
  size: number;
  data: string;
  readableData: string;

  constructor() {}
  static isChunk(buffer: Buffer) {
    const id = buffer.readUIntBE(0, 4);
    const idName = Buffer.from(id.toString(16), 'hex').toString();
    return idName == 'iXML';
  }
  static from(buffer: Buffer) {
    const chunk = new iXml();
    // 1-4 Subchunk3 ID "iXML"
    // 5-8 Subchunk3 Size
    chunk.size = buffer.readUIntLE(4, 4);
    chunk.chunkLength = chunk.size + 8;
    // 9-   Subchunk3 data
    const d = buffer.readUIntBE(8, chunk.size);
    chunk.data = Buffer.from(d.toString(16), 'hex').toString();
    chunk.readableData = chunk.data.replace(/&lt;/, '<').replace(/&gt;/, '>').replace(/&amp;/, '&');
    // return
    return chunk;
  }
  static createWithRole(roleName: string) {
    const readableData = `<?xml version="1.0" encoding="UTF-8"?>
<BWFXML>
    <TRACK_LIST>
        <TRACK_COUNT>1</TRACK_COUNT>
        <TRACK>
            <CHANNEL_INDEX>1</CHANNEL_INDEX>
            <INTERLEAVE_INDEX>1</INTERLEAVE_INDEX>
            <NAME>${roleName}</NAME>
        </TRACK>
    </TRACK_LIST>
</BWFXML>`;
    const data = readableData.replace(/</, '&lt;').replace(/>/, '&gt;').replace(/&/, '&amp;');

    const chunk = new iXml();
    // 1-4 Subchunk3 ID "iXML"
    // 5-8 Subchunk3 Size
    chunk.size = Buffer.byteLength(data);
    chunk.chunkLength = chunk.size + 8;
    // 9-   Subchunk3 data
    chunk.data = data;
    chunk.readableData = readableData;
    // return
    return chunk;
  }
  printTable(offset: number): any {
    let tables = [];
    tables.push({ position: offset,    length: 4,         header: 'Subchunk2 ID "data"', data: this.id, });
    tables.push({ position: offset+4,  length: 4,         header: 'Subchunk2 Size',      data: this.size, });
    tables.push({ position: offset+8,  length: this.size, header: 'iXML Data',           data: this.readableData, });
    return tables;
  }
  write(buffer: Buffer): void {
    // 1-4 Subchunk3 ID "iXML"
    Buffer.from(this.id).copy(buffer, 0, 0, 4)
    // 5-8 Subchunk3 Size
    buffer.writeUIntLE(this.size, 4, 4);
    // 9-   Subchunk3 data
    Buffer.from(this.data).copy(buffer, 8, 0, this.size);
  }
}

