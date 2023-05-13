const Product = require("../models/product");

exports.getIndex = (req, res) => {
    Product.find().then((products) => {
        res.render("shop/index", {
            path : "/",
            pageTitle : "Shop",
            prods : products,
        });
    }).catch((error) => {
        console.log(error.message);
    });
};