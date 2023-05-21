const Product = require("../models/product");
const Order = require("../models/order");
const cookieParser = require("../utils/cookieParser");
const path = require("path");
const fs = require("fs");
const PDFDocument = require("pdfkit");
const ZarinpalCheckout = require("zarinpal-checkout");
const product = require("../models/product");
const ITEMS_PER_PAGE = 3;

let zarinPal = ZarinpalCheckout.create("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx", true);

exports.getProducts = (req, res) => {
  const pageNum = +req.query.page || 1;
  let totalItems;

  Product.find().count().then((numProduct) => {
    totalItems = numProduct;
    return product.find().skip((pageNum - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);

  }).then((products) => {
      res.render("shop/products-list", {
        path: "/",
        pageTitle: "Shop",
        prods: products,
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
        currentPage : pageNum,
        totalProducts : totalItems,
        hasNextPage : ITEMS_PER_PAGE * pageNum < totalItems,
        hasPrevPage : pageNum > 1,
        nextPage : pageNum + 1,
        prevPage : pageNum - 1,
        lastpage : Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
};

exports.getIndex = (req, res) => {
  const pageNum = +req.query.page || 1;
  let totalItems;

  Product.find().count().then((numProduct) => {
    totalItems = numProduct;
    return product.find().skip((pageNum - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE);

  }).then((products) => {
      res.render("shop/index", {
        path: "/",
        pageTitle: "Shop",
        prods: products,
        isAuthenticated: req.session.isLoggedIn,
        csrfToken: req.csrfToken(),
        currentPage : pageNum,
        totalProducts : totalItems,
        hasNextPage : ITEMS_PER_PAGE * pageNum < totalItems,
        hasPrevPage : pageNum > 1,
        nextPage : pageNum + 1,
        prevPage : pageNum - 1,
        lastpage : Math.ceil(totalItems / ITEMS_PER_PAGE),
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
};

exports.getProduct = (req, res) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detaile", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.session.isLoggedIn,
      });
    })
    .catch((error) => {
      console.log(error.message);
    });
};

exports.postCart = (req, res) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      req.user.addTocart(product);
      res.redirect("/products");
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getCart = async (req, res) => {
  const user = await req.user.populate("cart.items.productId");

  res.render("shop/cart", {
    pageTitle: "Cart",
    path: "/cart",
    products: user.cart.items,
    isAuthenticated: req.session.isLoggedIn,
  });
};

exports.postCartDeleteProduct = (req, res) => {
  const prodId = req.body.productId;
  req.user
    .removeCart(prodId)
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.postOrder = (req, res) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return {
          quantity: i.quantity,
          product: { ...i.productId._doc },
        };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then((result) => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((error) => {
      console.log(error);
    });
};

exports.getOrder = (req, res) => {
  Order.find({
    "user.userId": req.user._id,
  }).then((orders) => {
    console.log(orders);
    res.render("shop/orders", {
      pageTitle: "Orders",
      path: "orders",
      orders: orders,
      isAuthenticated: req.session.isLoggedIn,
      refId : req.flash("refId")[0],
    });
  });
};

exports.getCheckOut = async (req, res) => {
  const user = await req.user.populate("cart.items.productId");
  const products = user.cart.items;
  let totalPrice = 0;
  products.forEach((p) => {
    totalPrice += p.quantity * p.productId.price;
  });
  res.render("shop/checkout", {
    pageTitle: "checkout",
    path: "/checkout",
    products: user.cart.items,
    isAuthenticated: req.session.isLoggedIn,
    totalSum : totalPrice,
  });
}

exports.getPayment = async (req, res) => {
  const user = await req.user.populate("cart.items.productId");
  const products = user.cart.items;
  let totalPrice = 0;
  products.forEach((p) => {
    totalPrice += p.quantity * p.productId.price;
  });

  zarinPal.PaymentRequest({
    Amount : totalPrice,
    CallbackURL : "http://localhost:3000/checkPaymant",
    Description : "اتصال به درگاه پرداخت",
    Email : user.email,
    Mobile : "09012559469",
  }).then((response) => {
    console.log(response);
    res.redirect(response.url)
  }).catch((error) => {
    console.log(error)
  });
};

exports.getCheckPaymant = async (req, res) => {
  const user = await req.user.populate("cart.items.productId");
  const products = user.cart.items;
  let totalPrice = 0;
  products.forEach((p) => {
    totalPrice += p.quantity * p.productId.price;
  });
  const authority = req.query.Authority;
  const status = req.query.Status;

  if(status == "OK"){
    zarinPal.PaymentVerification({
      Amount : totalPrice,
      Authority : authority,
    }).then((response) => {
      if(response.status == 100) {
        console.log("Verified" + response.RefID);
         req.user
          .populate("cart.items.productId")
            .then((user) => {
              const products = user.cart.items.map((i) => {
                return {
                  quantity: i.quantity,
                  product: { ...i.productId._doc },
                };
              });
              const order = new Order({
                user: {
                  email: req.user.email,
                  userId: req.user,
                },
                products: products,
              });
              return order.save();
            })
            .then((result) => {
              return req.user.clearCart();
            })
            .then(() => {
              req.flash("refId", response.RefID);
              res.redirect("/orders");
            })
            .catch((error) => {
              console.log(error);
            });
            };
        });
  } else if(status == "NOK") {
    res.redirect("/cart");
  };
};

exports.getInvoices = (req, res, next) => {
  const orderId = req.params.orderId;
  Order.findById(orderId)
    .then((order) => {
        if (!order) {
          return next(new Error("No Error Found...!"));
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
          return next(new Error("unAuthorized...!"));
        }

        const invoiceName = "invoices-" + orderId + ".pdf";
        const invoicePath = path.join("pdf", "invoices", invoiceName);

        const pdfDoc = new PDFDocument();
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader( "Content-Disposition", "attachment; filename='" + invoiceName + '"');
        pdfDoc.pipe(fs.createWriteStream(invoicePath));
        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text("Hello Dear User", {
          underline : true,
        });
        pdfDoc.text("-----------------------------------");

        let totalPrice = 0;
        order.products.forEach((prod) => {
          totalPrice += prod.quantity * prod.product.price;
          pdfDoc.fontSize(20).text(prod.quantity + " x " + prod.product.price + "Rial");
        });
        pdfDoc.text("Total Price :" + totalPrice);



        pdfDoc.end();



        // fs.readFile(invoicePath, (err, data) => {
        //   if (err) {
        //     return next(err);
        //   }
        //   res.setHeader("Content-Type", "application/pdf");
        //   res.setHeader(
        //     "Content-Disposition",
        //     "attachment; filename='" + invoiceName + '"'
        //   );

        //   res.send(data);
        // });


        // const file = fs.createReadStream(invoicePath);

        //   file.pipe(res);

    })
    .catch((error) => {
      next(error);
    });
};
