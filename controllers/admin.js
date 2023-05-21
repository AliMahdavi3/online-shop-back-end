const Product = require("../models/product");
const { validationResult } = require("express-validator");
const fileHelper = require("../utils/file");

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
    const image = req.file;
    const description = req.body.description;
    const errors = validationResult(req);

    if(!image) {
        return res.render("admin/add-product", {
            path : "/admin/add-product",
            pageTitle : "Add Product",
            editing : false,
            isAuthenticated : req.session.isLoggedIn,
            product : {
                title : title,
                imageUrl : image,
                price : price,
                description : description,
            },
            errorMessage : "لطفا عکس وارد کنید",
            hasError : true,
            validationErrors : [],
        });
    }

    if(!errors.isEmpty()) {
        console.log(errors.array());

        return res.render("admin/add-product", {
            path : "/admin/add-product",
            pageTitle : "Add Product",
            editing : false,
            isAuthenticated : req.session.isLoggedIn,
            product : {
                title : title,
                imageUrl : image,
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
        imageUrl : image.path,
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
    const image = req.file;
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
        if(image) {
            fileHelper.deleteFile(product.imageUrl);
            product.imageUrl = image.path;
        }
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

exports.deleteProduct = (req, res, next) => {
    const prodId = req.params.productId;

    Product.findById(prodId).then((product) => {
        if(!product) {
            return next(new Error("Product Not Found...!"));
        };
        fileHelper.deleteFile(product.imageUrl);
        return Product.deleteOne({
            _id : prodId,
            userId : req.user._id,
        });
    }).then(() => {
        console.log("Product Removed...!");
        res.json({message : "successfull"});
    }).catch((error) => {
        res.json({message : "delete has been faild...!"});
    });
};