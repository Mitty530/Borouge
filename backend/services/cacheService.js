// Cache Service for Borouge ESG Intelligence Platform
// 24-hour query caching with hit tracking and analytics

const crypto = require('crypto');

class CacheService {
  constructor(supabase, config) {
    this.supabase = supabase;
    this.config = config;
  }

  // Generate consistent query hash for cache keys
  generateQueryHash(query) {
    return crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('base64');
  }

  // Check cache for existing query
  async checkCache(query) {
    const queryHash = this.generateQueryHash(query);
    const startTime = Date.now();

    try {
      console.log(`🔍 Checking cache for query hash: ${queryHash.substring(0, 16)}...`);

      const { data, error } = await this.supabase
        .from('esg_intelligence_cache')
        .select('*')
        .eq('query_hash', queryHash)
        .gt('expires_at', new Date().toISOString()) // Only get non-expired entries
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.error('Cache check error:', error);
        return null;
      }

      if (data && data.length > 0) {
        const cacheEntry = data[0];
        const checkTime = Date.now() - startTime;

        console.log(`✅ Cache HIT found (${checkTime}ms) - Entry from ${cacheEntry.created_at}`);

        // Update hit count
        await this.updateHitCount(cacheEntry.id);

        // Update popular query tracking
        await this.updatePopularQuery(query);

        return cacheEntry.response;
      }

      const checkTime = Date.now() - startTime;
      console.log(`❌ Cache MISS (${checkTime}ms) - No valid cache entry found`);
      return null;

    } catch (error) {
      console.error('Cache check error:', error);
      return null;
    }
  }

  // Save query result to cache
  async saveToCache(query, response) {
    const queryHash = this.generateQueryHash(query);
    const startTime = Date.now();

    try {
      console.log(`💾 Saving to cache: ${queryHash.substring(0, 16)}...`);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + this.config.cache.ttlHours);

      const { data, error } = await this.supabase
        .from('esg_intelligence_cache')
        .insert({
          query_hash: queryHash,
          query: query,
          response: response,
          hit_count: 0,
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        })
        .select();

      if (error) {
        console.error('Cache save error:', error);
        return false;
      }

      const saveTime = Date.now() - startTime;
      console.log(`✅ Cache saved successfully (${saveTime}ms) - Expires: ${expiresAt.toISOString()}`);

      // Update popular query tracking
      await this.updatePopularQuery(query);

      return true;

    } catch (error) {
      console.error('Cache save error:', error);
      return false;
    }
  }

  // Update hit count for cache analytics
  async updateHitCount(cacheId) {
    try {
      // First get the current hit count
      const { data: currentData, error: fetchError } = await this.supabase
        .from('esg_intelligence_cache')
        .select('hit_count')
        .eq('id', cacheId)
        .single();

      if (fetchError) {
        console.error('Hit count fetch error:', fetchError);
        return;
      }

      // Update with incremented value
      const { error } = await this.supabase
        .from('esg_intelligence_cache')
        .update({
          hit_count: (currentData.hit_count || 0) + 1
        })
        .eq('id', cacheId);

      if (error) {
        console.error('Hit count update error:', error);
      }
    } catch (error) {
      console.error('Hit count update error:', error);
    }
  }

  // Update popular query tracking
  async updatePopularQuery(query) {
    try {
      // Use the database function for atomic update
      const { error } = await this.supabase.rpc('update_popular_query', {
        query_text: query
      });

      if (error) {
        console.error('Popular query update error:', error);
      } else {
        console.log(`📈 Popular query updated: ${query.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error('Popular query update error:', error);
    }
  }

  // Get cache statistics
  async getCacheStats() {
    try {
      const { data, error } = await this.supabase
        .from('esg_intelligence_cache')
        .select('count(*), sum(hit_count)')
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error) {
        console.error('Cache stats error:', error);
        return { totalEntries: 0, totalHits: 0 };
      }

      return {
        totalEntries: data.count || 0,
        totalHits: data.sum || 0
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return { totalEntries: 0, totalHits: 0 };
    }
  }

  // Clean up expired cache entries
  async cleanupExpiredEntries() {
    try {
      console.log('🧹 Cleaning up expired cache entries...');

      const { data, error } = await this.supabase
        .from('esg_intelligence_cache')
        .delete()
        .lt('expires_at', new Date().toISOString())
        .select('count');

      if (error) {
        console.error('Cache cleanup error:', error);
        return 0;
      }

      const deletedCount = data?.length || 0;
      console.log(`✅ Cleaned up ${deletedCount} expired cache entries`);
      return deletedCount;
    } catch (error) {
      console.error('Cache cleanup error:', error);
      return 0;
    }
  }

  // Get cache hit rate for monitoring
  async getCacheHitRate(hours = 24) {
    try {
      const { data, error } = await this.supabase.rpc('get_cache_hit_rate', {
        hours_back: hours
      });

      if (error) {
        console.error('Cache hit rate error:', error);
        return { hitRate: 0, totalQueries: 0, cacheHits: 0 };
      }

      const result = data[0] || {};
      return {
        hitRate: result.hit_rate_percent || 0,
        totalQueries: result.total_queries || 0,
        cacheHits: result.cache_hits || 0
      };
    } catch (error) {
      console.error('Cache hit rate error:', error);
      return { hitRate: 0, totalQueries: 0, cacheHits: 0 };
    }
  }

  // Invalidate cache entries by pattern (for maintenance)
  async invalidateByPattern(pattern) {
    try {
      console.log(`🗑️ Invalidating cache entries matching pattern: ${pattern}`);

      const { data, error } = await this.supabase
        .from('esg_intelligence_cache')
        .delete()
        .ilike('query', `%${pattern}%`)
        .select('count');

      if (error) {
        console.error('Cache invalidation error:', error);
        return 0;
      }

      const deletedCount = data?.length || 0;
      console.log(`✅ Invalidated ${deletedCount} cache entries`);
      return deletedCount;
    } catch (error) {
      console.error('Cache invalidation error:', error);
      return 0;
    }
  }

  // Get most popular cached queries
  async getPopularCachedQueries(limit = 10) {
    try {
      const { data, error } = await this.supabase
        .from('esg_intelligence_cache')
        .select('query, hit_count, created_at')
        .gt('expires_at', new Date().toISOString())
        .order('hit_count', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Popular queries error:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Popular queries error:', error);
      return [];
    }
  }

  // Cache health check
  async healthCheck() {
    try {
      const stats = await this.getCacheStats();
      const hitRate = await this.getCacheHitRate(1); // Last hour

      return {
        status: 'healthy',
        totalEntries: stats.totalEntries,
        totalHits: stats.totalHits,
        hitRateLastHour: hitRate.hitRate,
        ttlHours: this.config.cache.ttlHours,
        maxEntries: this.config.cache.maxEntries
      };
    } catch (error) {
      console.error('Cache health check error:', error);
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
}

module.exports = CacheService;
