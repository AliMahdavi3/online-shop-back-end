const express = require("express");
const router = express.Router();
const { check, body } = require("express-validator");
const adminController = require("../controllers/admin");
const isAuth = require("../middleware/isAuth");

router.get("/add-product", isAuth, adminController.getAddProduct);
router.post("/add-product", [
    body("title", "حداقل 5 کاراکتر برای عنوان").isString().isLength({min:5}).trim(),
    body("price", "لطفا قیمت را به صورت عدد وارد کنید").isFloat(),
    body("description", "توضیحات حداقل 5 کاراکتر است").isLength({min:5}).trim(),
] ,isAuth, adminController.postAddProduct);
router.get("/products", isAuth, adminController.getProduct);
router.get("/edit-product/:productId", isAuth, adminController.getEditProduct);
router.post("/edit-product", [
    body("title", "حداقل 5 کاراکتر برای عنوان").isString().isLength({min:5}).trim(),
    body("price", "لطفا قیمت را به صورت عدد وارد کنید").isFloat(),
    body("description", "توضیحات حداقل 5 کاراکتر است").isLength({min:5}).trim(),
] ,isAuth, adminController.postEditProduct);
router.post("/delete-product", isAuth, adminController.postDeleteProduct);

module.exports = router;