// Enhanced AI Service for Borouge ESG Intelligence Platform
// Advanced multi-provider strategy with intelligent load balancing and quality monitoring

const crypto = require('crypto');
const AIProviderManager = require('./aiProviderManager');
const ResponseParser = require('./responseParser');

class AIService {
  constructor(config, supabase) {
    this.config = config;
    this.supabase = supabase;
    this.rateLimitTracking = new Map();

    // Initialize advanced components
    this.providerManager = new AIProviderManager(config, supabase);
    this.responseParser = new ResponseParser();

    // Provider-level caching
    this.providerCache = new Map();
    this.cacheTimeout = 300000; // 5 minutes for provider-level cache

    console.log('🚀 Enhanced AI Service initialized with advanced features');
  }

  // Generate query hash for caching
  generateQueryHash(query) {
    return crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('base64');
  }

  // Check rate limits for AI providers
  checkRateLimit(provider, limit) {
    const now = Date.now();
    const windowStart = now - 60000; // 1 minute window

    const requests = this.rateLimitTracking.get(provider) || [];
    const recentRequests = requests.filter(time => time > windowStart);

    if (recentRequests.length >= limit) {
      return false;
    }

    recentRequests.push(now);
    this.rateLimitTracking.set(provider, recentRequests);
    return true;
  }

  // Borouge-specific ESG context for AI prompts
  getBorogueContext() {
    return `You are an ESG intelligence analyst for Borouge, a UAE-based petrochemical company (ADNOC subsidiary).

Company Context:
- Products: 5M tonnes polyolefins (polypropylene/polyethylene annually)
- EU Exports: €2.3B annually (major revenue stream)
- Asian Markets: $1.8B annually
- Key Competitors: SABIC, Dow Chemical, ExxonMobil Chemical, LyondellBasell
- Parent Company: ADNOC (renewable energy transition underway)
- Location: UAE (carbon neutrality 2050 commitment)
- Business Focus: Sustainable petrochemicals, circular economy, ESG compliance

Your task is to analyze ESG queries and provide structured business intelligence specifically relevant to Borouge's operations, market position, and strategic challenges.`;
  }

  // Create structured prompt for AI analysis
  createAnalysisPrompt(query, isFollowUp = false, previousContext = null) {
    const baseContext = this.getBorogueContext();

    let prompt = `${baseContext}

${isFollowUp ? `Previous Context: ${JSON.stringify(previousContext)}` : ''}

Query: "${query}"

CRITICAL: Return ONLY a valid JSON object. Do not include any text before or after the JSON. Do not use markdown formatting or code blocks. Start directly with { and end with }.

Provide analysis in this exact JSON structure:
{
  "executiveSummary": "2-3 sentence summary of business impact for Borouge executives",
  "articles": [
    {
      "articleId": 1,
      "reportType": "Critical Regulatory Compliance Analysis",
      "priorityLabel": "CRITICAL REGULATORY COMPLIANCE",
      "priority": "HIGH",
      "executiveSummary": "Executive summary specific to this article",
      "keyFindings": [
        {
          "priority": "HIGH",
          "title": "Finding title",
          "description": "Detailed description with specific numbers/impact",
          "businessImpact": "Direct impact on Borouge operations/financials"
        }
      ],
      "detailedAnalysis": "Comprehensive analysis with regulatory details, competitive implications, and strategic recommendations",
      "financialImpact": {
        "shortTerm": "0-2 years impact with specific numbers",
        "longTerm": "3-5 years impact with specific numbers",
        "investmentRequired": "Estimated investment needed"
      },
      "actionItems": [
        "Specific actionable next steps for Borouge teams"
      ],
      "sources": 5
    },
    {
      "articleId": 2,
      "reportType": "High Financial Impact Assessment",
      "priorityLabel": "HIGH FINANCIAL IMPACT",
      "priority": "HIGH",
      "executiveSummary": "Executive summary for second article",
      "keyFindings": [
        {
          "priority": "MEDIUM",
          "title": "Secondary finding title",
          "description": "Secondary analysis",
          "businessImpact": "Secondary business impact"
        }
      ],
      "detailedAnalysis": "Second comprehensive analysis",
      "financialImpact": {
        "shortTerm": "Short term financial impact",
        "longTerm": "Long term financial impact",
        "investmentRequired": "Investment requirements"
      },
      "actionItems": [
        "Additional actionable steps"
      ],
      "sources": 4
    }
  ],
  "overallRiskLevel": "HIGH|MEDIUM|LOW",
  "totalSources": 9
}

Focus on:
1. Regulatory compliance impacts (EU CBAM, plastic directives, UAE regulations)
2. Financial implications for €2.3B EU exports and $1.8B Asian markets
3. Competitive positioning vs SABIC, Dow, ExxonMobil, LyondellBasell
4. Sustainability opportunities and ESG compliance requirements
5. Specific actionable recommendations for Borouge leadership

Ensure exactly 2 articles with priority-based classification.`;

    return prompt;
  }

