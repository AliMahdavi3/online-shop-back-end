const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const multer = require("multer");
const errorController = require("./controllers/error")
const csrf = require("csurf");
const flash = require("connect-flash");
const User = require('./models/user');
const app = express();
const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, "images");
    },
    filename : (req, file, cb) => {
        cb(null, new Date().toDateString() + "_" +file.originalname);
    },
});
const fileFilter = (req, file, cb) => {

    if(file.mimetype === "image/png" 
    || file.mimetype === "image/jpg" 
    || file.mimetype === "image/jpeg"){
        cb(null, true);
    } else {
        cb(null, false);
    };
};
let port = process.env.PORT || 3001;
let host = process.env.HOST;
let databaseName = process.env.DATABASE_NAME;
let databaseHost = process.env.DATABASE_HOST;

const MONGODB_URI = "mongodb://127.0.0.1/shop";
const store = new MongoDBStore({
    uri : MONGODB_URI,
    collection : "session"
});
app.set("view engine", "ejs");
app.set("views", "views");

const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");
const authRouter = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended : false }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/images",express.static(path.join(__dirname, "images")));
app.use(multer({
    storage : fileStorage,
    fileFilter : fileFilter,
}).single("image"))
app.use(session({
    secret : "my secret",
    resave : false,
    saveUninitialized : false,
    store : store,
}));
app.use(csrfProtection);
app.use(flash());
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();
});
app.use((req, res, next) => {
    // throw new Error("Error")
    if(!req.session.user) {
        return next();
    }
    User.findById(req.session.user._id).then((user) => {
        req.user = user;
        next();
    }).catch((error) => {
        throw new Error(error);
    })
});
app.use((error, req, res, next) => {
    res.status(500).render("500", {
        pageTitle : "Error",
        path : "/500",
        isAuthenticated : req.session.isLoggedIn,
    });
});

app.use("/admin", adminRouter);
app.use(shopRouter);
app.use(authRouter);

app.get("/500", errorController.get500);


mongoose.connect(MONGODB_URI)
.then((result) => {
    app.listen(3000, () => {
        console.log("URL :" + `http://localhost:3000/`);
    });
}).catch((error) => {
    console.log(error.message);
});