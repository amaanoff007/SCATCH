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
        // Get owner filter from query parameters
        const ownerId = req.query.owner;
        
        let query = {};
        if (ownerId) {
            query.owner = ownerId;
        }
        
        // fetch products from MongoDB with optional owner filter
        const products = await Product.find(query).populate('owner', 'fullname');
        
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
        
        // fetch products from specific owner
        const products = await Product.find({ owner: ownerId }).populate('owner', 'fullname');
        
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
