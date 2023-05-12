const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const app = express();

app.set("view engine", "ejs");
app.set("views", "views");
const adminRouter = require("./routes/admin");
const shopRouter = require("./routes/shop");

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended : false }));
app.use("/admin", adminRouter);
app.use(shopRouter);

mongoose.connect("mongodb://localhost:27017/shop").then((result) => {
    app.listen(3000, () => {
        console.log("Listening On Port 3000");
    })
}).catch((error) => {
    console.log(error.message);
});