const Product = require('../models/product-model');
const RedisService = require('./redisService');

class ProductCacheService {
  // Cache TTL constants (in seconds)
  static CACHE_TTL = {
    PRODUCT: 3600,      // 1 hour
    PRODUCT_LIST: 1800, // 30 minutes
    SEARCH: 900,        // 15 minutes
    POPULAR: 7200       // 2 hours
  };

  // Get single product with caching
  static async getProduct(productId) {
    const cacheKey = `product:${productId}`;
    
    try {
      // Try to get from cache first
      const cachedProduct = await RedisService.get(cacheKey);
      if (cachedProduct) {
        console.log(`📦 Product ${productId} loaded from cache`);
        return cachedProduct;
      }

      // If not in cache, get from database
      const product = await Product.findById(productId).populate('owner', 'fullname email');
      if (!product) {
        return null;
      }

      // Convert image to base64 string for proper caching
      const productForCache = {
        ...product.toObject(),
        image: product.image ? product.image.toString('base64') : null
      };

      // Cache the product
      await RedisService.set(cacheKey, productForCache, this.CACHE_TTL.PRODUCT);
      console.log(`💾 Product ${productId} cached for ${this.CACHE_TTL.PRODUCT}s`);

      return productForCache;
    } catch (error) {
      console.error('Error in getProduct:', error);
      // Fallback to database if Redis fails
      return await Product.findById(productId).populate('owner', 'fullname email');
    }
  }

  // Get all products with caching
  static async getAllProducts() {
    const cacheKey = 'products:all';
    
    try {
      // Try to get from cache first
      const cachedProducts = await RedisService.get(cacheKey);
      if (cachedProducts) {
        console.log('📦 All products loaded from cache');
        return cachedProducts;
      }

      // If not in cache, get from database
      const products = await Product.find().populate('owner', 'fullname email');
      
      // Convert images to base64 strings for proper caching
      const productsForCache = products.map(product => ({
        ...product.toObject(),
        image: product.image ? product.image.toString('base64') : null
      }));
      
      // Cache the products
      await RedisService.set(cacheKey, productsForCache, this.CACHE_TTL.PRODUCT_LIST);
      console.log(`💾 All products cached for ${this.CACHE_TTL.PRODUCT_LIST}s`);

      return productsForCache;
    } catch (error) {
      console.error('Error in getAllProducts:', error);
      // Fallback to database if Redis fails
      return await Product.find().populate('owner', 'fullname email');
    }
  }

  // Get products by owner with caching
  static async getProductsByOwner(ownerId) {
    const cacheKey = `products:owner:${ownerId}`;
    
    try {
      // Try to get from cache first
      const cachedProducts = await RedisService.get(cacheKey);
      if (cachedProducts) {
        console.log(`📦 Owner ${ownerId} products loaded from cache`);
        return cachedProducts;
      }

      // If not in cache, get from database
      const products = await Product.find({ owner: ownerId }).populate('owner', 'fullname email');
      
      // Convert images to base64 strings for proper caching
      const productsForCache = products.map(product => ({
        ...product.toObject(),
        image: product.image ? product.image.toString('base64') : null
      }));
      
      // Cache the products
      await RedisService.set(cacheKey, productsForCache, this.CACHE_TTL.PRODUCT_LIST);
      console.log(`💾 Owner ${ownerId} products cached for ${this.CACHE_TTL.PRODUCT_LIST}s`);

      return productsForCache;
    } catch (error) {
      console.error('Error in getProductsByOwner:', error);
      // Fallback to database if Redis fails
      return await Product.find({ owner: ownerId }).populate('owner', 'fullname email');
    }
  }

  // Search products with caching
  static async searchProducts(query) {
    const cacheKey = `search:${query.toLowerCase().trim()}`;
    
    try {
      // Try to get from cache first
      const cachedResults = await RedisService.get(cacheKey);
      if (cachedResults) {
        console.log(`🔍 Search "${query}" results loaded from cache`);
        return cachedResults;
      }

      // If not in cache, search in database
      const products = await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      }).populate('owner', 'fullname email');

