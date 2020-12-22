const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const jimp = require("jimp");

const Container = require("./container");

// load db
let paintings = new Container("./db/paintings.json");
let members = new Container("./db/users.json");
let config = JSON.parse(fs.readFileSync("./db/config.json", "utf8"));

// load prerendered error pages
const errors = new Map();
try {
    errors["500"] = fs.readFileSync("./error_pages/500.html", "utf8");
    errors["404"] = fs.readFileSync('./error_pages/404.html', "utf8");
} catch (err) {
    console.error("READERR ERROR_PAGE");
    console.error(err);
}

// set storage engine
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, __dirname + "/tmp/");
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + Date.now() + path.extname(file.originalname));
    }
})

// init upload
const upload = multer({
    storage: storage,
    limits: {fileSize: 1000000},
    fileFilter: (req, file, cb) => {
        checkFileType(file, cb);
    }
}).single("image");

//Check file type
function checkFileType(file, cb) {
    // Allowed exts
    const filetypes = /jpeg|jpg|png/

    // Check ext
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    // Check mime
    const mimetype = filetypes.test(file.mimetype);

    if(extname && mimetype) {
        return cb(null, true)
    } else {
        return cb({message: "Images only"});
    }

}

/**
 *
 * @param page {string}
 * @param req {Request<P, ResBody, ReqBody, ReqQuery>}
 * @param res {Response<ResBody>}
 */
function handlePage(page, req, res) {
    fs.readFile(`./build/html/${page}.html`,'utf8', (err, data) => {
        if(err) {
            console.error(`Error while reading ${page}`)
            res.status(500).send(errors["500"]);
        } else {
            res.status(200).send(data);
        }
    })
}

function handleImage(image_path, id){
    const painting = paintings.getItemByID(id);
    const ext = path.extname(image_path);
    let done = 0;
    if(painting) {
        fs.copyFile(image_path, "./dev/images/" + painting.name + ext, () => {
            console.log(`${image_path} moved to dev`);
            done++;
            if(done === 2) {
                fs.unlinkSync(image_path);
            }
        });

        jimp.read(image_path, (err, image) => {
            if(err) {
                console.log(err)
            } else {
                image.write("./build/images/" + id + ".jpg");
                done++;
                if(done === 2) {
                    fs.unlinkSync(image_path);
                }
            }
        });
    }
}

// pages
router.get("/", (req, res) => {
    handlePage("index", req, res);
})

router.get("/members", (req, res) => {
    handlePage("members", req, res);
})

router.get("/config", (req, res) => {
    handlePage("config", req, res);
})


// ajax
router.get("/painting", (req, res) => {
    const number = req.query.number;
    const painting = paintings.getItemByNumber(number);
    res.status(200).json(painting);
})

router.put("/upload", (req, res) => {
    upload(req, res, (err) => {
        if(err) {
            console.log(err);
            res.status(500).send("Error: " + err.message);
        } else {
            if(req.file === undefined) {
                res.status(401).send("Error: No File Selected");
            } else {
                handleImage("./tmp/" + req.file.filename, parseInt(req.body.id));
                res.status(200).send(req.body.id + " Good!");
            }
        }
    })
})

router.get("/pars", (req, res) => {
    const id = parseInt(req.query.id);
    for(let i = 0; i < config.paintings.length; i++) {
        if(id === config.paintings[i]) {
            res.status(200).end("true");
            return;
        }
    }
    res.status(200).end("false");
})

router.put("/painting", (req, res) => {
    const id = parseInt(req.body.id);
    const name = req.body.name;
    const author = req.body.author;
    const price = req.body.price;
    const description = req.body.description;

    const painting = paintings.getItemByID(id);
    if(!painting) res.status(501).end();

    if(name) painting.name = name;
    if(author) painting.author = author;
    if(description) painting.description = description;
    if(price) {
        const number = parseInt(price);
        if(isNaN(number)) {
            res.status(501).end();
            return;
        }
        if(number < 1) {
            res.status(401).end();
            return;
        }
        painting.price = number;
    }

    paintings.rewrite();
    res.status(200).end();
})

router.put("/remove", (req, res) => {
    const id = parseInt(req.body.id);
    for(let i = 0; i < config.paintings.length; i++) {
        if(id === config.paintings[i]) {
            config.paintings.splice(i, 1);
        }
    }
    fs.writeFile("./db/config.json", JSON.stringify(config), "utf8", () => {
        console.log("Config rewritten")
    })
    res.status(200).end();
})

router.put("/put-up", (req, res) => {
    const id = parseInt(req.body.id);
    const painting = paintings.getItemByID(id);
    if(painting) {
        config.paintings.push(id);
    }
    fs.writeFile("./db/config.json", JSON.stringify(config), "utf8", () => {
        console.log("Config rewritten")
    })
    res.status(200).end();
})

router.get("/memberlist", (req, res) => {
    res.status(200).json(members.get());
})

router.put("/member", (req, res) => {
    const id = parseInt(req.body.id);
    const name = req.body.name;
    const fund = req.body.fund;

    console.log(id, name, fund);

    const member = members.getItemByID(id);
    if(!member){
        res.status(501).end();
        return;
    }

    if(name) member.name = name;
    if(fund) {
        const number = parseInt(fund);
        if(isNaN(number)){
            res.status(501).end();
            return;
        }

        if(number < 1) {
            res.status(401).end();
            return;
        }

        member.fund = number;
    }
    members.rewrite();
    res.status(200).end()
})

router.delete("/members", (req, res) => {
    const id = parseInt(req.body.id);

    if(members.getItemByID(id)) {
        members.removeItemByID(id);
        members.rewrite();
        res.status(200).end();
    } else {
        res.status(501).end();
    }
})

router.post("/members", (req, res) => {
    const name = req.body.name;
    const fund = parseInt(req.body.fund);

    const member = {
        id: 0,
        name: name,
        fund: isNaN(fund) ? 0 : fund
    }

    members.addItem(member);
    members.rewrite();

    res.status(200).redirect(req.get("referer"));
})

router.get("/getconf", (req, res) => {
    const extconf = {
        auction: config.auction,
        paintings: [],
        members: []
    }

    for(const id of config.paintings) {
        extconf.paintings.push(paintings.getItemByID(id).name);
    }

    for(const member of members.get()){
        extconf.members.push(member.name);
    }

    res.status(200).json(extconf);
})

router.post("/config", (req, res) => {
    if(req.body.date && req.body.time && req.body.timeout && req.body.countdown &&req.body.pause) {
        config.auction = req.body;
        fs.writeFileSync("./db/config.json", JSON.stringify(config), "utf8");
        console.log("./db/config.json rewritten");
        res.status(200).end();
    } else {
        res.status(401).end();
    }
})

// unknown
router.get("*", (req, res) => {
    res.status(404).send(errors["404"]);
})

module.exports = router;
