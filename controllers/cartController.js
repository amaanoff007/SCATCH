const DatabaseCartService = require('../services/databaseCartService');
const ProductCacheService = require('../services/productCacheService');

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    // Check if product exists
    const product = await ProductCacheService.getProduct(productId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Add to cart
    const success = await DatabaseCartService.addToCart(userId, productId, parseInt(quantity));
    
    if (success) {
      // Get updated cart summary
      const cartSummary = await DatabaseCartService.getCartSummary(userId);
      
      res.json({
        success: true,
        message: 'Item added to cart successfully',
        cartSummary: cartSummary
      });
    } else {
      res.status(500).json({ error: 'Failed to add item to cart' });
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Error adding item to cart' });
  }
};

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cartItems = await DatabaseCartService.getCart(userId);
    const cartSummary = await DatabaseCartService.getCartSummary(userId);

    res.json({
      success: true,
      cart: cartItems,
      summary: cartSummary
    });
  } catch (error) {
    console.error('Error getting cart:', error);
    res.status(500).json({ error: 'Error loading cart' });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const userId = req.user._id;

    if (!productId || quantity === undefined) {
      return res.status(400).json({ error: 'Product ID and quantity are required' });
    }

    if (quantity < 0) {
      return res.status(400).json({ error: 'Quantity cannot be negative' });
    }

    const success = await DatabaseCartService.updateCartItem(userId, productId, parseInt(quantity));
    
    if (success) {
      const cartSummary = await DatabaseCartService.getCartSummary(userId);
      
      res.json({
        success: true,
        message: 'Cart item updated successfully',
        cartSummary: cartSummary
      });
    } else {
      res.status(500).json({ error: 'Failed to update cart item' });
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Error updating cart item' });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const success = await DatabaseCartService.removeFromCart(userId, productId);
    
    if (success) {
      const cartSummary = await DatabaseCartService.getCartSummary(userId);
      
      res.json({
        success: true,
        message: 'Item removed from cart successfully',
        cartSummary: cartSummary
      });
    } else {
      res.status(500).json({ error: 'Failed to remove item from cart' });
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ error: 'Error removing item from cart' });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const success = await DatabaseCartService.clearCart(userId);
    
    if (success) {
      res.json({
        success: true,
        message: 'Cart cleared successfully'
      });
    } else {
      res.status(500).json({ error: 'Failed to clear cart' });
    }
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Error clearing cart' });
  }
};

// Get cart count (for header display)
const getCartCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await DatabaseCartService.getCartCount(userId);
    
    res.json({
      success: true,
      count: count
    });
  } catch (error) {
    console.error('Error getting cart count:', error);
    res.status(500).json({ error: 'Error getting cart count' });
  }
};

// Check if item is in cart
const isItemInCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!productId) {
      return res.status(400).json({ error: 'Product ID is required' });
    }

    const isInCart = await DatabaseCartService.isItemInCart(userId, productId);
    const cartItem = await DatabaseCartService.getCartItem(userId, productId);
    
    res.json({
      success: true,
      isInCart: isInCart,
      cartItem: cartItem
    });
  } catch (error) {
    console.error('Error checking if item in cart:', error);
    res.status(500).json({ error: 'Error checking cart status' });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
  isItemInCart
};

