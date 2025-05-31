// News Service for Borouge ESG Intelligence Platform
// GNews API integration with intelligent quota management and Borouge-specific filtering

const crypto = require('crypto');

class NewsService {
  constructor(config, supabase) {
    this.config = config;
    this.supabase = supabase;

    // API configuration
    this.gnewsConfig = config.gnews;
    this.quotaManager = new Map();

    // Initialize quota tracking
    this.initializeQuotaTracking();

    console.log('📰 News Service initialized with GNews API integration');
  }

  // Initialize quota tracking for the current day
  async initializeQuotaTracking() {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Check if quota record exists for today
      const { data: existingQuota } = await this.supabase
        .from('esg_api_quota_tracking')
        .select('*')
        .eq('api_provider', 'gnews')
        .eq('date', today)
        .single();

      if (!existingQuota) {
        // Create new quota record for today
        await this.supabase
          .from('esg_api_quota_tracking')
          .insert({
            api_provider: 'gnews',
            date: today,
            requests_made: 0,
            daily_limit: this.gnewsConfig.dailyLimit
          });

        console.log(`📊 Initialized GNews quota tracking for ${today}`);
      }
    } catch (error) {
      console.error('❌ Error initializing quota tracking:', error.message);
    }
  }

  // Check available quota for GNews API
  async checkQuotaAvailable() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: quota } = await this.supabase
        .from('esg_api_quota_tracking')
        .select('*')
        .eq('api_provider', 'gnews')
        .eq('date', today)
        .single();

      if (!quota) {
        await this.initializeQuotaTracking();
        return this.gnewsConfig.dailyLimit;
      }

      const remaining = quota.daily_limit - quota.requests_made;
      console.log(`📊 GNews quota: ${quota.requests_made}/${quota.daily_limit} used, ${remaining} remaining`);

      return remaining;
    } catch (error) {
      console.error('❌ Error checking quota:', error.message);
      return 0;
    }
  }

  // Update quota usage
  async updateQuotaUsage() {
    try {
      const today = new Date().toISOString().split('T')[0];

      // First get the current requests_made count
      const { data: currentData, error: fetchError } = await this.supabase
        .from('esg_api_quota_tracking')
        .select('requests_made')
        .eq('api_provider', 'gnews')
        .eq('date', today)
        .single();

      if (fetchError) {
        console.error('❌ Error fetching current quota:', fetchError.message);
        return;
      }

      // Update with incremented value
      const { error } = await this.supabase
        .from('esg_api_quota_tracking')
        .update({
          requests_made: (currentData.requests_made || 0) + 1,
          last_request_at: new Date().toISOString()
        })
        .eq('api_provider', 'gnews')
        .eq('date', today);

      if (error) {
        console.error('❌ Error updating quota:', error.message);
      }
    } catch (error) {
      console.error('❌ Error updating quota usage:', error.message);
    }
  }

  // Generate Borouge-specific search keywords from user query
  generateBorogueKeywords(userQuery) {
    const borogueContext = {
      products: ['polyethylene', 'polypropylene', 'LLDPE', 'HDPE', 'PP'],
      markets: ['UAE', 'Singapore', 'China', 'India', 'Europe', 'Asia'],
      regulations: ['CBAM', 'REACH', 'plastic waste', 'circular economy', 'carbon border'],
      competitors: ['SABIC', 'Dow', 'ExxonMobil', 'Borealis', 'ADNOC'],
      themes: ['ESG', 'sustainability', 'petrochemical', 'regulations', 'compliance']
    };

    const queryLower = userQuery.toLowerCase();
    const enhancedKeywords = [];

    // Add base query
    enhancedKeywords.push(userQuery);

    // Add relevant Borouge context based on query content
    Object.entries(borogueContext).forEach(([category, keywords]) => {
      keywords.forEach(keyword => {
        if (queryLower.includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(queryLower)) {
          enhancedKeywords.push(keyword);
        }
      });
    });

    // Add industry-specific combinations
    if (queryLower.includes('plastic') || queryLower.includes('polymer')) {
      enhancedKeywords.push('petrochemical regulations');
      enhancedKeywords.push('plastic waste management');
    }

    if (queryLower.includes('regulation') || queryLower.includes('compliance')) {
      enhancedKeywords.push('petrochemical compliance');
      enhancedKeywords.push('UAE regulations');
    }

    // Remove duplicates and limit to top 5 keywords
    return [...new Set(enhancedKeywords)].slice(0, 5);
  }

  // Search news using GNews API
  async searchNews(query, options = {}) {
    const startTime = Date.now();

    try {
      // Check quota availability
      const quotaRemaining = await this.checkQuotaAvailable();
      if (quotaRemaining <= 0) {
        throw new Error('GNews API daily quota exceeded');
      }

      // Generate enhanced keywords
      const keywords = this.generateBorogueKeywords(query);
      const searchQuery = keywords.join(' OR ');

      console.log(`🔍 Searching GNews with enhanced query: "${searchQuery}"`);

      // Prepare API request
      const params = new URLSearchParams({
        q: searchQuery,
        lang: options.language || 'en',
        country: options.country || 'us',
        max: options.maxResults || 10,
        apikey: this.gnewsConfig.apiKey
      });

      // Add date range if specified
      if (options.from) {
        params.append('from', options.from);
      }
      if (options.to) {
        params.append('to', options.to);
      }

      const apiUrl = `${this.gnewsConfig.baseUrl}/search?${params.toString()}`;
      console.log(`📤 GNews API request: ${apiUrl.replace(this.gnewsConfig.apiKey, 'API_KEY_HIDDEN')}`);

      // Make API request
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Borouge-ESG-Intelligence/1.0'
        }
      });

      if (!response.ok) {
        throw new Error(`GNews API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      // Update quota usage
      await this.updateQuotaUsage();

      const processingTime = Date.now() - startTime;
      console.log(`✅ GNews API response: ${data.articles?.length || 0} articles (${processingTime}ms)`);

      // Process articles (skip database storage for now due to connection issues)
      const processedArticles = this.processArticlesInMemory(data.articles || [], keywords);

      return {
        success: true,
        query: searchQuery,
        originalQuery: query,
        keywords: keywords,
        articlesFound: data.articles?.length || 0,
        articles: processedArticles,
        processingTime: processingTime,
        quotaRemaining: quotaRemaining - 1
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      console.error('❌ News search error:', error.message);

      return {
        success: false,
        error: error.message,
        query: query,
        processingTime: processingTime
      };
    }
  }

  // Enhanced multi-source search for comprehensive coverage
  async searchMultipleSources(query, options = {}) {
    const results = [];
    const errors = [];
    const searchStrategies = [];

    try {
      // Strategy 1: Primary search with original query
      console.log(`🔍 Strategy 1: Primary search for "${query}"`);
      const primaryResults = await this.searchNews(query, options);
      if (primaryResults.success) {
        results.push(...primaryResults.articles);
        searchStrategies.push(`Primary: ${primaryResults.articles.length} articles`);
      } else {
        errors.push(`Primary search: ${primaryResults.error}`);
      }
    } catch (error) {
      errors.push(`Primary search: ${error.message}`);
    }

    try {
      // Strategy 2: Broader industry search
      const industryTerms = ['petrochemical', 'chemical industry', 'polymer', 'plastic'];
      const industryQuery = `"${query}" AND (${industryTerms.join(' OR ')})`;
      console.log(`🔍 Strategy 2: Industry search for "${industryQuery}"`);

      const industryResults = await this.searchNews(industryQuery, {
        ...options,
        maxResults: 15,
        country: 'us' // Broader geographic scope
      });

      if (industryResults.success) {
        // Filter out duplicates by URL
        const newArticles = industryResults.articles.filter(article =>
          !results.some(existing => existing.url === article.url)
        );
        results.push(...newArticles);
        searchStrategies.push(`Industry: ${newArticles.length} new articles`);
      }
    } catch (error) {
      errors.push(`Industry search: ${error.message}`);
    }

    try {
      // Strategy 3: ESG-focused search
      const esgTerms = ['ESG', 'sustainability', 'carbon', 'environment', 'circular economy'];
      const esgQuery = `"${query}" AND (${esgTerms.join(' OR ')})`;
      console.log(`🔍 Strategy 3: ESG search for "${esgQuery}"`);

      const esgResults = await this.searchNews(esgQuery, {
        ...options,
        maxResults: 10,
        country: 'ae' // UAE focus for regional relevance
      });

      if (esgResults.success) {
        const newArticles = esgResults.articles.filter(article =>
          !results.some(existing => existing.url === article.url)
        );
        results.push(...newArticles);
        searchStrategies.push(`ESG: ${newArticles.length} new articles`);
      }
    } catch (error) {
      errors.push(`ESG search: ${error.message}`);
    }

    // Sort by publication date (newest first)
    results.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    console.log(`✅ Multi-source search completed: ${results.length} total articles from ${searchStrategies.length} strategies`);

    return {
      success: results.length > 0,
      articles: results.slice(0, 30), // Limit to top 30 articles
      totalFound: results.length,
      searchStrategies: searchStrategies,
      errors: errors.length > 0 ? errors : null,
      query: query
    };
  }

  // Process articles in memory (without database storage)
  processArticlesInMemory(articles, keywords) {
    const processedArticles = [];

    for (const article of articles) {
      try {
        // Create processed article object
        const processedArticle = {
          id: `gnews_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          title: article.title,
          description: article.description,
          content: article.content,
          url: article.url,
          source: article.source?.name || 'Unknown',
          author: article.author,
          published_at: article.publishedAt,
          image_url: article.image,
          borouge_keywords: keywords,
          processing_status: 'pending'
        };

        processedArticles.push(processedArticle);
        console.log(`📄 Processed article: ${article.title.substring(0, 50)}...`);

      } catch (error) {
        console.error(`❌ Error processing article: ${error.message}`);
      }
    }

    return processedArticles;
  }

  // Process and store articles in database
  async processArticles(articles, keywords) {
    const processedArticles = [];

    for (const article of articles) {
      try {
        // Check if article already exists
        const { data: existingArticle } = await this.supabase
          .from('esg_news_articles')
          .select('id')
          .eq('url', article.url)
          .single();

        if (existingArticle) {
          console.log(`📄 Article already exists: ${article.title.substring(0, 50)}...`);
          continue;
        }

        // Store article in database
        const { data: savedArticle, error } = await this.supabase
          .from('esg_news_articles')
          .insert({
            title: article.title,
            description: article.description,
            content: article.content,
            url: article.url,
            source: article.source?.name || 'Unknown',
            author: article.author,
            published_at: article.publishedAt,
            image_url: article.image,
            borouge_keywords: keywords,
            processing_status: 'pending'
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error saving article:', error.message);
          continue;
        }

        processedArticles.push(savedArticle);
        console.log(`💾 Saved article: ${article.title.substring(0, 50)}...`);

      } catch (error) {
        console.error('❌ Error processing article:', error.message);
      }
    }

    return processedArticles;
  }

  // Get health status of news service
  async getHealthStatus() {
    try {
      const quotaRemaining = await this.checkQuotaAvailable();

      return {
        status: quotaRemaining > 0 ? 'healthy' : 'quota_exceeded',
        quotaRemaining: quotaRemaining,
        dailyLimit: this.gnewsConfig.dailyLimit,
        apiConfigured: !!this.gnewsConfig.apiKey
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  // Get recent articles from database
  async getRecentArticles(limit = 10, impactLevel = null) {
    try {
      let query = this.supabase
        .from('esg_news_articles')
        .select('*')
        .eq('processing_status', 'completed')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (impactLevel) {
        query = query.eq('impact_level', impactLevel);
      }

      const { data: articles, error } = await query;

      if (error) {
        throw error;
      }

      return articles || [];
    } catch (error) {
      console.error('❌ Error fetching recent articles:', error.message);
      return [];
    }
  }
}

module.exports = NewsService;
