const userModel = require('../models/user-model');
const Product = require('../models/product-model');

class DatabaseCartService {
  // Get user's cart with populated product data
  static async getCart(userId) {
    try {
      const user = await userModel.findById(userId).populate('cart.product');
      
      if (!user || !user.cart) {
        return [];
      }

      // Convert to the format expected by the frontend
      const cartItems = user.cart.map(cartItem => ({
        productId: cartItem.product._id.toString(),
        productName: cartItem.product.name,
        productPrice: cartItem.product.price,
        productImage: cartItem.product.image ? cartItem.product.image.toString('base64') : null,
        quantity: cartItem.quantity,
        addedAt: cartItem.addedAt || new Date(),
        updatedAt: cartItem.updatedAt || new Date()
      }));

      console.log(`🛒 Cart loaded for user ${userId}: ${cartItems.length} items`);
      return cartItems;
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  }

  // Add item to cart
  static async addToCart(userId, productId, quantity = 1) {
    try {
      // Check if product exists
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      const user = await userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Check if item already exists in cart
      const existingItemIndex = user.cart.findIndex(item => 
        item.product.toString() === productId
      );

      if (existingItemIndex !== -1) {
        // Update existing item quantity
        user.cart[existingItemIndex].quantity += quantity;
        user.cart[existingItemIndex].updatedAt = new Date();
      } else {
        // Add new item
        user.cart.push({
          product: productId,
          quantity: quantity,
          addedAt: new Date(),
          updatedAt: new Date()
        });
      }

      await user.save();
      console.log(`✅ Added ${quantity}x ${product.name} to cart for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  // Update cart item quantity
  static async updateCartItem(userId, productId, quantity) {
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const itemIndex = user.cart.findIndex(item => 
        item.product.toString() === productId
      );

      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return await this.removeFromCart(userId, productId);
      }

      // Update quantity
      user.cart[itemIndex].quantity = quantity;
      user.cart[itemIndex].updatedAt = new Date();

      await user.save();
      console.log(`✅ Updated ${productId} quantity to ${quantity} for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  }

  // Remove item from cart
  static async removeFromCart(userId, productId) {
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Remove item from cart
      user.cart = user.cart.filter(item => 
        item.product.toString() !== productId
      );

      await user.save();
      console.log(`✅ Removed ${productId} from cart for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  // Clear entire cart
  static async clearCart(userId) {
    try {
      const user = await userModel.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      user.cart = [];
      await user.save();
      console.log(`✅ Cart cleared for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  // Get cart summary (total items, total price)
  static async getCartSummary(userId) {
    try {
      const cartItems = await this.getCart(userId);
      
      const summary = {
        totalItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: cartItems.reduce((sum, item) => sum + (item.productPrice * item.quantity), 0),
        itemCount: cartItems.length,
        items: cartItems
      };

      console.log(`📊 Cart summary for user ${userId}: ${summary.totalItems} items, $${summary.totalPrice.toFixed(2)}`);
      return summary;
    } catch (error) {
      console.error('Error getting cart summary:', error);
      return {
        totalItems: 0,
        totalPrice: 0,
        itemCount: 0,
        items: []
      };
    }
  }

  // Check if item exists in cart
  static async isItemInCart(userId, productId) {
    try {
      const cartItems = await this.getCart(userId);
      return cartItems.some(item => item.productId === productId);
    } catch (error) {
      console.error('Error checking if item in cart:', error);
      return false;
    }
  }

  // Get cart item by product ID
  static async getCartItem(userId, productId) {
    try {
      const cartItems = await this.getCart(userId);
      return cartItems.find(item => item.productId === productId);
    } catch (error) {
      console.error('Error getting cart item:', error);
      return null;
    }
  }

  // Get cart count (total items)
  static async getCartCount(userId) {
    try {
      const summary = await this.getCartSummary(userId);
      return summary.totalItems;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }

  // Migrate cart from session to database (for existing users)
  static async migrateCartFromSession(userId, sessionCart) {
    try {
      if (!sessionCart || !Array.isArray(sessionCart)) {
        return false;
      }

      const user = await userModel.findById(userId);
      if (!user) {
        return false;
      }

      // Clear existing cart
      user.cart = [];

      // Add all items from session
      for (const item of sessionCart) {
        user.cart.push({
          product: item.productId || item._id,
          quantity: item.quantity || 1,
          addedAt: item.addedAt || new Date(),
          updatedAt: item.updatedAt || new Date()
        });
      }

      await user.save();
      console.log(`✅ Migrated ${sessionCart.length} items from session to database for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error migrating cart from session:', error);
      return false;
    }
  }
}

module.exports = DatabaseCartService;
