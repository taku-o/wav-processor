"use strict";
exports.__esModule = true;
// vim:set sts=2 ts=2 st=2 :
var fs = require("fs");
var riff_1 = require("./riff");
var cTable = require('console.table');
// params
var args = process.argv.slice(2);
if (args.length < 1) {
    process.exit(1);
}
var wavFile = args[0];
fs.readFile(wavFile, 'binary', function (err, content) {
    if (err) {
        console.error(err);
        return;
    }
    var buffer = Buffer.from(content, 'binary');
    var chunk = riff_1.Riff.from(buffer);
    console.table(chunk.printTable(0));
});