      // Cache the search results
      await RedisService.set(cacheKey, products, this.CACHE_TTL.SEARCH);
      console.log(`💾 Search "${query}" results cached for ${this.CACHE_TTL.SEARCH}s`);

      return products;
    } catch (error) {
      console.error('Error in searchProducts:', error);
      // Fallback to database if Redis fails
      return await Product.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      }).populate('owner', 'fullname email');
    }
  }

  // Get popular products (most viewed/ordered) with caching
  static async getPopularProducts(limit = 10) {
    const cacheKey = `products:popular:${limit}`;
    
    try {
      // Try to get from cache first
      const cachedProducts = await RedisService.get(cacheKey);
      if (cachedProducts) {
        console.log(`📦 Popular products loaded from cache`);
        return cachedProducts;
      }

      // If not in cache, get from database
      // For now, we'll get products ordered by creation date
      // In a real app, you'd order by views, sales, etc.
      const products = await Product.find()
        .populate('owner', 'fullname email')
        .sort({ createdAt: -1 })
        .limit(limit);

      // Cache the popular products
      await RedisService.set(cacheKey, products, this.CACHE_TTL.POPULAR);
      console.log(`💾 Popular products cached for ${this.CACHE_TTL.POPULAR}s`);

      return products;
    } catch (error) {
      console.error('Error in getPopularProducts:', error);
      // Fallback to database if Redis fails
      return await Product.find()
        .populate('owner', 'fullname email')
        .sort({ createdAt: -1 })
        .limit(limit);
    }
  }

  // Invalidate product cache when product is updated
  static async invalidateProductCache(productId, ownerId = null) {
    try {
      const keysToDelete = [
        `product:${productId}`,
        'products:all',
        'products:popular:*'
      ];

      // Add owner-specific cache if ownerId provided
      if (ownerId) {
        keysToDelete.push(`products:owner:${ownerId}`);
      }

      // Delete all matching keys
      for (const pattern of keysToDelete) {
        await RedisService.invalidatePattern(pattern);
      }

      console.log(`🗑️ Product cache invalidated for product ${productId}`);
      return true;
    } catch (error) {
      console.error('Error invalidating product cache:', error);
      return false;
    }
  }

  // Invalidate all product caches
  static async invalidateAllProductCache() {
    try {
      const patterns = [
        'product:*',
        'products:*',
        'search:*'
      ];

      let totalDeleted = 0;
      for (const pattern of patterns) {
        const deleted = await RedisService.invalidatePattern(pattern);
        totalDeleted += deleted;
      }

      console.log(`🗑️ All product caches invalidated (${totalDeleted} keys deleted)`);
      return totalDeleted;
    } catch (error) {
      console.error('Error invalidating all product cache:', error);
      return 0;
    }
  }

  // Warm up cache with popular products
  static async warmUpCache() {
    try {
      console.log('🔥 Warming up product cache...');
      
      // Pre-load popular products
      await this.getPopularProducts(20);
      
      // Pre-load all products
      await this.getAllProducts();
      
      console.log('✅ Product cache warmed up successfully');
      return true;
    } catch (error) {
      console.error('Error warming up cache:', error);
      return false;
    }
  }

  // Get cache statistics
  static async getCacheStats() {
    try {
      const productKeys = await RedisService.keys('product:*');
      const productListKeys = await RedisService.keys('products:*');
      const searchKeys = await RedisService.keys('search:*');
      
      const stats = {
        productKeys: productKeys.length,
        productListKeys: productListKeys.length,
        searchKeys: searchKeys.length,
        totalKeys: 0
      };

      stats.totalKeys = stats.productKeys + stats.productListKeys + stats.searchKeys;
      return stats;
    } catch (error) {
      console.error('Error getting cache stats:', error);
      return { productKeys: 0, productListKeys: 0, searchKeys: 0, totalKeys: 0 };
    }
  }
}

module.exports = ProductCacheService;

