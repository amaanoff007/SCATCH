const express = require('express');
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedIn");
const Product = require("../models/product-model"); // <-- import product schema

router.get("/", function(req, res){
   const errors = req.flash("error");
   res.render("index", { error: errors[0] });
});

router.get("/shop", isLoggedin, async function(req, res){
    try {
        // fetch products from MongoDB
        const products = await Product.find();

        // pass products into EJS
        res.render("shop", { products });
    } catch (err) {
        console.error("Error loading products:", err);
        res.status(500).send("Error loading shop");
    }
});
router.get("/logout",isLoggedin,function(req,res){
    res.render("shop");
})
module.exports = router;
