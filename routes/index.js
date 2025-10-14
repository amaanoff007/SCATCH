const express = require('express');
const router = express.Router();
const isLoggedin = require("../middlewares/isLoggedIn");
const Product = require("../models/product-model");
const ProductCacheService = require("../services/productCacheService");
const CartService = require("../services/cartService");

router.get("/", function(req, res){
   const errors = req.flash("error");
   res.render("index", { error: errors[0] });
});

router.get("/shop", isLoggedin, async function(req, res){
    try {
        // Get owner filter from query parameters
        const ownerId = req.query.owner;
        
        let products;
        if (ownerId) {
            // Get products by specific owner with caching
            products = await ProductCacheService.getProductsByOwner(ownerId);
        } else {
            // Get all products with caching
            products = await ProductCacheService.getAllProducts();
        }
        
        // Get all owners for the filter dropdown
        const Owner = require("../models/owner-models");
        const owners = await Owner.find({}, 'fullname');

        // pass products into EJS
        res.render("shop", { products, owners, selectedOwner: ownerId });
    } catch (err) {
        console.error("Error loading products:", err);
        res.status(500).send("Error loading shop");
    }
});
// Route to show products by specific owner
router.get("/owner/:ownerId", isLoggedin, async function(req, res){
    try {
        const ownerId = req.params.ownerId;
        
        // Get products by specific owner with caching
        const products = await ProductCacheService.getProductsByOwner(ownerId);
        
        // Get all owners for the filter dropdown
        const Owner = require("../models/owner-models");
        const owners = await Owner.find({}, 'fullname');

        // pass products into EJS
        res.render("shop", { products, owners, selectedOwner: ownerId });
    } catch (err) {
        console.error("Error loading owner products:", err);
        res.status(500).send("Error loading owner products");
    }
});

router.get("/logout", function(req,res){
    res.cookie("token", "");
    res.redirect("/");
})
module.exports = router;
