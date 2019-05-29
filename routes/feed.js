const express = require("express");

const feedController = require("../controller/feed");

const router = express.Router();

router.get("/posts", feedController.getPosts);

module.exports = router;
