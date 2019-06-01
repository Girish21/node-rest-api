const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWTSecret = process.env.JWT_WEB_SECRET;

module.exports = (req, res, next) => {
  if (req.get("Authorization")) {
    const token = req.get("Authorization").split(" ")[1];
    let decodedToken;
    try {
      decodedToken = jwt.verify(token, JWTSecret);
    } catch (err) {
      err.status = 500;
      throw err;
    }
    if (!decodedToken) {
      const error = new Error("Not Authenticated");
      error.status = 401;
      throw error;
    }
    req.userId = decodedToken.userId;
  } else {
    const error = new Error("Not Authenticated");
    error.status = 401;
    throw error;
  }
  next();
};
