const express = require("express");
const authentication = require("../auth/authService")

const router = express.Router();

router.get('/', function(req, res) {
    res.send('Hola Mundo :p');
});

router.use("/auth",authentication);


module.exports =  router;


