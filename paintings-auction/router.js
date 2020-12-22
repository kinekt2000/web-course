const express = require('express');
const fs = require("fs")

const router = express.Router();
const io = require("socket.io").listen(3030);

const paintings = JSON.parse(fs.readFileSync("./public/json/paintings.json", "utf8"));
let users = JSON.parse(fs.readFileSync("./public/json/users.json", "utf8"));
const config = JSON.parse(fs.readFileSync("./public/json/config.json", "utf8"));

let ext_users = [];
for(let user of users) {
    ext_users.push({
        id: user.id,
        name: user.name,
        residual: user.fund,
        paintings: []
    })
}

let tradingState = [];
for(let painting of paintings) {
    tradingState.push({
        id: painting.id,
        currentPrice: painting.price,
        buyer: null,
        timeout: null,
        timer: null,
        sold: false
    })
}

function timeToInt(time) {
    const [first, second] = time.split(":");
    const iFirst = parseInt(first);
    const iSecond = parseInt(second);
    if(isNaN(iFirst) || isNaN(iSecond)) {
        return null;
    } else {
        return iFirst * 60 + iSecond
    }
}

 /* CONFIG TIME */
// hh:mm:ss
const begin = timeToInt(config.auction.time) * 60;

// mm:ss
const timeout = timeToInt(config.auction.timeout);

// mm:ss
const countdown = timeToInt(config.auction.countdown);

// mm:ss
const pause = timeToInt(config.auction.pause);

console.table({begin: begin, timeout: timeout, countdown: countdown, pause: pause});

 /* CURRENT TIME */
const h = new Date().getHours();
const m = new Date().getMinutes();
const s = new Date().getSeconds();

let currentTime = h * 3600 + m * 60 + s;

console.table({hours: h, minutes: m, seconds: s, time: currentTime});

const updateInterval = 5;
let auctionTimer = setInterval(() => {
    currentTime++;

    if(currentTime === begin || currentTime === begin + countdown) {
        io.sockets.emit("update")
        if(currentTime === begin + countdown) {
            for(let i = 0; i < tradingState.length; i++) {
                const state = tradingState[i];
                if(state.buyer && state.sold === false) {
                    console.log(state)
                    state.sold = true;
                    clearInterval(state.timer);
                    state.timer = null;
                    ext_users[state.buyer].paintings.push(i);
                    users[state.buyer].fund -= state.currentPrice;
                    io.sockets.emit("sold", {
                        name: users[state.buyer],
                        painting: paintings[i].name,
                        paintingNumber: i,
                        price: state.currentPrice
                    })
                }
            }
        }
    }

    if(currentTime % updateInterval === 0) {
        const timers = [];
        for(const p of tradingState) {
            timers.push(p.timeout);
        }
        io.sockets.emit("update_time", {countdown: begin + countdown - currentTime, timers: timers})
    }

}, 1000);

