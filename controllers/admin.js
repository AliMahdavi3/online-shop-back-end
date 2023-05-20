const Product = require("../models/product");
const { validationResult } = require("express-validator")

exports.getProduct = (req, res, next) => {
    Product.find({
        userId : req.user._id,
    }).then((products) => {
        res.render("admin/products", {
            prods : products,
            pageTitle : "Admin Products",
            path : "/admin/products",
            isAuthenticated : req.session.isLoggedIn,
        });
    }).catch((error) => {
        const MainError = new Error(error);
        MainError.httpStatusCode = 500;
        return next(error);
    });
};

exports.getAddProduct = (req, res, next) => {
    res.render("admin/add-product", {
        path : "/admin/add-product",
        pageTitle : "Add Product",
        editing : false,
        isAuthenticated : req.session.isLoggedIn,
        hasError : false,
        validationErrors : [],
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const price = req.body.price;
    const imageUrl = req.file;
    const description = req.body.description;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        console.log(errors.array());

        return res.render("admin/add-product", {
            path : "/admin/add-product",
            pageTitle : "Add Product",
            editing : false,
            isAuthenticated : req.session.isLoggedIn,
            product : {
                title : title,
                imageUrl : imageUrl,
                price : price,
                description : description,
            },
            errorMessage : errors.array()[0].msg,
            hasError : true,
            validationErrors : errors.array()
        });
    };

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

exports.getEditProduct = (req, res, next) => {
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
            isAuthenticated : req.session.isLoggedIn,
            hasError : false,
            validationErrors : [],
        });
    }).catch((error) => {
        const MainError = new Error(error);
        MainError.httpStatusCode = 500;
        return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updateTitle = req.body.title;
    const updatePrice = req.body.price;
    const updateImageUrl = req.body.imageUrl;
    const updateDesc = req.body.description;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {
        return res.render("admin/add-product", {
            path : "/admin/add-product",
            pageTitle : "Add Product",
            editing : true,
            isAuthenticated : req.session.isLoggedIn,
            validationErrors : errors.array(),
            product : {
                title : updateTitle,
                imageUrl : updateImageUrl,
                price : updatePrice,
                description : updateDesc,
                _id : prodId,
            },
            errorMessage : errors.array()[0].msg,
            hasError : true,
        });
    }

    Product.findById(prodId).then((product) => {

        if(product.userId.toString() !== req.user._id.toString()) {
            return res.redirect("/");
        };

        product.title = updateTitle;
        product.price = updatePrice;
        product.imageUrl = updateImageUrl;
        product.description = updateDesc;
        return product.save().then((result) => {
            console.log("Product Updated...!");
            res.redirect("/");
        })
    }).catch((error) => {
        const MainError = new Error(error);
        MainError.httpStatusCode = 500;
        return next(error);
    });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({
        _id : prodId,
        userId : req.user._id,
    }).then(() => {
        console.log("Product Removed...!");
        res.redirect("/admin/products");
    }).catch((error) => {
        const MainError = new Error(error);
        MainError.httpStatusCode = 500;
        return next(error);
    });
};