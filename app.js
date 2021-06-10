require('dotenv').config();

const express = require('express');
const bodyParser = require(`body-parser`);
const ejs = require("ejs");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");


const app = express();
const port = 3000;

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
    secret: "Our little Secret.",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

mongoose.set("useCreateIndex", true)
const userSchema = new mongoose.Schema({
    email: String,
    password: String,
});

userSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
    res.send("home");
})

app.get("/login", (req, res) => {
    res.send("login page");
})

app.get("/register", (req, res) => {
    res.send("register page");
})

app.get("/logout", (req, res) => {
    req.logout();
    res.send("logged out");
})

app.post("/register", (req, res) => {
    User.register({ username: req.body.username }, req.body.password, function(err, user) {
        if (err) {
            console.log(err)
            res.send(err)
        } else {
            passport.authenticate("local")(req, res, function() {
                res.send("registered")
            })
        }
    })
});

app.post("/login", (req, res) => {
    const header = req.header;
    console.log(header);
    const user = new User({
        username: req.body.username,
        password: req.body.password
    });

    req.login(user, (err) => {
        if (err) {
            console.log(err);
        } else {
            passport.authenticate("local")(req, res, () => {
                res.send("logged in");
            })
        }
    })
})

app.listen(port, () => console.log(`Example app listening on port port!`))