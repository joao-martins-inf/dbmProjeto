var fs = require('fs');
var mustache = require('mustache');
var { resolve } = require('path');
var mkdirp = require('mkdirp');
var del = require('del');
var classGenerator = require('./models/generate-class');
var generateDB = require('./database/generate-database');
var generateAPI = require('./restful-api/generate-api');
var generateBackOffice = require('./backoffice/generate-backoffice');


let rawdata = fs.readFileSync('./Server/config.json');
let config = JSON.parse(rawdata);

function generate() {
    del.sync(['Publish']);
    mkdirp.sync('./Publish/Models');
    mkdirp.sync('./Publish/Public/Css');
    mkdirp.sync('./Publish/Public/Images');
    mkdirp.sync('./Publish/Public/Js');
    mkdirp.sync('./Publish/Views');
    mkdirp.sync('./Publish/Schemas');
    mkdirp.sync('./Publish/Database');
    mkdirp.sync('./Publish/Controllers');

    classGenerator.classGenerator();
}

function schema_path() {
    config.schemas.forEach(schema => {
        fs.copyFileSync(
            __dirname + schema.path,
            resolve(__dirname, '..', 'Publish', 'Schemas', schema.name + '.json')
        );
    });
}

function wrapper_path() {
    config.staticFiles.forEach(file => {
        fs.copyFileSync(
            __dirname + file.originalPath,
            resolve(__dirname, '..') + file.destinationPath
        );
    });
}

function runChild(path) {
    var childProcess = require('child_process');
    childProcess.fork(path); //nome do ficheiro a executar
}

fs.readFile('./Server/server.mustache', function (err, data) {
    var view = { port: config.port, address: config.address };
    var output = mustache.render(data.toString(), view);
    generate();
    schema_path();
    generateDB.generateDB();
    wrapper_path();
    generateAPI.apiGenerator();
    generateBackOffice.generateBO();
    setTimeout(generateDB.generateRelations, 1000);

    fs.writeFileSync('./Publish/index.js', output);
    //runChild('./Publish/index.js');
});
