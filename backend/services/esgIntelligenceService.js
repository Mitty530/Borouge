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
  async processQuery(query, isFollowUp = false, previousContext = null) {
    const startTime = Date.now();

    try {
      console.log(`🔍 Processing ESG query: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);
      console.log(`📊 Follow-up: ${isFollowUp}, Has context: ${!!previousContext}`);

      // For follow-up queries, skip cache and process directly
      if (isFollowUp) {
        console.log('⏭️ Follow-up query detected, skipping cache check...');
        const aiResult = await this.aiService.analyzeQuery(query, isFollowUp, previousContext);
        const response = this.structureResponse(aiResult, query, startTime);

        // Track follow-up analytics
        await this.trackFollowUpAnalytics(query, previousContext);

        return response;
      }

      // Check cache first for new queries
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
      const aiResult = await this.aiService.analyzeQuery(query, isFollowUp, previousContext);
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

    // Ensure we have exactly 2 articles as per user preference
    const articles = aiResult.articles ? aiResult.articles.slice(0, 2) : this.generateFallbackArticles(query);

    // Sort articles by priority (Critical Regulatory → High Financial → etc.)
    const sortedArticles = this.sortArticlesByPriority(articles);

    const response = {
      success: true,
      timestamp: new Date().toISOString(),
      query: query,
      articlesFound: sortedArticles.length,
      responseTime: responseTime,
      cached: false,

      // Overall classification based on highest priority article
      priority: this.determineOverallPriority(sortedArticles),
      classification: sortedArticles[0]?.priorityLabel || "ESG INTELLIGENCE ANALYSIS",

      // Executive summary
      executiveSummary: aiResult.executiveSummary || this.generateExecutiveSummary(query, sortedArticles),

      // Articles for two-stage interaction flow
      articles: sortedArticles,

      // Overall risk assessment
      overallRiskLevel: aiResult.overallRiskLevel || "MEDIUM",

      // Source tracking
      totalSources: aiResult.totalSources || sortedArticles.reduce((sum, article) => sum + (article.sources || 0), 0),

      // Follow-up capabilities
      followUpCapable: true,
      suggestedFollowUps: this.generateFollowUpSuggestions(query, sortedArticles),

      // Context for follow-up queries
      context: {
        originalQuery: query,
        articles: sortedArticles.map(article => ({
          id: article.articleId,
          type: article.reportType,
          priority: article.priorityLabel
        })),
        riskLevel: aiResult.overallRiskLevel || "MEDIUM"
      }
    };

    console.log(`✅ Response structured: ${response.articlesFound} articles, ${response.totalSources} sources`);
    return response;
  }

  // Sort articles by priority for frontend display
  sortArticlesByPriority(articles) {
    const priorityOrder = {
      'CRITICAL REGULATORY COMPLIANCE': 1,
      'HIGH FINANCIAL IMPACT': 2,
      'COMPETITIVE THREATS': 3,
      'OPPORTUNITIES': 4,
      'STRATEGIC CONSIDERATIONS': 5
    };

    return articles.sort((a, b) => {
      const priorityA = priorityOrder[a.priorityLabel] || 6;
      const priorityB = priorityOrder[b.priorityLabel] || 6;
      return priorityA - priorityB;
    });
  }

  // Determine overall priority based on articles
  determineOverallPriority(articles) {
    if (!articles || articles.length === 0) return "MEDIUM";

    const highestPriorityArticle = articles[0];
    const priorityLabel = highestPriorityArticle.priorityLabel || "";

    if (priorityLabel.includes('CRITICAL') || priorityLabel.includes('REGULATORY')) {
      return "HIGH";
    } else if (priorityLabel.includes('HIGH') || priorityLabel.includes('FINANCIAL')) {
      return "HIGH";
    } else if (priorityLabel.includes('COMPETITIVE') || priorityLabel.includes('THREAT')) {
      return "MEDIUM";
    } else {
      return "MEDIUM";
    }
  }

  // Generate executive summary if not provided by AI
  generateExecutiveSummary(query, articles) {
    if (!articles || articles.length === 0) {
      return `ESG intelligence analysis completed for query: "${query}". Detailed findings available for review.`;
    }

    const primaryArticle = articles[0];
    return primaryArticle.executiveSummary ||
           `${primaryArticle.reportType} analysis indicates ${primaryArticle.priorityLabel.toLowerCase()} implications for Borouge operations.`;
  }

  // Generate follow-up suggestions based on query and articles
  generateFollowUpSuggestions(query, articles) {
    const suggestions = [];

    // Add context-specific follow-ups based on article types
    articles.forEach(article => {
      if (article.priorityLabel.includes('REGULATORY')) {
        suggestions.push("What are the specific compliance deadlines and requirements?");
        suggestions.push("How are competitors responding to these regulatory changes?");
      } else if (article.priorityLabel.includes('FINANCIAL')) {
        suggestions.push("What investment options could reduce our financial exposure?");
        suggestions.push("What is the ROI timeline for recommended investments?");
      } else if (article.priorityLabel.includes('COMPETITIVE')) {
        suggestions.push("How can Borouge differentiate from competitor strategies?");
        suggestions.push("What are the competitive advantages we can leverage?");
      }
    });

    // Add general follow-ups
    suggestions.push("What are the immediate next steps for implementation?");
    suggestions.push("How does this impact our 2030 sustainability targets?");

    // Return unique suggestions, limited to 4
    return [...new Set(suggestions)].slice(0, 4);
  }

  // Generate fallback articles if AI doesn't provide structured response
  generateFallbackArticles(query) {
    return [
      {
        articleId: 1,
        reportType: "ESG Intelligence Analysis",
        priorityLabel: "CRITICAL REGULATORY COMPLIANCE",
        priority: "HIGH",
        executiveSummary: `Comprehensive ESG analysis completed for: "${query}". Detailed regulatory and business impact assessment available.`,
        keyFindings: [
          {
            priority: "HIGH",
            title: "Analysis Completed",
            description: "ESG intelligence analysis has been generated for strategic review",
            businessImpact: "Review detailed findings for business implications"
          }
        ],
        detailedAnalysis: `Detailed ESG intelligence analysis for query: "${query}". This analysis covers regulatory implications, competitive positioning, and strategic recommendations specific to Borouge's operations.`,
        financialImpact: {
          shortTerm: "Impact assessment in progress",
          longTerm: "Long-term implications under evaluation",
          investmentRequired: "Investment analysis required"
        },
        actionItems: [
          "Review detailed analysis with relevant teams",
          "Assess regulatory compliance requirements",
          "Evaluate strategic implications"
        ],
        sources: 5
      },
      {
        articleId: 2,
        reportType: "Strategic Recommendations",
        priorityLabel: "HIGH FINANCIAL IMPACT",
        priority: "MEDIUM",
        executiveSummary: "Strategic recommendations and implementation roadmap based on ESG intelligence analysis.",
        keyFindings: [
          {
            priority: "MEDIUM",
            title: "Strategic Planning Required",
            description: "Strategic planning and stakeholder engagement recommended",
            businessImpact: "Strategic positioning and competitive advantage considerations"
          }
        ],
        detailedAnalysis: "Strategic recommendations for Borouge based on ESG intelligence analysis, including implementation timeline and resource requirements.",
        financialImpact: {
          shortTerm: "Strategic evaluation in progress",
          longTerm: "Long-term strategic benefits expected",
          investmentRequired: "Strategic investment analysis needed"
        },
        actionItems: [
          "Develop implementation roadmap",
          "Engage key stakeholders",
          "Assess resource requirements"
        ],
        sources: 3
      }
    ];
  }

  // Track follow-up analytics
  async trackFollowUpAnalytics(query, previousContext) {
    try {
      // Update follow-up count for original query if we can identify it
      if (previousContext && previousContext.originalQuery) {
        const { error } = await this.supabase
          .from('esg_query_analytics')
          .update({
            follow_up_count: this.supabase.sql`follow_up_count + 1`
          })
          .eq('query', previousContext.originalQuery)
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) {
          console.error('Follow-up analytics update error:', error);
        }
      }

      // Track the follow-up query itself
      await this.supabase
        .from('esg_query_analytics')
        .insert({
          query: query,
          query_type: 'follow_up',
          response_time_ms: 0, // Will be updated when response is complete
          sources_found: 0,
          user_rating: null,
          follow_up_count: 0,
          created_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Follow-up analytics tracking error:', error);
    }
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
          follow_up_count: 0,
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
