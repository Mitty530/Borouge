// ESG Intelligence Service for Borouge ESG Intelligence Platform
// Main orchestration service for ESG query processing

const AIService = require('./aiService');
const CacheService = require('./cacheService');
const NewsService = require('./newsService');
const QueryEnhancementService = require('./queryEnhancementService');
const ArticleAnalysisService = require('./articleAnalysisService');
const ExecutiveSummaryService = require('./executiveSummaryService');

class ESGIntelligenceService {
  constructor(config, supabase) {
    this.config = config;
    this.supabase = supabase;
    this.aiService = new AIService(config, supabase);
    this.cacheService = new CacheService(supabase, config);
    this.newsService = new NewsService(config, supabase);
    this.queryEnhancementService = new QueryEnhancementService(config, supabase);
    this.articleAnalysisService = new ArticleAnalysisService(config, supabase, this.aiService);
    this.executiveSummaryService = new ExecutiveSummaryService(config, supabase, this.aiService);
  }

  // Query validation method
  validateQuery(query) {
    if (!query || typeof query !== 'string') {
      return {
        isValid: false,
        reason: 'empty',
        message: 'Query is empty or invalid'
      };
    }

    const trimmedQuery = query.trim();

    // Check minimum length
    if (trimmedQuery.length < 3) {
      return {
        isValid: false,
        reason: 'too_short',
        message: 'Query is too short. Please provide a more detailed search term.'
      };
    }

    // Check for meaningless patterns (basic server-side validation)
    const meaninglessPatterns = [
      /^[a-z]{3,}$/i, // Random letter sequences
      /^[A-Z]{3,}$/, // All caps random sequences
      /^[0-9]+$/, // Only numbers
      /^(.)\1{2,}$/, // Repeated characters
    ];

    if (meaninglessPatterns.some(pattern => pattern.test(trimmedQuery))) {
      return {
        isValid: false,
        reason: 'meaningless',
        message: 'Query appears to contain random characters. Please enter a meaningful ESG-related search term.'
      };
    }

    // Basic ESG relevance check
    const esgKeywords = [
      'esg', 'environmental', 'social', 'governance', 'sustainability', 'carbon', 'emissions',
      'climate', 'renewable', 'energy', 'waste', 'pollution', 'recycling', 'circular',
      'diversity', 'inclusion', 'safety', 'compliance', 'regulation', 'petrochemical',
      'plastic', 'polymer', 'borouge', 'cbam', 'reach', 'eu', 'reporting'
    ];

    const queryLower = trimmedQuery.toLowerCase();
    const hasESGRelevance = esgKeywords.some(keyword => queryLower.includes(keyword));

    if (!hasESGRelevance && trimmedQuery.length > 5) {
      return {
        isValid: false,
        reason: 'not_esg_related',
        message: 'Query does not appear to be related to ESG topics or Borouge\'s business operations.'
      };
    }

    return {
      isValid: true,
      enhancedQuery: trimmedQuery
    };
  }

