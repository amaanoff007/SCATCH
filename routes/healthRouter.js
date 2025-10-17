const express = require('express');
const router = express.Router();
const RedisService = require('../services/redisService');
const EmailQueueService = require('../services/emailQueueService');
const ProductCacheService = require('../services/productCacheService');

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    const health = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      services: {}
    };

    // Check Redis connection
    try {
      const redisPing = await RedisService.ping();
      health.services.redis = {
        status: redisPing ? 'OK' : 'ERROR',
        message: redisPing ? 'Connected' : 'Connection failed'
      };
    } catch (error) {
      health.services.redis = {
        status: 'ERROR',
        message: error.message
      };
    }

    // Check email queue
    try {
      const queueStats = await EmailQueueService.getQueueStats();
      health.services.emailQueue = {
        status: 'OK',
        message: 'Email queue operational',
        stats: queueStats
      };
    } catch (error) {
      health.services.emailQueue = {
        status: 'ERROR',
        message: error.message
      };
    }

    // Check product cache
    try {
      const cacheStats = await ProductCacheService.getCacheStats();
      health.services.productCache = {
        status: 'OK',
        message: 'Product cache operational',
        stats: cacheStats
      };
    } catch (error) {
      health.services.productCache = {
        status: 'ERROR',
        message: error.message
      };
    }

    // Overall status
    const allServicesOK = Object.values(health.services).every(service => service.status === 'OK');
    health.status = allServicesOK ? 'OK' : 'DEGRADED';

    const statusCode = allServicesOK ? 200 : 503;
    res.status(statusCode).json(health);

  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      message: 'Health check failed',
      error: error.message
    });
  }
});

// Redis cache management endpoints
router.get('/cache/stats', async (req, res) => {
  try {
    const stats = await ProductCacheService.getCacheStats();
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/cache/clear', async (req, res) => {
  try {
    const cleared = await ProductCacheService.invalidateAllProductCache();
    res.json({
      success: true,
      message: `Cleared ${cleared} cache entries`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/cache/warmup', async (req, res) => {
  try {
    const success = await ProductCacheService.warmUpCache();
    res.json({
      success: success,
      message: success ? 'Cache warmed up successfully' : 'Cache warmup failed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Email queue management endpoints
router.get('/email-queue/stats', async (req, res) => {
  try {
    const stats = await EmailQueueService.getQueueStats();
    res.json({
      success: true,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/email-queue/pause', async (req, res) => {
  try {
    const success = await EmailQueueService.pauseQueue();
    res.json({
      success: success,
      message: success ? 'Email queue paused' : 'Failed to pause queue'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/email-queue/resume', async (req, res) => {
  try {
    const success = await EmailQueueService.resumeQueue();
    res.json({
      success: success,
      message: success ? 'Email queue resumed' : 'Failed to resume queue'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/email-queue/clear', async (req, res) => {
  try {
    const success = await EmailQueueService.clearQueue();
    res.json({
      success: success,
      message: success ? 'Email queue cleared' : 'Failed to clear queue'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;





