var mustache = require("mustache");
var fs = require("fs");
var { resolve } = require("path");

let rawdata = fs.readFileSync("./Server/config.json");
let config = JSON.parse(rawdata);

function classGenerator() {
  config.schemas.forEach((schema) => {
    var path = resolve(__dirname, "..") + schema.path;
    fs.readFile(path, function (err, data) {
      let construtor = [];
      let enumerables = [];
      let references = [];
      let manyfunc = [];
      var string = JSON.parse(data.toString());

      Object.keys(string.properties).forEach(function (key, id, array) {
        id === array.length - 1
          ? construtor.push({ name: key, comma: false })
          : construtor.push({ name: key, comma: true });

        if (string.required && !string.required.includes(key)) {
          enumerables.push({ name: key });
        }
      });

      if (string.references != null) {
        Object.keys(string.references).forEach((ref) => {
          atrb = string.references[ref];
          if (atrb.relation == "M-M") {
            manyfunc.push({
              classTitle: string.title,
              ReftableName: atrb.model,
              classTitleLower: string.title.toLowerCase(),
            });
          } else {
            references.push({ ReftableName: atrb.model.toLowerCase() });
          }
        });
      }
      //percorrer os outros shemas todos para verificar se é encessario incluir many func
      config.schemas.forEach((shemaWithMM) => {
        var path = resolve(__dirname, "..") + shemaWithMM.path;
        fs.readFile(path, function (err, data) {
          var stringMM = JSON.parse(data.toString());

          if (stringMM.references != null) {
            Object.keys(stringMM.references).forEach((refMM) => {
              atrbMM = stringMM.references[refMM];
              if (atrbMM.model == string.title) {
                //gerar funçao many como tabelada alternativa
                manyfunc.push({
                  classTitle: string.title,
                  ReftableName: atrb.model,
                  classTitleLower: string.title.toLowerCase(),
                });
              }
            });
          }
        });
      });

      var view = {
        classTitle: string.title,
        classTitleLower: string.title.toLowerCase(),
        constructorArguments: Object.keys(string.properties).join(),
        classConstructor: construtor,
        classEnumerables: enumerables,
        referencesEnumerables: references,
        isManyToMany: manyfunc,
        dbname: config.dbname,
      };

      fs.readFile("Server/models/class.mustache", function (err, data1) {
        var output = mustache.render(data1.toString(), view);
        fs.writeFileSync("Publish/Models/" + string.title + ".js", output);
      });
    });
  });
}

module.exports.classGenerator = classGenerator;
