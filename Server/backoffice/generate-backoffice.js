var mustache = require('mustache');
var fs = require('fs');

let rawdata = fs.readFileSync('./Server/config.json');
let config = JSON.parse(rawdata);

function generateBO() {
    var models = [];
    var view = [];

    config.schemas.forEach(schema => {
        models.push({ modelTitle: schema.name });
        view = {
            models: models
        }
    });

    fs.readFile('Server/backoffice/backoffice.mustache', function (err, data) {
        var output = mustache.render(data.toString(), view);
        fs.writeFileSync('Publish/Controllers/backoffice.js', output);
    });
}

module.exports.generateBO = generateBO;