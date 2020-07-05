var mustache = require('mustache');
var fs = require('fs');
var { resolve } = require('path');

let rawdata = fs.readFileSync('./Server/config.json');
let config = JSON.parse(rawdata);

function apiGenerator() {
    var models = [];
    var view = [];
    config.schemas.forEach(schema => {
        var path = resolve(__dirname, '..') + schema.path;
        fs.readFile(path, function (err, data) {
            models.push({ modelTitle: schema.name, modelPath: resolve(__dirname, '..', "Publish", "Models") + '\\' + schema.name + '.js' });
            view = {
                models: models
            }
        });
    });
    fs.readFile('Server/restful-api/api.mustache', function (err, data1) {
        var output = mustache.render(data1.toString(), view);
        fs.writeFileSync('Publish/Controllers/api.js', output);
    });
}

module.exports.apiGenerator = apiGenerator;