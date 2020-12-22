const express = require("express")
const cors = require("cors")
const fs = require("fs")
const bodyParser = require("body-parser")
const cookieParser = require("cookie-parser")

const corsOptions = {
  credentials: true,
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Authorization,X-Requested-With,X-HTTP-Method-Override,Content-Type,Cache-Control,Accept'
}

const server = express()
server.use(cors(corsOptions))
server.use(cookieParser())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({extended: true}));

server.get("/brokers", (req, res) => {
  res.status(200)
  try{
    fs.accessSync("./json/brokers.json", fs.constants.F_OK)
  } catch (err) {
    console.log(err)
    console.log("File doesn't exist")
    res.status(201).send({})
    return
  }

  try {
    const data = JSON.parse(fs.readFileSync("./json/brokers.json", "utf8"))
    res.send(data)
  } catch (err) {
    console.log(err)
    console.log("Corrupted file")
    res.status(500).send({})
  }
})

server.put("/brokers", (req, res) => {
  res.status(200)
  try {
    fs.writeFileSync("./json/brokers.json", JSON.stringify(req.body, null, ' '), "utf8")
  } catch (err) {
    if(err) console.log(err)
    res.status(500)
  }
  res.end()
})

server.get("/shares", (req, res) => {
  res.status(200)
  try{
    fs.accessSync("./json/shares.json", fs.constants.F_OK)
  } catch (err) {
    console.log(err)
    console.log("File doesn't exist")
    res.status(201).send({})
    return
  }

  try {
    const data = JSON.parse(fs.readFileSync("./json/shares.json", "utf8"))
    res.send(data)
  } catch (err) {
    console.log(err)
    console.log("Corrupted file")
    res.status(500).send({})
  }
})

server.put("/shares", (req, res) => {
  res.status(200)
  try {
    fs.writeFileSync("./json/shares.json", JSON.stringify(req.body, null, ' '), "utf8")
  } catch (err) {
    if(err) console.log(err)
    res.status(500)
  }
  res.end()
})

server.get("/settings", (req, res) => {
  res.status(200)
  try{
    fs.accessSync("./json/settings.json", fs.constants.F_OK)
  } catch (err) {
    console.log(err)
    console.log("File doesn't exist")
    res.status(201).send({})
    return
  }

  try {
    const data = JSON.parse(fs.readFileSync("./json/settings.json", "utf8"))
    res.send(data)
  } catch (err) {
    console.log(err)
    console.log("Corrupted file")
    res.status(500).send({})
  }
})

server.put("/settings", (req, res) => {
  res.status(200);
  try {
    fs.writeFileSync("./json/settings.json", JSON.stringify(req.body, null , ' '), "utf8")
  } catch (err) {
    if(err) console.log(err)
    res.status(500)
  }
  res.end();
})

server.listen(3000, () => {
  console.log("server running at 3000 port")
});
