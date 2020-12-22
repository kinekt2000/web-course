const express = require("express")
const io = require("socket.io")(8080, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST",],
    credentials: true
  }
})
const fs = require("fs")

const cors = require("cors")
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

const brokers = new Map();
const shares = new Map();

let started = null;

function randomG(v) {
  let r = 0;
  for(let i = v; i > 0; i--) {
    r += Math.random();
  }

  return r/v;
}

function mapValue(value, from_min, from_max, to_min, to_max) {
  return (value - from_min) * (to_max - to_min) / (from_max - from_min) + to_min
}

function getRandomInRange(min, max, type) {
  let r;
  if(type === "normal") {
    r = randomG(3);
  } else {
    r = Math.random();
  }

  return mapValue(r, 0, 1, min, max);
}

function changeShares(){
  shares.forEach((share) => {
    const price = share.state.price;
    const distance = Math.min(share.distance, price / 2);
    const min = price - distance;
    const max = price + distance;
    share.state.price = Math.floor(getRandomInRange(min, max, share.distribution));
    if(share.state.price < share.min) {
      share.state.price = share.min
    }
  })

  const sharesToSend = [];
  Array.from(shares.entries()).forEach(([key, value]) => {
    sharesToSend.push({
      company: key,
      ...value.state
    })
  })

  io.sockets.emit("updateShares", sharesToSend)
  console.log("Shares updated")
}


let admin = null;
io.sockets.on("connection", client => {
  client.on("admin", () => {
    admin = client;
  })

  client.on("buy", (token, company, count) => {
    if(started) {
      buy(client, token, company, count)
    }
  })

  client.on("sell", (token, company, count) => {
    if(started){
      sell(client, token, company, count)
    }
  })

  client.on("start", (interval) => {
    console.log("trades were started")
    started = setInterval(changeShares, interval * 1000)
    io.sockets.emit("start");
  })

  client.on("end", () => {
    console.log("trades were stopped")
    clearInterval(started);
    io.sockets.emit("end");
  })
  
})

function buy(client, token, company, count) {
  let err = ""

  const broker = brokers.get(token).state;
  const brokerShare = broker.shares.find(([key, _]) => key === company);
  const share = shares.get(company).state;

  if(share.price * count > broker.fund) {
    err = "Not enough fund"
  } else if(count > share.count) {
    err = "Wrong count of shares, try again"
  } else {

    if(brokerShare) {
      brokerShare[1] += count;
    } else {
      broker.shares.push([company, count])
    }

    broker.fund -= share.price * count;
    broker.profit = broker.fund - brokers.get(token).initialFund;
    share.count -= count;

    io.sockets.emit("changeShare", company, share)

    if(admin){
      admin.emit("changeBroker", token, broker);
    }
  }
  client.emit("changeBroker", err, broker);
}

function sell(client, token, company, count) {
  let err = ""

  const broker = brokers.get(token).state;
  const brokerShare = broker.shares.find(([key, _]) => key === company);
  const share = shares.get(company).state;

  if(count > brokerShare[1]) {
    err = "Wrong count of shares, try again";
  } else {
    brokerShare[1] -= count;
    broker.shares = broker.shares.filter(([_, value]) => value !== 0);

    broker.fund += share.price * count;
    broker.profit = broker.fund - brokers.get(token).initialFund;
    share.count += count;

    io.sockets.emit("changeShare", company, share)

    if(admin){
      admin.emit("changeBroker", token, broker);
    }
  }

  client.emit("changeBroker", err, broker);
}

function initServer() {
  const brokers_spec = openBrokers();
  const shares_spec = openShares();

  if(!brokers_spec) return false;
  if(!shares_spec) return false;

  brokers_spec.forEach(broker_spec => {
    brokers.set(broker_spec.username, {
      state: {
        name: broker_spec.name,
        fund: broker_spec.fund,
        profit: 0,
        shares: []
      },

      initialFund: broker_spec.fund
    })
  })

  shares_spec.forEach(share_spec => {
    shares.set(share_spec.company, {
      state: {
        count: share_spec.count,
        price: share_spec.price
      },

      distribution: share_spec.distribution,
      min: share_spec.min,
      distance: share_spec.price / 2
    })
  })

  return true;
}


function openShares() {
  try{
    fs.accessSync("./json/shares.json", fs.constants.F_OK)
  } catch (err) {
    console.log(err)
    console.log("File doesn't exist")
    return undefined
  }

  try {
    return JSON.parse(fs.readFileSync("./json/shares.json", "utf8"))
  } catch (err) {
    console.log(err)
    console.log("Corrupted file")
    return undefined
  }
}


function openBrokers() {
  try{
    // do we have file
    fs.accessSync("./json/brokers.json", fs.constants.F_OK)
  } catch (err) {
    // file doesn't exist (server can't see file)
    console.log(err)
    console.log("File doesn't exist")
    return undefined
  }

  try {
    // parse brokers data file and return it
    return JSON.parse(fs.readFileSync("./json/brokers.json", "utf8"));
  } catch (err) {

    // if we can't parse
    console.log(err)
    console.log("Corrupted file")
    return undefined
  }
}

server.get("/login", (req, res) => {
  const username = req.query.username;

  if(username === "admin") {
    res.status(200).send(`/admin`); // there can be a special link
  } else if(brokers.has(username)) {
    res.status(200).send(`/broker?token=${username}`); // there can be a special link
  } else {
    res.status(404).end();
  }
})


server.get("/broker", (req, res) => {
  if(brokers.has(req.query.token)) {
    res.status(200).json({
      token: req.query.token,
      ...brokers.get(req.query.token).state
    });
  } else {
    res.status(404).end();
  }
})


server.get("/brokers", (req, res) => {
  const brokersToSend = [];
  Array.from(brokers.entries()).forEach(([key, value]) => {
    brokersToSend.push({
      username: key,
      ...value.state
    })
  })


  res.status(200).json(brokersToSend);
})


server.get("/shares", (req, res) => {
  const sharesToSend = [];
  Array.from(shares.entries()).forEach(([key, value]) => {
    sharesToSend.push({
      company: key,
      ...value.state
    })
  })


  res.status(200).json(sharesToSend);
})


server.put("/setdistr", (req, res) => {
  shares.get(req.body.company).distribution = req.body.distribution;
  res.status(200).end();
})


if(initServer()) {
  server.listen(3030, () => {
    console.log("server running at 3030 port")
  });
} else {
  console.error("Error in data files. Can't run server");
}
