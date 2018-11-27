"use strict";
exports.__esModule = true;
/**
 * RIFF
 */
var Riff = /** @class */ (function () {
    function Riff() {
        this.id = 'RIFF';
        this.format = 'WAVE';
        this.subChunks = [];
    }
    Riff.isChunk = function (buffer) {
        var id = buffer.readUIntBE(0, 4);
        var idName = Buffer.from(id.toString(16), 'hex').toString();
        return idName == 'RIFF';
    };
    Riff.from = function (buffer) {
        var chunk = new Riff();
        // 1-4 Chunk ID "RIFF"
        // 5-8 Chunk Size
        chunk.size = buffer.readUIntLE(4, 4);
        chunk.chunkLength = chunk.size + 8;
        // 9-12  Format "WAVE"
        // 13-   SubChunks
        var pos = 12;
        while (pos < chunk.chunkLength) {
            if (Fmt.isChunk(buffer.slice(pos))) {
                var sub = Fmt.from(buffer.slice(pos));
                chunk.subChunks.push(sub);
                pos += sub.chunkLength;
                continue;
            }
            else if (WavData.isChunk(buffer.slice(pos))) {
                var sub = WavData.from(buffer.slice(pos));
                chunk.subChunks.push(sub);
                pos += sub.chunkLength;
                continue;
            }
            else {
                break;
            }
        }
        // return
        return chunk;
    };
    Riff.prototype.printTable = function (offset) {
        var tables = [];
        tables.push({ position: offset, length: 4, header: 'Chunk ID "RIFF"', data: this.id });
        tables.push({ position: offset + 4, length: 4, header: 'Chunk Size', data: this.size });
        tables.push({ position: offset + 8, length: 4, header: 'Format "WAVE"', data: this.format });
        offset = 12;
        for (var _i = 0, _a = this.subChunks; _i < _a.length; _i++) {
            var chunk = _a[_i];
            var tableInfos = chunk.printTable(offset);
            tables = tables.concat(tableInfos);
            offset += chunk.chunkLength;
        }
        return tables;
    };
    Riff.prototype.write = function (buffer) {
        // 1-4 Chunk ID "RIFF"
        Buffer.from(this.id).copy(buffer, 0, 0, 4);
        // 5-8 Chunk Size
        buffer.writeUIntLE(this.size, 4, 4);
        // 9-12  Format "WAVE"
        Buffer.from(this.format).copy(buffer, 8, 0, 4);
        // 13-   SubChunks
        var offset = 12;
        for (var _i = 0, _a = this.subChunks; _i < _a.length; _i++) {
            var chunk = _a[_i];
            chunk.write(buffer.slice(offset));
            offset += chunk.chunkLength;
        }
    };
    return Riff;
}());
exports.Riff = Riff;
/**
 * fmt Chunk
 */
var Fmt = /** @class */ (function () {
    function Fmt() {
        this.chunkLength = 24;
        this.id = 'fmt ';
        this.size = 16;
        this.audioFormat = 1;
    }
    Fmt.isChunk = function (buffer) {
        var id = buffer.readUIntBE(0, 4);
        var idName = Buffer.from(id.toString(16), 'hex').toString();
        return idName == 'fmt ';
    };
    Fmt.from = function (buffer) {
        var chunk = new Fmt();
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
    };
    Fmt.prototype.printTable = function (offset) {
        var tables = [];
        tables.push({ position: offset, length: 4, header: 'Subchunk1 ID "fmt "', data: this.id });
        tables.push({ position: offset + 4, length: 4, header: 'Subchunk1 Size', data: this.size });
        tables.push({ position: offset + 8, length: 2, header: 'Audio Format "1" PCM', data: this.audioFormat });
        tables.push({ position: offset + 10, length: 2, header: 'Num Channels', data: this.numChannels });
        tables.push({ position: offset + 12, length: 4, header: 'Sample Rate', data: this.sampleRate });
        tables.push({ position: offset + 16, length: 4, header: 'Byte Rate', data: this.byteRate });
        tables.push({ position: offset + 20, length: 2, header: 'Block Align', data: this.blockAlign });
        tables.push({ position: offset + 22, length: 2, header: 'Bits Per Sample', data: this.bitsPerSample });
        return tables;
    };
    Fmt.prototype.write = function (buffer) {
        // 1-4 Subchunk1 ID "fmt"
        Buffer.from(this.id).copy(buffer, 0, 0, 4);
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
    };
    return Fmt;
}());
/**
 * Wave Data Chunk
 */
var WavData = /** @class */ (function () {
    function WavData() {
        this.id = 'data';
    }
    WavData.isChunk = function (buffer) {
        var id = buffer.readUIntBE(0, 4);
        var idName = Buffer.from(id.toString(16), 'hex').toString();
        return idName == 'data';
    };
    WavData.from = function (buffer) {
        var chunk = new WavData();
        // 1-4 Subchunk2 ID "data"
        // 5-8 Subchunk2 Size
        chunk.size = buffer.readUIntLE(4, 4);
        chunk.chunkLength = chunk.size + 8;
        // 9-   Subchunk2 data
        chunk.wavBuffer = buffer.slice(8, chunk.size);
        // return
        return chunk;
    };
    WavData.prototype.printTable = function (offset) {
        var tables = [];
        tables.push({ position: offset, length: 4, header: 'Subchunk2 ID "data"', data: this.id });
        tables.push({ position: offset + 4, length: 4, header: 'Subchunk2 Size', data: this.size });
        tables.push({ position: offset + 8, length: this.size, header: 'Wave Data', data: '******' });
        return tables;
    };
    WavData.prototype.write = function (buffer) {
        // 1-4 Subchunk2 ID "data"
        Buffer.from(this.id).copy(buffer, 0, 0, 4);
        // 5-8 Subchunk2 Size
        buffer.writeUIntLE(this.size, 4, 4);
        // 9-   Subchunk2 data
        this.wavBuffer.copy(buffer, 8, 0, this.size);
    };
    return WavData;
}());
