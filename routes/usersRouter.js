const express=require('express');
const userModel = require('../models/user-model');
const Product = require('../models/product-model');
const router= express.Router();
const isLoggedin=require("../middlewares/isLoggedIn");
const {registerUser,loginUser,logout}=require("../controllers/authController");
const { processPurchase, getUserOrders, cancelOrder, getOrderDetails } = require('../controllers/orderController');
const { addToCart, getCart, updateCartItem, removeFromCart, clearCart, getCartCount, isItemInCart } = require('../controllers/cartController');
const { loadUserCart, migrateCartFromSession } = require('../middlewares/cartMiddleware');

router.get("/",function(req,res){
  res.send("hey its working");
});

router.post("/register",registerUser);

router.post("/login",loginUser);

router.get("/logout",logout);

// Cart functionality with Redis
router.post("/add-to-cart", isLoggedin, addToCart);
router.get("/cart", isLoggedin, loadUserCart, async function(req, res) {
  try {
    const user = await userModel.findById(req.user._id);
    
    // Use the properly formatted cart data from the middleware
    // Don't override with raw database cart structure
    const cartData = req.cart || [];
    const cartSummary = req.cartSummary || { totalItems: 0, totalPrice: 0, itemCount: 0, items: [] };
    
    // Debug logging
    console.log('Cart data for user:', req.user._id);
    console.log('Cart items count:', cartData ? cartData.length : 0);
    if (cartData && cartData.length > 0) {
      console.log('First cart item:', JSON.stringify(cartData[0], null, 2));
      console.log('ProductImage type:', typeof cartData[0].productImage);
      console.log('ProductPrice type:', typeof cartData[0].productPrice);
      console.log('ProductPrice value:', cartData[0].productPrice);
    } else {
      console.log('No cart items found');
    }
    
    res.render("cart", { 
      user: {
        ...user.toObject(),
        cart: cartData,
        cartSummary: cartSummary
      }, 
      cart: cartData, 
      cartSummary: cartSummary 
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading cart");
  }
});
router.post("/update-cart-item", isLoggedin, updateCartItem);
router.post("/remove-from-cart/:productId", isLoggedin, removeFromCart);
router.post("/clear-cart", isLoggedin, clearCart);
router.get("/cart-count", isLoggedin, getCartCount);
router.get("/cart-item/:productId", isLoggedin, isItemInCart);

// Cart API endpoints
router.get("/cart-api", isLoggedin, getCart);

// Order management routes
router.post("/buy", isLoggedin, processPurchase);
router.get("/orders", isLoggedin, getUserOrders);
router.post("/cancel-order/:orderId", isLoggedin, cancelOrder);
router.get("/order/:orderId", isLoggedin, getOrderDetails);

module.exports=router;