io.sockets.on("connection", (socket) => {
    console.log("Подключен")

    socket.on("init", (data) => {
        socket.username = data.name;
        socket.color = data.color;
        io.sockets.emit("connected_message", {name: socket.username, color: socket.color})
    })

    socket.on("raise", (data) => {
        const name = data.name;
        const paintingNumber = parseInt(data.painting);

        for(let i = 0; i < ext_users.length; i++) {
            let user = ext_users[i];
            if(user.name === name) {

                if(tradingState[paintingNumber].sold) {
                    socket.emit("cannot_raise", "painting sold")
                    return;
                }

                const buyerNotExists = tradingState[paintingNumber].buyer === null;
                let canRaise;
                if(buyerNotExists) {
                    if (data.price >= tradingState[paintingNumber].currentPrice) {
                        canRaise = true
                    }
                } else canRaise = data.price > tradingState[paintingNumber].currentPrice;

                if(!canRaise) {
                    socket.emit("cannot_raise", "price already increased");
                    return;
                }

                if(user.residual >= data.price) {
                    user.residual -= data.price;

                    if(tradingState[paintingNumber].buyer !== null) {
                        ext_users[tradingState[paintingNumber].buyer].residual += tradingState[paintingNumber].currentPrice;
                    }

                    tradingState[paintingNumber].buyer = i;
                    tradingState[paintingNumber].currentPrice = data.price;
                    tradingState[paintingNumber].timeout = timeout;
                    tradingState[paintingNumber].timer = setInterval(() => {
                        tradingState[paintingNumber].timeout--;
                        if(tradingState[paintingNumber].timeout === 0) {
                            tradingState[paintingNumber].sold = true;
                            clearInterval(tradingState[paintingNumber].timer);
                            tradingState[paintingNumber].timer = null;
                            ext_users[tradingState[paintingNumber].buyer].paintings.push(paintingNumber);
                            users[tradingState[paintingNumber].buyer].fund -= tradingState[paintingNumber].currentPrice;
                            io.sockets.emit("sold", {
                                name: name,
                                painting: paintings[paintingNumber].name,
                                paintingNumber: paintingNumber,
                                price: data.price
                            })
                        }
                    }, 1000)

                    io.sockets.emit("raise", {
                        name: name,
                        painting: paintings[paintingNumber].name,
                        paintingNumber: paintingNumber,
                        price: data.price,
                        timeout: timeout
                    })
                    return;
                } else {
                    socket.emit("cannot_raise", "insufficient fund")
                    return;
                }
            }
        }

        socket.emit("cannot_raise", "can't recognize");
    })

    socket.on("disconnect", () => {
        io.sockets.emit("disconnected_message", {name: socket.username, color: socket.color})
    })
})

/* Render */
router.get("/", (req, res) => {
    res.render("index");
})

router.get("/dash/:name", (req, res) => {
    const name = req.params.name.replace(/_/g, " ");
    for(let i= 0; i < users.length; i++) {
        const user = users[i];
        if(user.name === name) {

            if(currentTime < begin) {
                res.render("waiting");
                return;
            }

            if(currentTime >= begin && currentTime < begin + pause) {
                res.render("waiting", {time: begin + pause - currentTime});
                return;
            }

            if(currentTime >= begin + countdown) {
                res.render("result", {tradingState: tradingState, paintings: paintings, users: users})
                return;
            }

            let extUser = {...user};
            extUser.residual = ext_users[i].residual;
            extUser.leading = [];
            extUser.purchase = [];
            extUser.countdown = begin + countdown - currentTime;

            for(let j = 0; j < tradingState.length; j++) {
                const painting = tradingState[j];
                if(painting.sold === false && painting.buyer === i) {
                    extUser.leading.push(paintings[j].name)
                }
            }

            for(let j = 0; j < ext_users[i].paintings.length; j++) {
                extUser.purchase.push(paintings[ext_users[i].paintings[j]].name)
            }

            res.render("dash", extUser)
            return;
        }
    }
    res.send("404 not found");
})

router.get("/dash", ((req, res) => {
    if(req.query.name) res.redirect(`/dash/${req.query.name.replace(/ /g, "_")}`)
    else res.send("404 not found")
}))

router.get("/admin", (req, res) => {
    res.render("admin", {tradingState: tradingState, paintings: paintings, users: users});
})

/* Ajax */
router.get("/count", (req, res) => {
    res.status(200);
    res.send(paintings.length.toString());
})

router.get("/painting", (req, res) => {
    const number = req.query.number;
    res.status(200);
    const painting = {...paintings[number]}
    painting.currentPrice = tradingState[number].currentPrice;
    painting.buyer = tradingState[number].buyer !== null ? users[tradingState[number].buyer].name : null;
    painting.timeout = tradingState[number].timeout;
    painting.sold = tradingState[number].sold;
    res.send(painting);
})

router.get("/extUser", (req, res) => {
    const user = req.query.name;

    for(const extUser of ext_users) {
        if(extUser.name === user) {
            res.status(200);
            res.json(extUser);
            return;
        }
    }

    res.status(501);
    res.json(null);
})


/* 404 */
router.get("*", (req, res) => {
    res.send("404 not found");
})

module.exports = router;