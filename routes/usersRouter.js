const express=require('express');
const userModel = require('../models/user-model');
const Product = require('../models/product-model');
const router= express.Router();
const isLoggedin=require("../middlewares/isLoggedIn");
const {registerUser,loginUser,logout}=require("../controllers/authController");

router.get("/",function(req,res){
  res.send("hey its working");
});

router.post("/register",registerUser);

router.post("/login",loginUser);

router.get("/logout",logout);

// Cart functionality
router.post("/add-to-cart", isLoggedin, async function(req, res) {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await Product.findById(productId);
    
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const user = await userModel.findById(req.user._id);
    const existingItem = user.cart.find(item => item.product.toString() === productId);
    
    if (existingItem) {
      existingItem.quantity += parseInt(quantity);
    } else {
      user.cart.push({
        product: productId,
        quantity: parseInt(quantity)
      });
    }
    
    await user.save();
    res.json({ success: true, message: "Product added to cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error adding to cart" });
  }
});

router.get("/cart", isLoggedin, async function(req, res) {
  try {
    const user = await userModel.findById(req.user._id).populate('cart.product');
    res.render("cart", { user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading cart");
  }
});

router.post("/remove-from-cart", isLoggedin, async function(req, res) {
  try {
    const { productId } = req.body;
    const user = await userModel.findById(req.user._id);
    
    user.cart = user.cart.filter(item => item.product.toString() !== productId);
    await user.save();
    
    res.json({ success: true, message: "Product removed from cart" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error removing from cart" });
  }
});

module.exports=router;
