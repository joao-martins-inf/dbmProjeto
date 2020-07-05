var mustache = require('mustache');
var fs = require('fs');
var { resolve } = require('path');

let rawdata = fs.readFileSync('./Server/config.json');
let config = JSON.parse(rawdata);

function classGenerator() {
    config.schemas.forEach(schema => {
        var path = resolve(__dirname, '..') + schema.path;
        fs.readFile(path, function (err, data) {
            let construtor = [];
            let enumerables = [];
            let references = [];
            var string = JSON.parse(data.toString());

            Object.keys(string.properties).forEach(function (key, id, array) {
                (id === array.length - 1) ? construtor.push({ name: key, comma: false }) : construtor.push({ name: key, comma: true });

                if (string.required && !string.required.includes(key)) {
                    enumerables.push(({ name: key }));
                }

                if (string.references && !string.required.includes(key)) {
                    references.push(({ name: key }));
                }
            });

            var view = {
                classTitle: string.title,
                classTitleLower: string.title.toLowerCase(),
                constructorArguments: Object.keys(string.properties).join(),
                classConstructor: construtor,
                classEnumerables: enumerables,
                referencesEnumerables: references,
                dbname: config.dbname
            }

            fs.readFile('Server/models/class.mustache', function (err, data1) {
                var output = mustache.render(data1.toString(), view);
                fs.writeFileSync('Publish/Models/' + string.title + '.js', output);
            });
        });
    });
}

module.exports.classGenerator = classGenerator;