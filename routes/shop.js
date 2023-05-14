const express = require("express");
const router = express.Router();
const shopController = require("../controllers/shop");

router.get("/", shopController.getIndex);
router.get("/products/:productId", shopController.getProduct);
router.get("/products", shopController.getProducts);

module.exports = router;