const Product = require("../models/product");

exports.getAddProduct = (req, res) => {
    res.render("admin/add-product", {
        path : "/admin/add-product",
        pageTitle : "Add Product",
    });
};

exports.postAddProduct = (req, res) => {
    const title = req.body.title;
    const price = req.body.price;
    const imageUrl = req.body.imageUrl;
    const description = req.body.description;

    const product = new Product({
        title : title,
        price : price,
        imageUrl : imageUrl,
        description : description,
    });
    product.save().then((result) => {
        // console.log("Product Created");
        res.redirect("/");
    });
};