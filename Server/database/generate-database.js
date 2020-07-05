var mustache = require("mustache");
var fs = require("fs");
var { resolve } = require("path");
var sqlite3 = require("sqlite3").verbose();

function generateDB() {
    let rawdata = fs.readFileSync('./Server/config.json');
    let config = JSON.parse(rawdata);
    var schemas = [];

    config.schemas.forEach(schema => schemas.push(JSON.parse(fs.readFileSync(resolve(__dirname, '..') + schema.path))));
    var db = new sqlite3.Database("./Publish/Database/" + config.dbname);
    var template = fs.readFileSync("./Server/database/dbscript.mustache").toString();

    schemas.forEach(schema => {
        var str = "";

        Object.keys(schema.properties).forEach(property => {
            var column = schema.properties[property];
            str += property + " ";

            str += dataType(column.type) + " ";

            if (schema.required && schema.required.includes(property)) str += "NOT NULL ";

            if (column.unique) str += "UNIQUE ";

            if (column.pattern) str += "CHECK(LENGTH(" + property + ") <= 8) ";

            if (column.maxLength) str += "CHECK(LENGTH(" + property + ") <= " + column.maxLength + ") ";

            if (column.minimum >= 0 && column.maximum) str += "CHECK(" + property + " >= " + column.minimum + " AND " + property + " <= " + column.maximum + ") ";

            str += ",\n";
        });

        str = str.substring(0, str.length - 2);

        var dbConfig = {
            tableName: schema.title,
            tableNameToLower: schema.title.toLowerCase(),
            body: str
        };
        var output = mustache.render(template, dbConfig);
        //console.log(output);
        db.run(output);
    });

    db.close();
}

function dataType(type) {
    switch (type) {
        case "date":
            return "DATE";
        case "integer":
            return "integer";
        case "float":
            return "real";
        case "string":
            return "text";
        default:
            return "blob";
    }
}

function generateRelationships(shemas) {
    //tablename -> shema name
    //newcolumn -> refShema
    //refTable -> Aritst

    let rawdata = fs.readFileSync('./Server/config.json');
    let config = JSON.parse(rawdata);
    var schemas = [];
    //var dbExists = fs.existsSync("./Publish/Database/" + config.dbname);

    config.schemas.forEach(schema => schemas.push(JSON.parse(fs.readFileSync(resolve(__dirname, '..') + schema.path))));

    var db = new sqlite3.Database("./Publish/Database/" + config.dbname);
    var oneToMany = fs.readFileSync("./Server/database/one-to-many.mustache").toString();
    var oneToOne = fs.readFileSync("./Server/database/one-to-one.mustache").toString();
    var manyToMany = fs.readFileSync("./Server/database/many-to-many.mustache").toString();

    schemas.forEach(schema => {
        var str = "";
        var ref = schema.references;
        if (ref !== null && ref !== undefined) {
            Object.keys(schema.references).forEach(references => {
                var attr = schema.references[references];

                var refTable = attr.model;

                if (attr.relation == "1-M") {
                    const refConfig = {
                        tableName: schema.title,
                        refTableToLower: refTable.toLowerCase(),
                        refTable: refTable
                    };

                    var output = mustache.render(oneToMany, refConfig);
                    db.run(output);
                }

                if (attr.relation == "1-1") {
                    const refConfig = {
                        tableName: schema.title,
                        refTableToLower: refTable.toLowerCase(),
                        refTable: refTable
                    };

                    var outputAddColumn = mustache.render(oneToMany, refConfig);
                    var output = mustache.render(oneToOne, refConfig);
                    db.run(outputAddColumn);
                    db.run(output);
                }

                if (attr.relation == "M-M") {
                    var firstTable = refTable;
                    var secondTable = schema.title;
                    //ordem alfabetica
                    if (schema.title < refTable) {
                        firstTable = schema.title;
                        secondTable = refTable;
                    }

                    const refConfig = {
                        tableNameFirst: firstTable,
                        tableNameSecond: secondTable,
                        columnNameFirst: firstTable.toLowerCase(),
                        columnNameSecond: secondTable.toLowerCase(),
                    };

                    var output = mustache.render(manyToMany, refConfig);
                    db.run(output);
                }
            })
        }
    });
    db.close();
}

module.exports.generateDB = generateDB;
module.exports.generateRelations = generateRelationships;