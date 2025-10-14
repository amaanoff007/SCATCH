const RedisService = require('./redisService');
const Product = require('../models/product-model');

class CartService {
  // Cart TTL: 7 days (604800 seconds)
  static CART_TTL = 604800;

  // Get user's cart
  static async getCart(userId) {
    const cartKey = `cart:${userId}`;
    
    try {
      const cartItems = await RedisService.lrange(cartKey);
      console.log(`🛒 Cart loaded for user ${userId}: ${cartItems.length} items`);
      
      if (cartItems.length > 0) {
        console.log('First cart item structure:', Object.keys(cartItems[0]));
        console.log('First cart item:', JSON.stringify(cartItems[0], null, 2));
      }
      
      return cartItems;
    } catch (error) {
      console.error('Error getting cart:', error);
      return [];
    }
  }

  // Add item to cart
  static async addToCart(userId, productId, quantity = 1) {
    const cartKey = `cart:${userId}`;
    
    try {
      // Get product details
      const product = await Product.findById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if item already exists in cart
      const existingItems = await RedisService.lrange(cartKey);
      const existingItemIndex = existingItems.findIndex(item => item.productId === productId);

      if (existingItemIndex !== -1) {
        // Update existing item quantity
        existingItems[existingItemIndex].quantity += quantity;
        existingItems[existingItemIndex].updatedAt = new Date();
        
        // Remove old item and add updated item
        await RedisService.del(cartKey);
        for (const item of existingItems) {
          // Ensure we're storing plain objects, not MongoDB documents
          const plainItem = {
            productId: item.productId,
            productName: item.productName,
            productPrice: item.productPrice,
            productImage: item.productImage,
            quantity: item.quantity,
            addedAt: item.addedAt,
            updatedAt: item.updatedAt
          };
          await RedisService.lpush(cartKey, plainItem);
        }
      } else {
        // Add new item - ensure we convert MongoDB document to plain object
        const cartItem = {
          productId: productId,
          productName: product.name,
          productPrice: product.price,
          productImage: product.image ? product.image.toString('base64') : null,
          quantity: quantity,
          addedAt: new Date(),
          updatedAt: new Date()
        };

        console.log('Adding cart item:', JSON.stringify(cartItem, null, 2));
        console.log('Product image type:', typeof product.image);
        console.log('Product price type:', typeof product.price);
        console.log('Product object keys:', Object.keys(product));

        await RedisService.lpush(cartKey, cartItem);
      }

      // Set expiration
      await RedisService.expire(cartKey, this.CART_TTL);

      console.log(`✅ Added ${quantity}x ${product.name} to cart for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  // Update item quantity in cart
  static async updateCartItem(userId, productId, quantity) {
    const cartKey = `cart:${userId}`;
    
    try {
      const cartItems = await RedisService.lrange(cartKey);
      const itemIndex = cartItems.findIndex(item => item.productId === productId);

      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }

      if (quantity <= 0) {
        // Remove item if quantity is 0 or negative
        return await this.removeFromCart(userId, productId);
      }

      // Update quantity
      cartItems[itemIndex].quantity = quantity;
      cartItems[itemIndex].updatedAt = new Date();

      // Replace cart with updated items
      await RedisService.del(cartKey);
      for (const item of cartItems) {
        // Ensure we're storing plain objects, not MongoDB documents
        const plainItem = {
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          productImage: item.productImage,
          quantity: item.quantity,
          addedAt: item.addedAt,
          updatedAt: item.updatedAt
        };
        await RedisService.lpush(cartKey, plainItem);
      }

      // Set expiration
      await RedisService.expire(cartKey, this.CART_TTL);

      console.log(`✅ Updated ${productId} quantity to ${quantity} for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      return false;
    }
  }

  // Remove item from cart
  static async removeFromCart(userId, productId) {
    const cartKey = `cart:${userId}`;
    
    try {
      const cartItems = await RedisService.lrange(cartKey);
      const filteredItems = cartItems.filter(item => item.productId !== productId);

      // Replace cart with filtered items
      await RedisService.del(cartKey);
      for (const item of filteredItems) {
        // Ensure we're storing plain objects, not MongoDB documents
        const plainItem = {
          productId: item.productId,
          productName: item.productName,
          productPrice: item.productPrice,
          productImage: item.productImage,
          quantity: item.quantity,
          addedAt: item.addedAt,
          updatedAt: item.updatedAt
        };
        await RedisService.lpush(cartKey, plainItem);
      }

      // Set expiration
      await RedisService.expire(cartKey, this.CART_TTL);

      console.log(`✅ Removed ${productId} from cart for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  // Clear entire cart
  static async clearCart(userId) {
    const cartKey = `cart:${userId}`;
    
    try {
      await RedisService.del(cartKey);
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

  // Migrate cart from session to Redis (for existing users)
  static async migrateCartFromSession(userId, sessionCart) {
    try {
      if (!sessionCart || !Array.isArray(sessionCart)) {
        return false;
      }

      const cartKey = `cart:${userId}`;
      
      // Clear existing cart
      await RedisService.del(cartKey);

      // Add all items from session - ensure they are plain objects
      for (const item of sessionCart) {
        const plainItem = {
          productId: item.productId || item._id,
          productName: item.productName || item.name,
          productPrice: item.productPrice || item.price,
          productImage: item.productImage || (item.image ? item.image.toString('base64') : null),
          quantity: item.quantity || 1,
          addedAt: item.addedAt || new Date(),
          updatedAt: item.updatedAt || new Date()
        };
        await RedisService.lpush(cartKey, plainItem);
      }

      // Set expiration
      await RedisService.expire(cartKey, this.CART_TTL);

      console.log(`✅ Migrated ${sessionCart.length} items from session to Redis for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error migrating cart from session:', error);
      return false;
    }
  }

  // Get all carts (for admin purposes)
  static async getAllCarts() {
    try {
      const cartKeys = await RedisService.keys('cart:*');
      const carts = [];

      for (const key of cartKeys) {
        const userId = key.replace('cart:', '');
        const cartItems = await RedisService.lrange(key);
        const summary = await this.getCartSummary(userId);
        
        carts.push({
          userId,
          itemCount: summary.itemCount,
          totalItems: summary.totalItems,
          totalPrice: summary.totalPrice,
          lastUpdated: cartItems.length > 0 ? cartItems[0].updatedAt : null
        });
      }

      return carts;
    } catch (error) {
      console.error('Error getting all carts:', error);
      return [];
    }
  }

  // Clean up expired carts (run periodically)
  static async cleanupExpiredCarts() {
    try {
      const cartKeys = await RedisService.keys('cart:*');
      let cleanedCount = 0;

      for (const key of cartKeys) {
        const ttl = await RedisService.ttl(key);
        if (ttl === -2) { // Key doesn't exist
          await RedisService.del(key);
          cleanedCount++;
        }
      }

      console.log(`🧹 Cleaned up ${cleanedCount} expired carts`);
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired carts:', error);
      return 0;
    }
  }
}

module.exports = CartService;

