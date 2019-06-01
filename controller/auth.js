const Bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator/check");
require("dotenv").config();

const User = require("../model/user");

const JWTSecret = process.env.JWT_WEB_SECRET;

exports.putSignup = async (req, res, next) => {
  const err = validationResult(req);

  if (!err.isEmpty()) {
    const error = new Error("Validation Failed, entered data is incorrect");
    error.statusCode = 422;
    error.data = err.array();
    throw error;
  }

  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;

  try {
    const hash = await Bcrypt.hash(password, 12);
    const newUser = new User({
      name: name,
      email: email,
      password: hash,
      status: "Active"
    });
    await newUser.save();
    res.status(200).json({
      message: "User successfully Signed Up"
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.putLogin = async (req, res, next) => {
  const err = validationResult(req);

  if (!err.isEmpty()) {
    const error = new Error("Validation Failed, entered data is incorrect");
    error.statusCode = 422;
    error.data = err.array();
    throw error;
  }

  const email = req.body.email;
  const password = req.body.password;
  let loggedInUser;
  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      const error = new Error("No User found");
      error.statusCode = 404;
      error.data = err.array();
      throw error;
    }
    loggedInUser = user;
    const result = await Bcrypt.compare(password, user.password);

    if (result) {
      const token = jwt.sign(
        {
          email: loggedInUser.email,
          userId: loggedInUser._id.toString()
        },
        JWTSecret,
        { expiresIn: "1h" }
      );
      return res
        .status(200)
        .json({ token: token, userId: loggedInUser._id.toString() });
    } else
      return res.status(422).json({ message: "Invalid Email or Password" });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};
