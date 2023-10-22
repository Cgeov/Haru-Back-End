const express = require("express");
const authentication = require("../auth/authService");
const operations = require("../service/service");

const router = express.Router();

router.get("/", function (req, res) {
  res.send("Hola Mundo :p");
});

router.use("/auth", authentication);

router.use("/service", operations);

module.exports = router;
