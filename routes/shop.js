const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop");
const isAuth = require("../middleware/isAuth");

// Shop Routes
router.get("/", shopController.getIndex);
router.get("/products/:productId", shopController.getProduct);
router.get("/products", shopController.getProducts);
router.post("/cart", shopController.postCart);
router.get("/cart", shopController.getCart);
router.post("/cart-delete-item", shopController.postCartDeleteProduct);
router.get("/checkout", isAuth, shopController.getCheckOut);
router.get("/paymentRequest", isAuth, shopController.getPayment);
router.get("/checkPaymant", isAuth, shopController.getCheckPaymant);
router.post("/create-order", shopController.postOrder);
router.get("/orders", shopController.getOrder);
router.get("/invoices/:orderId", shopController.getInvoices);

module.exports = router;