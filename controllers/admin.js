const Product = require("../models/product");

exports.getProduct = (req, res) => {
    Product.find().then((products) => {
        res.render("admin/products", {
            prods : products,
            pageTitle : "Admin Products",
            path : "/admin/products",
        });
    }).catch((error) => {
        console.log(error.message);
    });
};

exports.getAddProduct = (req, res) => {
    res.render("admin/add-product", {
        path : "/admin/add-product",
        pageTitle : "Add Product",
        editing : false,
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
        userId : req.user,
    });
    product.save().then((result) => {
        // console.log("Product Created");
        res.redirect("/");
    });
};

exports.getEditProduct = (req, res) => {
    const editMode = req.query.edit;
    if(!editMode) {
        return res.redirect("/");
    }
    const prodId = req.params.productId;
    Product.findById(prodId).then((product) => {
        if(!product) {
            return res.redirect("/");
        }
        res.render("admin/add-product", {
            pageTitle : "Edit Product",
            path : "/admin/edit-product",
            editing : editMode,
            product : product,
        });
    }).catch((error) => {
        console.log(error.message);
    });
};

exports.postEditProduct = (req, res) => {
    const prodId = req.body.productId;
    const updateTitle = req.body.title;
    const updatePrice = req.body.price;
    const updateImageUrl = req.body.imageUrl;
    const updateDesc = req.body.description;

    Product.findById(prodId).then((product) => {
        product.title = updateTitle;
        product.price = updatePrice;
        product.imageUrl = updateImageUrl;
        product.description = updateDesc;
        return product.save();
    }).then((result) => {
        console.log("Product Updated...!");
        res.redirect("/");
    })
};

exports.postDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    Product.findByIdAndRemove(prodId).then(() => {
        console.log("Product Removed...!");
        res.redirect("/admin/products");
    }).catch((error) => {
        console.log(error.message);
    });
};