var express = require("express");
var app = express();


var bodyParser = require('body-parser');
var childProcess = require('child_process');
//faz o parse dos pedidos com content-type - application/json
app.use(bodyParser.urlencoded({ extended: true }));
//faz o parse dos pedidos com content-type - application/json
app.use(bodyParser.json())

app.use(express.static(__dirname + '/public'));

var urls = [];

//contador para as rotas que chegam ao servidor
app.use(function (req, res, next) {
    if (urls[req.url]) {
        urls[req.url] += 1;
    } else {
        urls[req.url] = 1;
    }

    console.log(urls);
    next();
});


app.use(express.static('public'));
app.get("/", function (req, res) {
    res.send("./Public/index.html");
});

app.post("/generate", function (req, res) {
    childProcess.fork('./Server/server.js');
});

//responder aos clientes para as rotas não previstas no servidor
app.get('*', function (req, res) {
    res.send('Erro, URL inválido.');
});


var server = app.listen(8080, function () {
    var host = server.address().address === "::" ? "localhost" : server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
});
