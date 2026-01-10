const redis = require('../config/redis');

// Check if caching is enabled
const isCacheEnabled = () => {
  return process.env.CACHE_ENABLED === 'true';
};

// Get default TTL (Time To Live) in seconds
const getDefaultTTL = () => {
  return parseInt(process.env.CACHE_DEFAULT_TTL) || 300; // 5 minutes default
};

/**
 * Cache utility wrapper
 */
const cache = {
  /**
   * Get value from cache
   * @param {string} key - Cache key
   * @returns {Promise<any|null>} - Parsed value or null
   */
  async get(key) {
    if (!isCacheEnabled()) return null;
    
    try {
      const data = await redis.get(key);
      if (!data) return null;
      
      return JSON.parse(data);
    } catch (error) {
      console.error(`Cache GET error for key "${key}":`, error.message);
      return null;
    }
  },

  /**
   * Set value in cache
   * @param {string} key - Cache key
   * @param {any} value - Value to cache (will be JSON stringified)
   * @param {number} ttl - Time to live in seconds (optional)
   * @returns {Promise<boolean>} - Success status
   */
  async set(key, value, ttl = null) {
    if (!isCacheEnabled()) return false;
    
    try {
      const expiryTime = ttl || getDefaultTTL();
      await redis.setex(key, expiryTime, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Cache SET error for key "${key}":`, error.message);
      return false;
    }
  },

  /**
   * Delete value from cache
   * @param {string} key - Cache key or pattern
   * @returns {Promise<boolean>} - Success status
   */
  async delete(key) {
    if (!isCacheEnabled()) return false;
    
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      console.error(`Cache DELETE error for key "${key}":`, error.message);
      return false;
    }
  },

  /**
   * Delete multiple keys matching a pattern
   * @param {string} pattern - Key pattern (e.g., "league:*")
   * @returns {Promise<number>} - Number of keys deleted
   */
  async deletePattern(pattern) {
    if (!isCacheEnabled()) return 0;
    
    try {
      const keys = await redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      await redis.del(...keys);
      return keys.length;
    } catch (error) {
      console.error(`Cache DELETE PATTERN error for pattern "${pattern}":`, error.message);
      return 0;
    }
  },

  /**
   * Check if key exists in cache
   * @param {string} key - Cache key
   * @returns {Promise<boolean>}
   */
  async exists(key) {
    if (!isCacheEnabled()) return false;
    
    try {
      const exists = await redis.exists(key);
      return exists === 1;
    } catch (error) {
      console.error(`Cache EXISTS error for key "${key}":`, error.message);
      return false;
    }
  },

  /**
   * Clear all cache
   * @returns {Promise<boolean>}
   */
  async clear() {
    if (!isCacheEnabled()) return false;
    
    try {
      await redis.flushdb();
      console.log('✅ Cache cleared successfully');
      return true;
    } catch (error) {
      console.error('Cache CLEAR error:', error.message);
      return false;
    }
  },

  /**
   * Get cache statistics
   * @returns {Promise<object>}
   */
  async getStats() {
    if (!isCacheEnabled()) return { enabled: false };
    
    try {
      const info = await redis.info('stats');
      const dbSize = await redis.dbsize();
      
      return {
        enabled: true,
        keys: dbSize,
        info: info,
      };
    } catch (error) {
      console.error('Cache STATS error:', error.message);
      return { enabled: true, error: error.message };
    }
  }
};

// Cache key generators
const cacheKeys = {
  leagueTable: (leagueId, seasonId) => `league:${leagueId}:season:${seasonId}:table`,
  seasonStandings: (seasonId) => `season:${seasonId}:standings`,
  topScorers: (seasonId) => `season:${seasonId}:topscorers`,
  teamsList: (seasonId) => seasonId ? `teams:season:${seasonId}` : 'teams:all',
  teamById: (teamId) => `team:${teamId}`,
  teamSquad: (teamId) => `team:${teamId}:squad`,
  teamStats: (teamId, seasonId) => `team:${teamId}:season:${seasonId}:stats`,
  playersList: (teamId) => teamId ? `players:team:${teamId}` : 'players:all',
  playerById: (playerId) => `player:${playerId}`,
  matchesList: (filters) => {
    const { status, date, teamId } = filters || {};
    let key = 'matches';
    if (status) key += `:status:${status}`;
    if (date) key += `:date:${date}`;
    if (teamId) key += `:team:${teamId}`;
    return key;
  },
  newsList: (category) => category ? `news:category:${category}` : 'news:all',
};

module.exports = { cache, cacheKeys };
