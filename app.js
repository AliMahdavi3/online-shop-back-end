const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const User = require('./models/user');

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended : false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    User.findById("6463140aeb82d1b5034c636b").then((user) => {
        req.user = user;
        next();
    }).catch((error) => {
        console.log(error);
    })
});

app.use("/admin", adminRouter);
app.use(shopRouter);

mongoose.connect("mongodb://127.0.0.1/shop")
.then((result) => {
    User.findOne().then((user) => {
            if (!user) {
                const user = new User({
                    name: 'Ali',
                    email: 'Dracula112.com@gmail.com',
                    cart: {
                        items: []
                    }
                });
                user.save();
            } 
    });
    app.listen(3000, () => {
        console.log("Listening On Port 3000");
    });
}).catch((error) => {
    console.log(error.message);
});