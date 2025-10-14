const { redisClient } = require('../config/redis-config');

class RedisService {
  // Set a key-value pair with optional TTL
  static async set(key, value, ttl = null) {
    try {
      const serializedValue = JSON.stringify(value);
      
      if (ttl) {
        await redisClient.setex(key, ttl, serializedValue);
      } else {
        await redisClient.set(key, serializedValue);
      }
      
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  // Get a value by key
  static async get(key) {
    try {
      const value = await redisClient.get(key);
      
      if (value === null) {
        return null;
      }
      
      return JSON.parse(value);
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  // Delete a key
  static async del(key) {
    try {
      const result = await redisClient.del(key);
      return result > 0;
    } catch (error) {
      console.error('Redis DEL error:', error);
      return false;
    }
  }

  // Check if a key exists
  static async exists(key) {
    try {
      const result = await redisClient.exists(key);
      return result === 1;
    } catch (error) {
      console.error('Redis EXISTS error:', error);
      return false;
    }
  }

  // Set expiration time for a key
  static async expire(key, ttl) {
    try {
      const result = await redisClient.expire(key, ttl);
      return result === 1;
    } catch (error) {
      console.error('Redis EXPIRE error:', error);
      return false;
    }
  }

  // Get TTL of a key
  static async ttl(key) {
    try {
      return await redisClient.ttl(key);
    } catch (error) {
      console.error('Redis TTL error:', error);
      return -1;
    }
  }

  // Get all keys matching a pattern
  static async keys(pattern) {
    try {
      return await redisClient.keys(pattern);
    } catch (error) {
      console.error('Redis KEYS error:', error);
      return [];
    }
  }

  // Delete all keys matching a pattern
  static async invalidatePattern(pattern) {
    try {
      const keys = await this.keys(pattern);
      
      if (keys.length === 0) {
        return 0;
      }
      
      const result = await redisClient.del(...keys);
      console.log(`🗑️ Deleted ${result} keys matching pattern: ${pattern}`);
      return result;
    } catch (error) {
      console.error('Redis invalidatePattern error:', error);
      return 0;
    }
  }

  // Increment a numeric value
  static async incr(key) {
    try {
      return await redisClient.incr(key);
    } catch (error) {
      console.error('Redis INCR error:', error);
      return null;
    }
  }

  // Decrement a numeric value
  static async decr(key) {
    try {
      return await redisClient.decr(key);
    } catch (error) {
      console.error('Redis DECR error:', error);
      return null;
    }
  }

  // Set a hash field
  static async hset(key, field, value) {
    try {
      const serializedValue = JSON.stringify(value);
      return await redisClient.hset(key, field, serializedValue);
    } catch (error) {
      console.error('Redis HSET error:', error);
      return false;
    }
  }

  // Get a hash field
  static async hget(key, field) {
    try {
      const value = await redisClient.hget(key, field);
      
      if (value === null) {
        return null;
      }
      
      return JSON.parse(value);
    } catch (error) {
      console.error('Redis HGET error:', error);
      return null;
    }
  }

  // Get all hash fields
  static async hgetall(key) {
    try {
      const hash = await redisClient.hgetall(key);
      const result = {};
      
      for (const [field, value] of Object.entries(hash)) {
        try {
          result[field] = JSON.parse(value);
        } catch {
          result[field] = value;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Redis HGETALL error:', error);
      return {};
    }
  }

  // Delete a hash field
  static async hdel(key, field) {
    try {
      return await redisClient.hdel(key, field);
    } catch (error) {
      console.error('Redis HDEL error:', error);
      return false;
    }
  }

  // Check if a hash field exists
  static async hexists(key, field) {
    try {
      const result = await redisClient.hexists(key, field);
      return result === 1;
    } catch (error) {
      console.error('Redis HEXISTS error:', error);
      return false;
    }
  }

  // Get all hash field names
  static async hkeys(key) {
    try {
      return await redisClient.hkeys(key);
    } catch (error) {
      console.error('Redis HKEYS error:', error);
      return [];
    }
  }

  // Get Redis info
  static async info() {
    try {
      return await redisClient.info();
    } catch (error) {
      console.error('Redis INFO error:', error);
      return null;
    }
  }

  // Get Redis memory usage
  static async memoryUsage(key) {
    try {
      return await redisClient.memory('usage', key);
    } catch (error) {
      console.error('Redis MEMORY USAGE error:', error);
      return null;
    }
  }

  // Flush all databases
  static async flushall() {
    try {
      await redisClient.flushall();
      console.log('🗑️ All Redis databases flushed');
      return true;
    } catch (error) {
      console.error('Redis FLUSHALL error:', error);
      return false;
    }
  }

  // Flush current database
  static async flushdb() {
    try {
      await redisClient.flushdb();
      console.log('🗑️ Current Redis database flushed');
      return true;
    } catch (error) {
      console.error('Redis FLUSHDB error:', error);
      return false;
    }
  }

  // Get database size
  static async dbsize() {
    try {
      return await redisClient.dbsize();
    } catch (error) {
      console.error('Redis DBSIZE error:', error);
      return 0;
    }
  }

  // Ping Redis server
  static async ping() {
    try {
      const result = await redisClient.ping();
      return result === 'PONG';
    } catch (error) {
      console.error('Redis PING error:', error);
      return false;
    }
  }

  // Get Redis client status
  static getStatus() {
    return {
      status: redisClient.status,
      connected: redisClient.status === 'ready',
      host: redisClient.options.host,
      port: redisClient.options.port,
      db: redisClient.options.db
    };
  }

  // List operations - Left push (add to beginning of list)
  static async lpush(key, ...values) {
    try {
      const serializedValues = values.map(value => JSON.stringify(value));
      return await redisClient.lpush(key, ...serializedValues);
    } catch (error) {
      console.error('Redis LPUSH error:', error);
      return 0;
    }
  }

  // List operations - Right push (add to end of list)
  static async rpush(key, ...values) {
    try {
      const serializedValues = values.map(value => JSON.stringify(value));
      return await redisClient.rpush(key, ...serializedValues);
    } catch (error) {
      console.error('Redis RPUSH error:', error);
      return 0;
    }
  }

  // List operations - Get range of list elements
  static async lrange(key, start = 0, stop = -1) {
    try {
      const values = await redisClient.lrange(key, start, stop);
      return values.map(value => {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      });
    } catch (error) {
      console.error('Redis LRANGE error:', error);
      return [];
    }
  }

  // List operations - Get list length
  static async llen(key) {
    try {
      return await redisClient.llen(key);
    } catch (error) {
      console.error('Redis LLEN error:', error);
      return 0;
    }
  }

  // List operations - Remove elements from list
  static async lrem(key, count, value) {
    try {
      const serializedValue = JSON.stringify(value);
      return await redisClient.lrem(key, count, serializedValue);
    } catch (error) {
      console.error('Redis LREM error:', error);
      return 0;
    }
  }

  // List operations - Get element by index
  static async lindex(key, index) {
    try {
      const value = await redisClient.lindex(key, index);
      if (value === null) {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Redis LINDEX error:', error);
      return null;
    }
  }

  // List operations - Set element by index
  static async lset(key, index, value) {
    try {
      const serializedValue = JSON.stringify(value);
      return await redisClient.lset(key, index, serializedValue);
    } catch (error) {
      console.error('Redis LSET error:', error);
      return false;
    }
  }

  // List operations - Trim list to specified range
  static async ltrim(key, start, stop) {
    try {
      return await redisClient.ltrim(key, start, stop);
    } catch (error) {
      console.error('Redis LTRIM error:', error);
      return false;
    }
  }

  // List operations - Pop from left (beginning)
  static async lpop(key) {
    try {
      const value = await redisClient.lpop(key);
      if (value === null) {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Redis LPOP error:', error);
      return null;
    }
  }

  // List operations - Pop from right (end)
  static async rpop(key) {
    try {
      const value = await redisClient.rpop(key);
      if (value === null) {
        return null;
      }
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Redis RPOP error:', error);
      return null;
    }
  }

  // Close Redis connection
  static async quit() {
    try {
      await redisClient.quit();
      console.log('🔌 Redis connection closed');
      return true;
    } catch (error) {
      console.error('Redis QUIT error:', error);
      return false;
    }
  }
}

module.exports = RedisService;
