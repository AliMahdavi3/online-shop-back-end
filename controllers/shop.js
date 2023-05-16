const Product = require("../models/product");

exports.getProducts = (req, res) => {
    Product.find().then((products) => {
        res.render("shop/products-list", {
            prods : products,
            pageTitle : "All Products",
            path : "/products"
        })
    })
}

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

exports.getProduct = (req, res) => {
    const prodId = req.params.productId;
    Product.findById(prodId).then((product) => {
        res.render("shop/product-detaile", {
            product : product,
            pageTitle : product.title,
            path : "/products"
        });
    }).catch((error) => {
        console.log(error.message);
    });
};

exports.postCart = (req, res) => {
    const prodId = req.body.productId;
    Product.findById(prodId).then((product) => {
        req.user.addTocart(product);
        res.redirect("/products");
    }).catch((error) => {
        console.log(error);
    });
};

exports.getCart = async (req, res) => {
    const user = await req.user.populate("cart.items.productId");

    res.render("shop/cart", {
        pageTitle : "Cart",
        path : "/cart",
        products : user.cart.items,
    });
};

exports.postCartDeleteProduct = (req, res) => {
    const prodId = req.body.productId;
    req.user.removeCart(prodId).then((result) => {
        console.log(result);
        res.redirect("/cart");
    }).catch((error) => {
        console.log(error);
    });
};