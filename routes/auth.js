const express = require("express");
const { check, body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/auth");

router.get("/login", authController.getLogin);
router.post("/login", [check("email").isEmail().normalizeEmail()
.withMessage("لطفا یک ایمیل معتبر وارد کنید"), check("password").isLength({min : 5 , max: 30}).isAlphanumeric().trim()], authController.postLogin);
router.post("/logout", authController.postLogout);
router.get("/signup", authController.getSignup);
router.post(
  "/signup",
  [
    check("email").isEmail().withMessage("لطفا یک ایمیل معتبر وارد کنید").normalizeEmail().trim(),
    body("password", "رمز عبور باید حداقل 8 کاراکتر و شامل حروف و اعداد باشد").isLength({
        min: 8,
      }).isAlphanumeric().trim(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("عدم تطابق در تکرار رمز عبور");
      }
      return true;
    }).trim(),
  ],
  authController.postSignup
);
router.get("/reset", authController.getReset);
router.post("/reset", authController.postReset);
router.get("/reset/:token", authController.getReserPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
