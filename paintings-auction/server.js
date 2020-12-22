const express = require('express');
const domain = require('domain');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const router = require('./router');

let d = domain.create(),
    server;

d.on("error", (err) => {
    console.log("Домен перехватил ошибку %s", err);
});

d.run(() => {
    server = express();
});

server.use(cookieParser());
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

server.set("view engine", "pug");
server.set("views", `./views`);
server.use('/public', express.static('public'));

server.use("", router);
server.listen(3000, () => {
    console.log("server listens 3000 port")
});