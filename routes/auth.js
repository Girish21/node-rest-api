const express = require("express");
const { body } = require("express-validator/check");

const User = require("../model/user");

const auth = require("../middleware/auth");

const router = express.Router();

const authController = require("../controller/auth");

router.put(
  "/signup",
  [
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail()
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then(user => {
          if (user) return Promise.reject("User already exist!");
        });
      }),
    body("password")
      .trim()
      .isAlphanumeric()
      .isLength({ min: 5 }),
    body("name")
      .trim()
      .isAlphanumeric()
      .not()
      .isEmpty()
      .custom((value, { req }) => {
        return User.findOne({ name: value }).then(user => {
          if (user) return Promise.reject("User already exist!");
        });
      })
  ],
  authController.putSignup
);

router.put(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .normalizeEmail(),
    body("password")
      .trim()
      .isAlphanumeric()
      .isLength({ min: 5 })
  ],
  authController.putLogin
);

module.exports = router;

//