  // Groq API integration (Primary AI Engine)
  async analyzeWithGroq(query, isFollowUp = false, previousContext = null) {
    if (!this.checkRateLimit('groq', this.config.groq.rateLimit)) {
      throw new Error('Groq rate limit exceeded');
    }

    const prompt = this.createAnalysisPrompt(query, isFollowUp, previousContext);

    try {
      console.log(`🔄 Making Groq API request...`);
      const requestBody = {
        model: this.config.groq.model,
        messages: [
          { role: 'system', content: this.getBorogueContext() },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      };

      console.log(`📤 Groq request: ${this.config.groq.baseUrl}/chat/completions`);
      console.log(`📤 Model: ${requestBody.model}`);

      const response = await fetch(`${this.config.groq.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.groq.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`📥 Groq response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Groq API error response: ${errorText}`);
        throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`📊 Groq response structure:`, Object.keys(data));

      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error(`❌ Unexpected Groq response structure:`, data);
        throw new Error('Invalid Groq API response structure');
      }

      const content = data.choices[0].message.content;

      // Return the raw content for the response parser to handle
      console.log(`✅ Groq API response received (${content.length} chars)`);
      return content;

    } catch (error) {
      console.error('❌ Groq API error:', error.message);
      throw error;
    }
  }

  // Gemini API integration (Secondary AI Engine)
  async analyzeWithGemini(query, isFollowUp = false, previousContext = null) {
    if (!this.checkRateLimit('gemini', this.config.gemini.rateLimit)) {
      throw new Error('Gemini rate limit exceeded');
    }

    const prompt = this.createAnalysisPrompt(query, isFollowUp, previousContext);

    try {
      console.log(`🔄 Making Gemini API request...`);
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2000
        }
      };

      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.config.gemini.apiKey}`;
      console.log(`📤 Gemini request URL: ${apiUrl.replace(this.config.gemini.apiKey, 'API_KEY_HIDDEN')}`);

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log(`📥 Gemini response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Gemini API error response: ${errorText}`);
        throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`📊 Gemini response structure:`, Object.keys(data));

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        console.error(`❌ Unexpected Gemini response structure:`, data);
        throw new Error('Invalid Gemini API response structure');
      }

      const content = data.candidates[0].content.parts[0].text;

      // Return the raw content for the response parser to handle
      console.log(`✅ Gemini API response received (${content.length} chars)`);
      return content;

    } catch (error) {
      console.error('❌ Gemini API error:', error.message);
      throw error;
    }
  }

