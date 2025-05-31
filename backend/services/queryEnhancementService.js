// Query Enhancement Service for Borouge ESG Intelligence Platform
// Uses Bo_Prompt context to enhance search queries for maximum relevance

const fs = require('fs');
const path = require('path');

class QueryEnhancementService {
  constructor(config, supabase) {
    this.config = config;
    this.supabase = supabase;
    
    // Load Bo_Prompt content
    this.boPromptContent = this.loadBoPrompt();
    
    // Borouge-specific context extracted from Bo_Prompt
    this.borogueContext = this.extractBorogueContext();
    
    console.log('🎯 Query Enhancement Service initialized with Bo_Prompt context');
  }

  // Load Bo_Prompt content from file
  loadBoPrompt() {
    try {
      const boPromptPath = path.join(__dirname, '../../Bo_Prompt');
      const content = fs.readFileSync(boPromptPath, 'utf8');
      console.log(`📋 Loaded Bo_Prompt content (${content.length} characters)`);
      return content;
    } catch (error) {
      console.error('❌ Error loading Bo_Prompt:', error.message);
      return '';
    }
  }

  // Extract key Borouge context from Bo_Prompt
  extractBorogueContext() {
    return {
      // Core business context
      company: {
        name: 'Borouge Pte Ltd',
        structure: 'Joint Venture: ADNOC 54%, Borealis 36%, Public 10%',
        headquarters: 'Singapore',
        operations: 'UAE - Ruwais Industrial Complex',
        capacity: '5.0 million tonnes annually'
      },

      // Products and markets
      products: ['LLDPE', 'HDPE', 'PP', 'polyethylene', 'polypropylene', 'polyolefins'],
      
      markets: {
        primary: ['UAE', 'Singapore', 'China', 'India', 'Europe', 'Asia'],
        revenue: {
          total: '$8.5 billion annually',
          eu_exposure: '€2.3 billion (27% of revenue)',
          asia_exposure: '$1.8 billion'
        }
      },

      // Regulatory focus areas
      regulations: [
        'CBAM', 'REACH', 'Packaging & Packaging Waste Directive',
        'Circular Economy Action Plan', 'UAE Vision 2071',
        'National Climate Change Plan 2017-2050', 'Economic Vision 2030'
      ],

      // Competitive landscape
      competitors: {
        primary: ['SABIC', 'Dow Chemical', 'ExxonMobil Chemical'],
        regional: ['EQUATE', 'QAPCO', 'Petro Rabigh']
      },

      // ESG themes
      esgThemes: [
        'carbon intensity', 'circular economy', 'plastic waste',
        'regulatory compliance', 'sustainability', 'ESG reporting',
        'carbon border adjustment', 'petrochemical regulations'
      ],

      // Impact areas
      impactAreas: [
        'production operations', 'export markets', 'regulatory compliance',
        'supply chain', 'competitive positioning', 'financial performance'
      ]
    };
  }

  // Enhance user query with Borouge-specific context
  enhanceQuery(userQuery) {
    const queryLower = userQuery.toLowerCase();
    const enhancements = {
      originalQuery: userQuery,
      enhancedKeywords: [],
      searchStrategies: [],
      contextualTerms: [],
      priorityLevel: 'medium'
    };

    // Add original query
    enhancements.enhancedKeywords.push(userQuery);

    // Product-specific enhancements
    this.borogueContext.products.forEach(product => {
      if (queryLower.includes(product.toLowerCase()) || 
          this.isRelatedTerm(queryLower, product.toLowerCase())) {
        enhancements.enhancedKeywords.push(`${product} regulations`);
        enhancements.enhancedKeywords.push(`${product} market`);
        enhancements.contextualTerms.push(product);
      }
    });

    // Market-specific enhancements
    this.borogueContext.markets.primary.forEach(market => {
      if (queryLower.includes(market.toLowerCase())) {
        enhancements.enhancedKeywords.push(`${market} petrochemical`);
        enhancements.enhancedKeywords.push(`${market} plastic regulations`);
        enhancements.contextualTerms.push(market);
      }
    });

    // Regulatory enhancements
    this.borogueContext.regulations.forEach(regulation => {
      if (queryLower.includes(regulation.toLowerCase()) || 
          this.isRelatedTerm(queryLower, regulation.toLowerCase())) {
        enhancements.enhancedKeywords.push(`${regulation} petrochemical`);
        enhancements.enhancedKeywords.push(`${regulation} impact`);
        enhancements.contextualTerms.push(regulation);
        enhancements.priorityLevel = 'high'; // Regulatory queries are high priority
      }
    });

    // Competitor intelligence
    this.borogueContext.competitors.primary.forEach(competitor => {
      if (queryLower.includes(competitor.toLowerCase())) {
        enhancements.enhancedKeywords.push(`${competitor} strategy`);
        enhancements.enhancedKeywords.push(`${competitor} vs Borouge`);
        enhancements.contextualTerms.push(competitor);
      }
    });

    // ESG theme enhancements
    this.borogueContext.esgThemes.forEach(theme => {
      if (queryLower.includes(theme.toLowerCase()) || 
          this.isRelatedTerm(queryLower, theme.toLowerCase())) {
        enhancements.enhancedKeywords.push(`${theme} petrochemical`);
        enhancements.enhancedKeywords.push(`${theme} UAE`);
        enhancements.contextualTerms.push(theme);
      }
    });

    // Add Borouge-specific context if not already present
    if (!queryLower.includes('borouge') && !queryLower.includes('petrochemical')) {
      enhancements.enhancedKeywords.push('petrochemical industry');
      enhancements.enhancedKeywords.push('polyolefin market');
    }

    // Generate search strategies
    enhancements.searchStrategies = this.generateSearchStrategies(enhancements);

    // Remove duplicates and limit keywords
    enhancements.enhancedKeywords = [...new Set(enhancements.enhancedKeywords)].slice(0, 8);
    enhancements.contextualTerms = [...new Set(enhancements.contextualTerms)];

    return enhancements;
  }

