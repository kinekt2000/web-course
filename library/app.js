if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const flash = require("express-flash");
const session = require("express-session");
const fs = require("fs");

const initializePassport = require("./passport-config");
initializePassport(
    passport,
    (username) => users.find(user => user.username === username),
    (id) => users.find(user => user.id === id)
);

const Library = require("./library");
let suggestions = require("./json/suggestions.json");

const library = new Library();
const users = [];
users.push({
    id: 0,
    username: 'admin',
    name: 'Constantine',
    password: bcrypt.hashSync("27404740", 10)
});


const server = express();
server.set("view engine", "pug");
server.set("views", "./views");
server.use("/public", express.static("public"));

server.use(express.urlencoded({extended: false}));
server.use(flash());
server.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
server.use(passport.initialize());
server.use(passport.session());


/* ROUTES */
server.get("/book/:id", (req, res, next) => {
    const id = parseInt(req.params.id);
    const book = library.getBookByID(id);
    if(book)
        res.render("book", {book: book, authorized: req.user});
    else {
        res.render("pageNotFound", {authorized: req.user});
    }
})

server.get("/suggest", (req, res) => {
    if(req.user) {
        res.render("suggest", {authorized: req.user});
    } else {
        res.render("pageNotFound", {authorized: req.user});
    }
})

server.get("/admin", (req, res) => {
    if(req.user && req.user.username === "admin") {
        res.render("admin", {authorized: req.user});
    } else {
        res.render("pageNotFound", {authorized: req.user});
    }
})

server.get("/", (req, res, next) => {
    res.render("index", {authorized: req.user});
})

/* HANDLE DATA REQUESTS */
server.get("/getBook", (req, res) => {
    const number = req.query.number;
    const filter = {
        rented: (req.query.rented === "true") ? true : (req.query.rented === "false") ? false : undefined,
        date: req.query.date
    }
    res.json(library.getBookByNumber(number, filter));
})

server.get("/getSuggestion", (req, res) => {
    const number = req.query.number;
    res.json(suggestions[number]);
})

server.post("/bookAttribute", (req, res) => {
    let [id, parameter, value] = [req.body.id, req.body.parameter, req.body.value];
    let book = library.getBookByID(parseInt(id));

    if(book) {
        book[parameter] = value;
    }

    res.status(200).end();
})

server.post("/rent", (req, res) => {
    const user = req.user;
    const book = library.getBookByID(parseInt(req.body.id));

    if(!user) {
        req.flash("error", "Error. Please, try again")
        console.warn("Nonexistent user tried to rent book");
        res.end();
    }

    if(!book) {
        req.flash("error", "Error. Please, try again")
        console.warn("User tried to rent nonexistent book");
        res.end();
    }

    if(book.renting) {
        req.flash("error", "Error. Please, try again")
        console.warn("User tried to rent book which already rented");
        res.end();
    }

    let date = new Date();
    date.setDate(date.getDate() + 14);
    console.log(date.getFullYear(), date.getMonth(), date.getDay());

    book.renting = {
        name: user.name,
        username: user.username,
        releaseDate: `${date.getFullYear()}/${date.getMonth()+1}/${date.getDate()}`
    }

    req.flash("success", `Book yours for 14 days`);
    res.end();
})

server.delete("/unrent", (req, res) => {
    const user = req.user;
    const book = library.getBookByID(parseInt(req.body.id));

    if(!user) {
        req.flash("error", "Error. Please, try again")
        console.warn("Nonexistent user tried to return book");
        res.end();
    }

    if(!user) {
        req.flash("error", "Error. Please, try again")
        console.warn("User tried to return nonexistent book");
        res.end();
    }

    if(!book.renting) {
        req.flash("error", "Error. Please, try again")
        console.warn("User tried to return not rented book");
        res.end();
    }

    if(user.username !== book.renting.username) {
        req.flash("error", "Error. Please, try again")
        console.warn("User tried to return not his book");
        res.end();
    }

    book.renting = null;
    req.flash("success", `You returned ${book.name} book. Thank you!`);
    res.end();
})


server.post("/suggest", (req, res) => {
    if(req.isAuthenticated) {
        const suggestion = {
            name: req.body.name,
            author: req.body.author,
            date: `${req.body.year}/${req.body.month}/${req.body.day}`
        }

        suggestions.push(suggestion);
        fs.writeFile("./json/suggestions.json", JSON.stringify(suggestions), "utf8", (err) => {
            if(err) {
                console.error("suggestions are not saved");
            } else {
                console.log("suggestions saved");
            }
        });
    } else {
        console.warn("Nonexistent user tried to suggest a book");
    }

    res.redirect("/");
})


server.post("/addBook", (req, res) => {
    if(req.user && req.user.username === "admin") {
        let book = {
            id: null,
            name: req.body.name,
            author: req.body.author,
            publication: req.body.publication,
            renting: null
        }
        library.addBook(book);
    } else {
        console.warn("Non admin tried to add new book");
    }

    res.end();
})

server.delete("/deleteSuggestion", (req, res) => {

    if(req.user && req.user.username === "admin") {
        for (let i = 0; i < suggestions.length; i++) {
            if (suggestions[i].name !== req.body.name) continue;
            if (suggestions[i].author !== req.body.author) continue;
            if (suggestions[i].date !== req.body.publication) continue;
            suggestions.splice(i, 1);
            break;
        }
    } else {
        console.warn("Non admin tried to delete suggestion");
    }

    res.end();
})

server.delete("/delete", (req, res) => {
    if(req.user && req.user.username === "admin") {
        const id = parseInt(req.body.id);
        library.removeBookByID(id);
    } else {
        console.warn("Not an admin tried to delete book");
    }
})

/* AUTHENTICATION */
server.post("/register", async (req, res) => {
   try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        if(users.find(user => user.username === req.body.username)) {
            req.flash("error", "Sorry, this username is already taken :(");
            res.redirect(req.header("referer"))
        } else {
            users.push({
                id: Date.now().toString(),
                username: req.body.username,
                name: req.body.name,
                password: hashedPassword
            })
            req.flash("success", "Your account registered! Now you can sign in");
            res.redirect(req.header("referer"))
        }
   } catch {
       res.statusMessage = "Error while register";
       req.flash("error", "Sorry, error during registration. Please, try again");
       res.redirect(req.header("referer"));
   }

    console.log(users[users.length - 1]);
});

server.post("/login",
    (req, res, next) => {
        return passport.authenticate(
            'local',
            {failureFlash: true},
            (err, user, info) => {
                if (err) { return next(err); }
                if(!user) {
                    req.flash("error", info.message);
                    return res.redirect(req.header("referer"));
                }
                req.logIn(user, (err) => {
                    if(err) {return next(err);}
                    req.flash("success", "You logged in");
                    return res.redirect(req.header("referer"));
                })

            }
        )(req, res, next);
    }
);

server.delete("/logout", (req, res) => {
    req.logOut();
    res.status(200).end();
});

server.get("*", (req, res) => {
    res.render("pageNotFound", {authorized: req.user});
})

server.listen(process.env.PORT);
console.log("server listens 3000th port");