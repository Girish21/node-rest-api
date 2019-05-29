const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const routes = require("./routes/feed");

app.use(bodyParser.json({ extended: false }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, PUT, POST, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/feed", routes);

app.listen(8080);
