const express = require('express');
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedIn");

router.get("/", function(req, res){
   const errors = req.flash("error");   // array of messages
   res.render("index", { error: errors[0] }); // send first message
});

router.get("/shop", isLoggedin, function(req, res){
    res.render("shop");
});

module.exports = router;
