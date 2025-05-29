// ESG Intelligence Service for Borouge ESG Intelligence Platform
// Main orchestration service for ESG query processing

const AIService = require('./aiService');
const CacheService = require('./cacheService');

class ESGIntelligenceService {
  constructor(config, supabase) {
    this.config = config;
    this.supabase = supabase;
    this.aiService = new AIService(config, supabase);
    this.cacheService = new CacheService(supabase, config);
  }

  // Main ESG intelligence processing endpoint
  async processQuery(query) {
    const startTime = Date.now();

    try {
      console.log(`🔍 Processing ESG query: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);

      // Check cache first
      const cachedResult = await this.cacheService.checkCache(query);
      if (cachedResult) {
        console.log('🎯 Returning cached result');
        const responseTime = Date.now() - startTime;

        // Add response timing to cached result
        cachedResult.responseTime = responseTime;
        cachedResult.cached = true;
        cachedResult.timestamp = new Date().toISOString();

        return cachedResult;
      }

      // Process with AI if not cached
      console.log('🤖 Processing new query with AI...');
      const aiResult = await this.aiService.analyzeQuery(query);
      const response = this.structureResponse(aiResult, query, startTime);

      // Cache the result for future use
      await this.cacheService.saveToCache(query, response);

      return response;

    } catch (error) {
      console.error('ESG Intelligence processing error:', error);

      // Track error analytics
      await this.trackErrorAnalytics(query, error, Date.now() - startTime);

      throw error;
    }
  }

  // Structure AI response to match frontend expectations
  structureResponse(aiResult, query, startTime) {
    const responseTime = Date.now() - startTime;

    console.log(`📋 Structuring response for frontend (${responseTime}ms)`);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      query: query,
      responseTime: responseTime,
      cached: false,
      response: aiResult.response || `Thank you for your query: "${query}". The system has been cleaned and is ready for the new implementation.`
    };

    console.log(`✅ Response structured for simplified interface`);
    return response;
  }





  // Track error analytics
  async trackErrorAnalytics(query, error, responseTime) {
    try {
      await this.supabase
        .from('esg_query_analytics')
        .insert({
          query: `ERROR: ${query}`,
          query_type: 'error',
          response_time_ms: responseTime,
          sources_found: 0,
          user_rating: null,
          created_at: new Date().toISOString()
        });

      console.log(`📊 Error analytics tracked: ${error.message}`);
    } catch (trackingError) {
      console.error('Error analytics tracking failed:', trackingError);
    }
  }

  // Get service health status
  async getHealthStatus() {
    try {
      const cacheHealth = await this.cacheService.healthCheck();
      const dbHealth = await this.checkDatabaseHealth();
      const aiHealth = await this.checkAIEnginesHealth();

      return {
        status: 'healthy',
        services: {
          cache: cacheHealth,
          database: dbHealth,
          aiEngines: aiHealth
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  // Check database connectivity
  async checkDatabaseHealth() {
    try {
      const { data, error } = await this.supabase
        .from('esg_popular_queries')
        .select('count(*)')
        .limit(1);

      if (error) throw error;

      return {
        status: 'connected',
        responseTime: '< 100ms'
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  // Check AI engines availability
  async checkAIEnginesHealth() {
    const engines = {
      groq: this.config.groq.apiKey ? 'configured' : 'missing',
      gemini: this.config.gemini.apiKey ? 'configured' : 'missing',
      openai: this.config.openai.apiKey ? 'configured' : 'missing'
    };

    // Check rate limits
    const rateLimits = {
      groq: this.aiService.checkRateLimit('groq', 1) ? 'available' : 'rate_limited',
      gemini: this.aiService.checkRateLimit('gemini', 1) ? 'available' : 'rate_limited',
      openai: 'available' // OpenAI is emergency backup, don't check rate limit
    };

    return {
      configuration: engines,
      rateLimits: rateLimits,
      strategy: 'multi-provider-failover'
    };
  }

  // Get service statistics
  async getServiceStats() {
    try {
      const cacheStats = await this.cacheService.getCacheStats();
      const hitRate = await this.cacheService.getCacheHitRate(24);

      const { data: queryStats } = await this.supabase
        .from('esg_query_analytics')
        .select('count(*)')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single();

      const { data: avgResponseTime } = await this.supabase
        .from('esg_query_analytics')
        .select('avg(response_time_ms)')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .single();

      return {
        cache: {
          totalEntries: cacheStats.totalEntries,
          totalHits: cacheStats.totalHits,
          hitRate: hitRate.hitRate
        },
        queries: {
          last24Hours: queryStats?.count || 0,
          avgResponseTime: Math.round(avgResponseTime?.avg || 0)
        },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Service stats error:', error);
      return {
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = ESGIntelligenceService;
