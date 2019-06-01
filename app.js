const express = require("express");
const bodyParser = require("body-parser");
require("dotenv").config();

const path = require("path");

const app = express();

const mongoose = require("mongoose");

const multer = require("multer");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");

const MONGO_DB_URI = process.env.MONGO_DB_URI;

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      new Date().toISOString().replace(/:/g, "-") + "-" + file.originalname
    );
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  )
    cb(null, true);
  else cb(null, false);
};

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/images", express.static(path.join(__dirname, "images")));
app.use(bodyParser.json({ extended: false }));
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single("image")
);

app.use("/auth", authRoutes);
app.use("/feed", feedRoutes);

app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message;
  const data = err.data || [];
  console.log(err);
  res.status(status).json({ message: message, data: data });
});

mongoose.connect(MONGO_DB_URI, { useNewUrlParser: true }, err => {
  if (!err) app.listen(8080);
});
