const bcrypt = require("bcryptjs")
const User = require("../models/user");
const sendEmail = require("../utils/email");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

exports.getLogin = (req, res) => {
    let message = req.flash("error");
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null
    };
    res.render("auth/login", {
        path : "/login",
        pageTitle : "ورود",
        errorMessage : message,
        successMessage : req.flash("success"),
        validationErrors : [],
    });
};

exports.postLogin = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.render("auth/login", {
            path : "/login",
            pageTitle : "ورود",
            errorMessage : errors.array()[0].msg,
            successMessage : req.flash("success"),
            validationErrors : errors.array(),
        });
    }

    User.findOne({
        email : email,
    }).then((user) => {
        if(!user) {
            req.flash("error", "!...ایمیل شما اشتباه است");
            return res.redirect("/login")
        }

        bcrypt.compare(password,user.password).then((isMatch) => {
            if(isMatch) {
                req.session.isLoggedIn = true;
                req.session.user = user;
                return req.session.save((error) => {
                    console.log(error);
                    res.redirect("/");
                });
            }
            req.flash("error", "!...رمز عبور شما اشتباه است");
            res.redirect("/login")
        })
    })
};

exports.postLogout = (req, res) => {
    req.session.destroy((error) => {
        console.log(error);
        res.redirect("/");
    });
};

exports.getSignup = (req, res) => {
    res.render("auth/signup", {
        path : "/signup",
        pageTitle : "ثبت نام",
        errorMessage : req.flash("error")[0],
        oldInput : {
            email : "",
            password : "",
            confirmPassword : "",
        },
        validationErrors : [],
    });
};

exports.postSignup = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;
    const errors = validationResult(req);

    if(!errors.isEmpty()) {

        console.log(errors.array());

        return res.status(422).render("auth/signup", {
            path : "/signup",
            pageTitle : "ثبت نام",
            errorMessage : errors.array()[0].msg,
            oldInput : {
                email : email,
                password : password,
                confirmPassword : confirmPassword,
            },
            validationErrors : errors.array()
        });
    }

    User.findOne({
        email : email
    }).then((userDoc) => {
        if(userDoc) {
            req.flash("error", "!...شخص دیگری با این ایمیل ثبت نام کرده است");
            return res.redirect("/signup");
        };

        return bcrypt.hash(password, 12).then((hashedPassword) => {
            const user = new User({
                email : email,
                password : hashedPassword,
                cart : {
                    items : []
                },
            });
            return user.save();
        })
    }).then((result) => {
        req.flash("success", "!...ثبت نام انجام شد, میتوانید وارد شوید");
        sendEmail({
            subject : "ثبت نام", 
            text : "ثبت نام با موفقیت انجام شد",
            userEmail : email,
        });
        res.redirect("/login");
    }).catch((error) => {
        console.log(error);
    });
};

exports.getReset = (req, res) => {

    let message = req.flash("error");
    if(message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render("auth/reset", {
        path : "/reset",
        pageTitle : "بازیابی رمز عبور",
        errorMessage : message,
    });
};

exports.postReset = (req, res) => {

    crypto.randomBytes(32, (err, buffer) => {
        if(err) {
            console.log(err);
            return res.redirect("/reset");
        };

        const token = buffer.toString("hex");
        User.findOne({
            email : req.body.email,
        }).then((user) => {
            if(!user) {
                req.flash("error", "!...ایمیلی با این مشخصات موجود نیست");
                return res.redirect("/reset");
            }
            user.resetToken = token;
            user.ExpiredDateresetToken = Date.now() + 3600000;
            return user.save();
        }).then((result) => {
            res.redirect("/");
            sendEmail({
                userEmail : req.body.email,
                subject : "بازیابی رمز عبور",
                html : `<p>درخواست بازیابی رمز عبور</p>
                <p>برای بازیابی رمز عبور<a href="http://localhost:3000/reset/${token}">کلیک کنید</a></p>`
            });
        }).catch((error) => {
            console.log(error);
        })
    });
}

exports.getReserPassword = (req, res) => {
    const token = req.params.token;

    User.findOne({
        resetToken : token,
        ExpiredDateresetToken : {$gt : Date.now()},
    }).then((user) => {
        let message = req.flash("error");
        if(message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render("auth/new-password", {
            path : "/new-password",
            pageTitle : "بازیابی رمز عبور",
            errorMessage : message,
            userId : user._id.toString(),
            passwordToken : token,
        });
    }).catch((error) => {
        console.log(error);
    });
};

exports.postNewPassword = (req, res) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({
        resetToken : passwordToken,
        ExpiredDateresetToken : {$gt : Date.now()},
        _id : userId,
    }).then((user) => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    }).then((hashedPassword) => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = undefined;
        resetUser.ExpiredDateresetToken = undefined;
        return resetUser.save();
    }).then((result) => {
        console.log(result);
        res.redirect("/login");
    }).catch((error) => {
        console.log(error);
    });
};