  // Check if terms are related (simple similarity check)
  isRelatedTerm(query, term) {
    const relatedTerms = {
      'plastic': ['polymer', 'polyethylene', 'polypropylene', 'packaging'],
      'regulation': ['compliance', 'law', 'directive', 'policy'],
      'carbon': ['emission', 'climate', 'environmental', 'sustainability'],
      'waste': ['recycling', 'circular', 'disposal', 'management'],
      'market': ['trade', 'export', 'import', 'demand', 'supply']
    };

    for (const [baseterm, related] of Object.entries(relatedTerms)) {
      if (term.includes(baseterm) && related.some(r => query.includes(r))) {
        return true;
      }
    }
    return false;
  }

  // Generate search strategies based on enhancements
  generateSearchStrategies(enhancements) {
    const strategies = [];

    // Strategy 1: Regulatory focus
    if (enhancements.contextualTerms.some(term => 
        this.borogueContext.regulations.includes(term))) {
      strategies.push({
        type: 'regulatory',
        keywords: enhancements.enhancedKeywords.filter(k => 
          k.toLowerCase().includes('regulation') || 
          k.toLowerCase().includes('compliance') ||
          k.toLowerCase().includes('cbam') ||
          k.toLowerCase().includes('reach')),
        priority: 'high'
      });
    }

    // Strategy 2: Market intelligence
    if (enhancements.contextualTerms.some(term => 
        this.borogueContext.markets.primary.includes(term))) {
      strategies.push({
        type: 'market',
        keywords: enhancements.enhancedKeywords.filter(k => 
          this.borogueContext.markets.primary.some(m => 
            k.toLowerCase().includes(m.toLowerCase()))),
        priority: 'medium'
      });
    }

    // Strategy 3: Competitive intelligence
    if (enhancements.contextualTerms.some(term => 
        this.borogueContext.competitors.primary.includes(term))) {
      strategies.push({
        type: 'competitive',
        keywords: enhancements.enhancedKeywords.filter(k => 
          this.borogueContext.competitors.primary.some(c => 
            k.toLowerCase().includes(c.toLowerCase()))),
        priority: 'medium'
      });
    }

    // Strategy 4: Product-specific
    if (enhancements.contextualTerms.some(term => 
        this.borogueContext.products.includes(term))) {
      strategies.push({
        type: 'product',
        keywords: enhancements.enhancedKeywords.filter(k => 
          this.borogueContext.products.some(p => 
            k.toLowerCase().includes(p.toLowerCase()))),
        priority: 'medium'
      });
    }

    return strategies;
  }

  // Create search session record
  async createSearchSession(userQuery, enhancements) {
    try {
      const { data: session, error } = await this.supabase
        .from('esg_search_sessions')
        .insert({
          user_query: userQuery,
          enhanced_queries: enhancements,
          search_keywords: enhancements.enhancedKeywords,
          status: 'active'
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`📊 Created search session: ${session.id}`);
      return session;

    } catch (error) {
      console.error('❌ Error creating search session:', error.message);
      return null;
    }
  }

  // Update search session with results
  async updateSearchSession(sessionId, results) {
    try {
      const { error } = await this.supabase
        .from('esg_search_sessions')
        .update({
          articles_found: results.articlesFound || 0,
          relevant_articles: results.relevantArticles || 0,
          high_impact_count: results.highImpactCount || 0,
          medium_impact_count: results.mediumImpactCount || 0,
          low_impact_count: results.lowImpactCount || 0,
          opportunity_count: results.opportunityCount || 0,
          processing_time_ms: results.processingTime || 0,
          api_calls_made: results.apiCallsMade || 0,
          cache_hits: results.cacheHits || 0,
          completed_at: new Date().toISOString(),
          status: 'completed'
        })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      console.log(`✅ Updated search session: ${sessionId}`);

    } catch (error) {
      console.error('❌ Error updating search session:', error.message);
    }
  }

  // Get search analytics
  async getSearchAnalytics(days = 7) {
    try {
      const { data: analytics, error } = await this.supabase
        .from('daily_search_analytics')
        .select('*')
        .gte('search_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('search_date', { ascending: false });

      if (error) {
        throw error;
      }

      return analytics || [];

    } catch (error) {
      console.error('❌ Error fetching search analytics:', error.message);
      return [];
    }
  }
}

module.exports = QueryEnhancementService;
