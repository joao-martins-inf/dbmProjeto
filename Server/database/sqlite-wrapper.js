const sqlite3 = require('sqlite3').verbose();

/**
 * Exportar uma função que recebe o caminho da base de dados a ser utilizado. Quando o módulo for utilizado deverá ser passado o caminho para o ficheiro da base de dados e a função retornará um objeto com 3 funções possíveis: get, run e where
 * 
 * @param {any} dbpath 
 * @returns 
 */
module.exports = function (dbpath) {
    return {
        get: function (statement, params, type, callback) {
            let db = new sqlite3.Database(dbpath);
            db.get(statement, params, function (err, row) {
                if (row) {
                    row = Object.assign(new type(), row);
                    callback(row);
                }
            });
            db.close();
        },
        run: function (statement, params, callback) {
            let db = new sqlite3.Database(dbpath);
            db.run(statement, params, function (err) {
                if (callback)
                    callback({ success: !err, error: err, rowsAffected: this.changes });
            });
            db.close();
        },
        where: function (statement, params, type, callback) {
            let db = new sqlite3.Database(dbpath);
            db.all(statement, params, function (err, rows) {
                rows = rows.map(function (object) {
                    return Object.assign(new type(), object);;
                });
                callback(rows);
            });
            db.close();
        }
    }
}