  // OpenAI API integration (Emergency Backup)
  async analyzeWithOpenAI(query, isFollowUp = false, previousContext = null) {
    if (!this.config.openai.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = this.createAnalysisPrompt(query, isFollowUp, previousContext);

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.openai.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'system', content: this.getBorogueContext() },
            { role: 'user', content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;

      // Return the raw content for the response parser to handle
      console.log(`✅ OpenAI API response received (${content.length} chars)`);
      return content;

    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  // Enhanced multi-provider AI analysis with intelligent selection and quality monitoring
  async analyzeQuery(query, isFollowUp = false, previousContext = null) {
    const startTime = Date.now();
    const queryComplexity = this.assessQueryComplexity(query);

    console.log(`🔍 Starting enhanced AI analysis (complexity: ${queryComplexity})`);

    // Check provider-level cache first
    const cacheKey = this.generateProviderCacheKey(query, isFollowUp, previousContext);
    const cachedResult = this.getFromProviderCache(cacheKey);
    if (cachedResult) {
      console.log('⚡ Returning provider-cached result');
      return cachedResult;
    }

    let attempts = 0;
    const maxAttempts = 3;
    let lastError = null;

    while (attempts < maxAttempts) {
      attempts++;

      try {
        // Select optimal provider based on current conditions
        const selectedProvider = this.providerManager.selectOptimalProvider(queryComplexity, isFollowUp);
        console.log(`🎯 Attempt ${attempts}: Using ${selectedProvider} (complexity: ${queryComplexity})`);

        // Record provider usage for rate limiting
        this.providerManager.recordProviderUsage(selectedProvider);

        // Perform analysis with selected provider
        console.log(`🚀 Starting analysis with ${selectedProvider}...`);
        const rawResponse = await this.performProviderAnalysis(selectedProvider, query, isFollowUp, previousContext);
        console.log(`📝 Raw response received from ${selectedProvider}: ${typeof rawResponse} (${rawResponse ? rawResponse.length : 0} chars)`);

        // Parse and validate response
        console.log(`🔍 Parsing response from ${selectedProvider}...`);
        const parseResult = await this.responseParser.parseResponse(rawResponse, selectedProvider, query);
        console.log(`📊 Parse result: success=${parseResult.success}, quality=${parseResult.qualityScore || 'N/A'}`);

        const responseTime = Date.now() - startTime;

        if (parseResult.success) {
          // Record successful response
          this.providerManager.recordProviderResponse(selectedProvider, true, responseTime, parseResult.qualityScore);

          // Cache the result
          this.saveToProviderCache(cacheKey, parseResult.data);

          // Track analytics
          await this.trackAnalytics(query, selectedProvider, responseTime, parseResult.data.totalSources || 0, parseResult.qualityScore);

          console.log(`✅ Analysis completed successfully with ${selectedProvider} (${responseTime}ms, quality: ${parseResult.qualityScore})`);
          return parseResult.data;
        } else {
          // Record as failure and continue to next attempt
          this.providerManager.recordProviderResponse(selectedProvider, false, responseTime, 0);
          console.warn(`⚠️ Provider ${selectedProvider} failed to generate valid response, trying next provider...`);

          if (attempts === maxAttempts) {
            throw new Error(`All AI providers failed to generate valid responses after ${attempts} attempts`);
          }
        }

      } catch (error) {
        console.warn(`⚠️ Attempt ${attempts} failed: ${error.message}`);
        lastError = error;

        // Record provider failure
        if (error.provider) {
          this.providerManager.recordProviderResponse(error.provider, false, Date.now() - startTime, 0);
        }

        // If this was the last attempt, throw error
        if (attempts === maxAttempts) {
          break;
        }

        // Wait before retry (exponential backoff)
        await this.sleep(Math.pow(2, attempts - 1) * 1000);
      }
    }

    // All attempts failed - throw error instead of using fallback
    console.error(`❌ All analysis attempts failed after ${attempts} tries`);

    // Track failure analytics
    await this.trackAnalytics(query, 'failed', Date.now() - startTime, 0, 0);

    throw new Error(`All AI providers failed: ${lastError?.message || 'Unknown error'}. Please check API keys and provider availability.`);
  }

  // Assess query complexity for optimal provider selection
  assessQueryComplexity(query) {
    const complexityIndicators = {
      high: ['competitive analysis', 'financial impact', 'strategic', 'comprehensive', 'detailed analysis'],
      medium: ['regulatory', 'compliance', 'market', 'trend', 'comparison'],
      low: ['what is', 'define', 'explain', 'simple', 'basic']
    };

    const lowerQuery = query.toLowerCase();

    for (const [level, indicators] of Object.entries(complexityIndicators)) {
      if (indicators.some(indicator => lowerQuery.includes(indicator))) {
        return level;
      }
    }

    // Default to medium complexity
    return 'medium';
  }

  // Generate cache key for provider-level caching
  generateProviderCacheKey(query, isFollowUp, previousContext) {
    const contextHash = previousContext ? crypto.createHash('md5').update(JSON.stringify(previousContext)).digest('hex').substring(0, 8) : 'none';
    return `${this.generateQueryHash(query)}_${isFollowUp}_${contextHash}`;
  }

  // Get from provider-level cache
  getFromProviderCache(cacheKey) {
    const cached = this.providerCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  // Save to provider-level cache
  saveToProviderCache(cacheKey, data) {
    this.providerCache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    // Clean old cache entries
    if (this.providerCache.size > 100) {
      const oldestKey = this.providerCache.keys().next().value;
      this.providerCache.delete(oldestKey);
    }
  }

  // Sleep utility for retry delays
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Perform analysis with specific provider
  async performProviderAnalysis(provider, query, isFollowUp, previousContext) {
    switch (provider) {
      case 'groq':
        return await this.analyzeWithGroq(query, isFollowUp, previousContext);
      case 'gemini':
        return await this.analyzeWithGemini(query, isFollowUp, previousContext);
      case 'openai':
        return await this.analyzeWithOpenAI(query, isFollowUp, previousContext);
      default:
        throw new Error(`Unknown provider: ${provider}`);
    }
  }

  // Get provider statistics for monitoring
  getProviderStatistics() {
    return this.providerManager.getProviderStatistics();
  }

  // Get optimization recommendations
  getOptimizationRecommendations() {
    return this.providerManager.getOptimizationRecommendations();
  }

  // Get provider health summary
  getProviderHealthSummary() {
    return this.providerManager.getHealthSummary();
  }

  // This method has been removed - we now require real AI responses only

  // Enhanced analytics tracking with quality scores and provider details
  async trackAnalytics(query, aiProvider, responseTime, sourcesFound, qualityScore = null) {
    try {
      const analyticsData = {
        query: query,
        query_type: this.categorizeQuery(query),
        response_time_ms: responseTime,
        sources_found: sourcesFound,
        user_rating: null,
        follow_up_count: 0,
        created_at: new Date().toISOString()
      };

      // Add quality score if available (extend table schema if needed)
      if (qualityScore !== null) {
        // For now, we'll use user_rating field to store quality score
        // In production, consider adding a dedicated quality_score column
        analyticsData.user_rating = Math.round(qualityScore / 20); // Convert 0-100 to 1-5 scale
      }

      await this.supabase
        .from('esg_query_analytics')
        .insert(analyticsData);

      console.log(`📊 Enhanced analytics tracked: ${aiProvider} | ${responseTime}ms | ${sourcesFound} sources | quality: ${qualityScore || 'N/A'}`);

      // Track provider-specific metrics
      await this.trackProviderMetrics(aiProvider, responseTime, qualityScore);

    } catch (error) {
      console.error('Failed to track analytics:', error);
    }
  }

  // Track provider-specific metrics for optimization
  async trackProviderMetrics(provider, responseTime, qualityScore) {
    try {
      // This could be extended to store in a separate provider_metrics table
      // For now, we'll rely on the provider manager's in-memory tracking
      console.log(`📈 Provider metrics: ${provider} - ${responseTime}ms response, ${qualityScore || 'N/A'} quality`);
    } catch (error) {
      console.error('Failed to track provider metrics:', error);
    }
  }

  // Categorize query for analytics
  categorizeQuery(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('regulation') || lowerQuery.includes('compliance') || lowerQuery.includes('cbam') || lowerQuery.includes('directive')) {
      return 'regulatory';
    } else if (lowerQuery.includes('financial') || lowerQuery.includes('cost') || lowerQuery.includes('investment') || lowerQuery.includes('revenue')) {
      return 'financial';
    } else if (lowerQuery.includes('competitor') || lowerQuery.includes('sabic') || lowerQuery.includes('dow') || lowerQuery.includes('exxon')) {
      return 'competitive';
    } else if (lowerQuery.includes('market') || lowerQuery.includes('trend') || lowerQuery.includes('demand')) {
      return 'market';
    } else if (lowerQuery.includes('environment') || lowerQuery.includes('carbon') || lowerQuery.includes('emission') || lowerQuery.includes('sustainability')) {
      return 'environmental';
    } else if (lowerQuery.includes('governance') || lowerQuery.includes('reporting') || lowerQuery.includes('stakeholder')) {
      return 'governance';
    } else {
      return 'strategic';
    }
  }
}

module.exports = AIService;