  // Main ESG intelligence processing endpoint
  async processQuery(query) {
    const startTime = Date.now();

    try {
      console.log(`🔍 Processing ESG query: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);

      // Validate query first
      const validation = this.validateQuery(query);
      if (!validation.isValid) {
        console.log(`❌ Query validation failed: ${validation.reason}`);
        throw new Error(`Query validation failed: ${validation.message}`);
      }

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

  // NEW: ESG Smart Search with Multi-Source News Intelligence
  async processSmartSearchWithMultiSource(query) {
    const startTime = Date.now();

    try {
      console.log(`🔍 Processing multi-source smart search: "${query}"`);

      // Validate query first
      const validation = this.validateQuery(query);
      if (!validation.isValid) {
        console.log(`❌ Smart search validation failed: ${validation.reason}`);
        throw new Error(`Query validation failed: ${validation.message}`);
      }

      // Step 1: Enhance query with Borouge context
      const queryEnhancements = this.queryEnhancementService.enhanceQuery(query);
      console.log(`📝 Query enhanced with ${queryEnhancements.enhancedKeywords?.length || 0} keywords`);

      // Step 2: Search multiple news sources
      const newsResults = await this.newsService.searchMultipleSources(query, {
        maxResults: 30,
        language: 'en'
      });

      if (!newsResults.success) {
        throw new Error(`Multi-source news search failed: ${newsResults.error}`);
      }

      console.log(`📰 Multi-source search found ${newsResults.articles.length} articles from ${newsResults.searchStrategies?.length || 0} strategies`);

      // Step 3: Analyze articles with AI
      const analyzedArticles = await this.articleAnalysisService.analyzeArticlesWithAI(
        newsResults.articles,
        queryEnhancements
      );

      console.log(`🤖 AI analysis completed: ${analyzedArticles.length} articles analyzed`);

      // Step 4: Generate comprehensive executive summary
      console.log(`📊 Generating comprehensive executive summary...`);
      const executiveSummary = await this.executiveSummaryService.generateComprehensiveExecutiveSummary(
        query,
        analyzedArticles,
        queryEnhancements
      );

      // Step 5: Structure enhanced smart search response
      const response = this.articleAnalysisService.structureSmartSearchResponse(
        query,
        queryEnhancements,
        newsResults,
        analyzedArticles,
        startTime
      );

      // Step 6: Integrate comprehensive executive summary
      response.comprehensiveExecutiveSummary = executiveSummary;
      response.analysisDepth = 'comprehensive';
      response.strategicIntelligence = true;

      // Step 7: Cache the enhanced result
      const cacheKey = `multi_search_comprehensive_${this.articleAnalysisService.generateQueryHash(query)}`;
      await this.cacheService.saveToCache(cacheKey, response);

      const processingTime = Date.now() - startTime;
      console.log(`✅ Multi-source smart search with comprehensive analysis completed in ${processingTime}ms`);

      return response;

    } catch (error) {
      console.error('❌ Multi-source smart search failed:', error);

      // Fallback to regular smart search
      console.log('🔄 Falling back to regular smart search...');
      return await this.processSmartSearch(query);
    }
  }

  // NEW: ESG Smart Search with News Intelligence
  async processSmartSearch(query) {
    const startTime = Date.now();

    try {
      console.log(`🔍 Starting ESG Smart Search for: "${query}"`);

      // Validate query first
      const validation = this.validateQuery(query);
      if (!validation.isValid) {
        console.log(`❌ Smart search validation failed: ${validation.reason}`);
        throw new Error(`Query validation failed: ${validation.message}`);
      }

      // Step 1: Enhance query using Bo_Prompt context
      const queryEnhancements = this.queryEnhancementService.enhanceQuery(query);
      console.log(`🎯 Enhanced query with ${queryEnhancements.enhancedKeywords.length} keywords`);

      // Step 2: Create search session for tracking
      const searchSession = await this.queryEnhancementService.createSearchSession(query, queryEnhancements);

      // Step 3: Check cache for similar searches
      const cacheKey = `smart_search_${this.articleAnalysisService.generateQueryHash(query)}`;
      const cachedResult = await this.cacheService.checkCache(cacheKey);

      if (cachedResult) {
        console.log('✅ Smart search cache HIT');
        return cachedResult;
      }

      // Step 4: Search news using enhanced keywords
      const newsResults = await this.newsService.searchNews(query, {
        maxResults: 20,
        language: 'en',
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Last 7 days
      });

      if (!newsResults.success) {
        throw new Error(`News search failed: ${newsResults.error}`);
      }

      // Step 5: Analyze articles with AI for relevance and impact
      const analyzedArticles = await this.articleAnalysisService.analyzeArticlesWithAI(newsResults.articles, queryEnhancements);

      // Step 5.5: Generate comprehensive executive summary
      console.log(`📊 Generating comprehensive executive summary for regular smart search...`);
      const executiveSummary = await this.executiveSummaryService.generateComprehensiveExecutiveSummary(
        query,
        analyzedArticles,
        queryEnhancements
      );

      // Step 6: Structure smart search response
      const response = this.articleAnalysisService.structureSmartSearchResponse(
        query,
        queryEnhancements,
        newsResults,
        analyzedArticles,
        startTime
      );

      // Step 6.5: Integrate comprehensive executive summary
      response.comprehensiveExecutiveSummary = executiveSummary;
      response.analysisDepth = 'comprehensive';
      response.strategicIntelligence = true;

      // Step 7: Update search session with results
      if (searchSession) {
        await this.queryEnhancementService.updateSearchSession(searchSession.id, {
          articlesFound: newsResults.articlesFound,
          relevantArticles: analyzedArticles.filter(a => a.relevance_score >= 70).length,
          highImpactCount: analyzedArticles.filter(a => a.impact_level === 'HIGH').length,
          mediumImpactCount: analyzedArticles.filter(a => a.impact_level === 'MEDIUM').length,
          lowImpactCount: analyzedArticles.filter(a => a.impact_level === 'LOW').length,
          opportunityCount: analyzedArticles.filter(a => a.impact_level === 'OPPORTUNITY').length,
          processingTime: Date.now() - startTime,
          apiCallsMade: 1,
          cacheHits: 0
        });
      }

      // Step 8: Cache the result
      await this.cacheService.saveToCache(cacheKey, response);

      console.log(`✅ Smart search completed in ${Date.now() - startTime}ms`);
      return response;

    } catch (error) {
      console.error('❌ Smart search error:', error.message);

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
      response: aiResult.response || `ESG Intelligence Analysis for "${query}": Comprehensive analysis temporarily unavailable. Please check system configuration.`
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
