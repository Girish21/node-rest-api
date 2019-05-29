const express = require("express");
const app = express();

const routes = require("./routes/feed");

app.use("/feed", routes);

app.listen(8080);
