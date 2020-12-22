const express = require("express")
const bodyParser = require("body-parser")
const https = require("https")

const fs = require("fs")
const favicon = require("serve-favicon");

const router = require("./routes")

const server = express();

const options = {
    cert: fs.readFileSync("ssl/certificate.crt"),
    key: fs.readFileSync("ssl/key.key")
}

server.use('/build', express.static('build'));
server.use('/error_pages', express.static('error_pages'));
server.use(favicon(__dirname + "/favicon.ico"));
server.use(bodyParser.urlencoded({extended: false}));
server.use(bodyParser.json())
server.use("", router);

https.createServer(options, server).listen(443, () => {
    console.log("Server listens 443 port on https protocol");
})