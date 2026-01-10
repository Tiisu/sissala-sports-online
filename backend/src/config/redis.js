const Redis = require('ioredis');

// Redis configuration
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
};

// Create Redis client
const redis = new Redis(redisConfig);

// Redis event handlers
redis.on('connect', () => {
  console.log('✅ Redis: Connected successfully');
});

redis.on('error', (err) => {
  console.error('❌ Redis Error:', err.message);
});

redis.on('reconnecting', () => {
  console.log('🔄 Redis: Reconnecting...');
});

redis.on('close', () => {
  console.log('❌ Redis: Connection closed');
});

module.exports = redis;
