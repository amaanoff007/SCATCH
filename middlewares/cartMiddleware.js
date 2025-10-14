const DatabaseCartService = require('../services/databaseCartService');

// Middleware to load user's cart from Redis
const loadUserCart = async (req, res, next) => {
  try {
    if (req.user && req.user._id) {
      // Load cart from database
      const cartItems = await DatabaseCartService.getCart(req.user._id);
      const cartSummary = await DatabaseCartService.getCartSummary(req.user._id);
      
      // Attach cart data to request
      req.cart = cartItems;
      req.cartSummary = cartSummary;
      
      // Make cart data available to views
      res.locals.cart = cartItems;
      res.locals.cartCount = cartSummary.totalItems;
      res.locals.cartTotal = cartSummary.totalPrice;
    } else {
      // No user logged in
      req.cart = [];
      req.cartSummary = { totalItems: 0, totalPrice: 0, itemCount: 0, items: [] };
      res.locals.cart = [];
      res.locals.cartCount = 0;
      res.locals.cartTotal = 0;
    }
    
    next();
  } catch (error) {
    console.error('Error loading user cart:', error);
    // Fallback to empty cart
    req.cart = [];
    req.cartSummary = { totalItems: 0, totalPrice: 0, itemCount: 0, items: [] };
    res.locals.cart = [];
    res.locals.cartCount = 0;
    res.locals.cartTotal = 0;
    next();
  }
};

// Middleware to migrate cart from session to Redis (for existing users)
const migrateCartFromSession = async (req, res, next) => {
  try {
    if (req.user && req.user._id && req.session.cart && req.session.cart.length > 0) {
      // Migrate cart from session to database
      await DatabaseCartService.migrateCartFromSession(req.user._id, req.session.cart);
      
      // Clear session cart after migration
      req.session.cart = [];
      
      console.log(`✅ Migrated cart from session to Redis for user ${req.user._id}`);
    }
    
    next();
  } catch (error) {
    console.error('Error migrating cart from session:', error);
    next();
  }
};

module.exports = {
  loadUserCart,
  migrateCartFromSession
};

