// Article Analysis Service for Borouge ESG Intelligence Platform
// AI-powered analysis of news articles for relevance and business impact

const crypto = require('crypto');

class ArticleAnalysisService {
  constructor(config, supabase, aiService) {
    this.config = config;
    this.supabase = supabase;
    this.aiService = aiService;

    console.log('🤖 Article Analysis Service initialized');
  }

  // Generate query hash for caching
  generateQueryHash(query) {
    return crypto.createHash('sha256').update(query.toLowerCase().trim()).digest('base64');
  }

  // Analyze articles with AI for relevance and impact
  async analyzeArticlesWithAI(articles, queryEnhancements) {
    const analyzedArticles = [];

    for (const article of articles) {
      try {
        // Create analysis prompt for this article
        const analysisPrompt = this.createArticleAnalysisPrompt(article, queryEnhancements);

        // Use existing AI service to analyze
        const aiAnalysis = await this.aiService.analyzeQuery(analysisPrompt);

        // Parse AI response to extract relevance score and impact level
        const analysis = this.parseArticleAnalysis(aiAnalysis.response);

        // Update article in database with analysis
        await this.updateArticleAnalysis(article.id, analysis);

        // Add to analyzed articles
        analyzedArticles.push({
          ...article,
          ...analysis
        });

        console.log(`🤖 Analyzed article: ${article.title.substring(0, 50)}... (Score: ${analysis.relevance_score})`);

      } catch (error) {
        console.error(`❌ Error analyzing article ${article.id}:`, error.message);

        // Add article with enhanced default analysis based on content
        const enhancedAnalysis = this.generateFallbackAnalysis(article, queryEnhancements);
        analyzedArticles.push({
          ...article,
          ...enhancedAnalysis
        });
      }
    }

    return analyzedArticles;
  }

  // NEW: Optimized batch analysis for faster processing
  async analyzeBatchArticlesOptimized(articles, queryEnhancements) {
    console.log(`🚀 Starting optimized batch analysis for ${articles.length} articles`);
    const analyzedArticles = [];

    // Process articles with enhanced fallback analysis (no AI calls for speed)
    for (const article of articles) {
      try {
        // Use enhanced fallback analysis for speed
        const analysis = this.generateEnhancedFallbackAnalysis(article, queryEnhancements);

        analyzedArticles.push({
          ...article,
          ...analysis
        });

        console.log(`⚡ Fast analyzed: ${article.title.substring(0, 50)}... (Score: ${analysis.relevance_score})`);

      } catch (error) {
        console.error(`❌ Error in fast analysis for article ${article.id}:`, error.message);

        // Basic fallback
        const basicAnalysis = this.generateFallbackAnalysis(article, queryEnhancements);
        analyzedArticles.push({
          ...article,
          ...basicAnalysis
        });
      }
    }

    console.log(`✅ Optimized batch analysis completed: ${analyzedArticles.length} articles processed`);
    return analyzedArticles;
  }

  // Enhanced fallback analysis with better intelligence
  generateEnhancedFallbackAnalysis(article, queryEnhancements) {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = title + ' ' + description;

    // Enhanced relevance calculation
    let relevanceScore = 45; // Higher base score

    // Enhanced keyword matching with weights
    const keywordCategories = {
      borouge: { keywords: ['borouge', 'adnoc', 'uae', 'abu dhabi'], weight: 20 },
      industry: { keywords: ['petrochemical', 'polyethylene', 'polypropylene', 'plastic', 'polymer'], weight: 15 },
      esg: { keywords: ['sustainability', 'esg', 'carbon', 'environment', 'regulation', 'compliance'], weight: 12 },
      business: { keywords: ['market', 'revenue', 'investment', 'growth', 'strategy'], weight: 8 },
      regulatory: { keywords: ['cbam', 'reach', 'eu', 'regulation', 'policy', 'law'], weight: 18 }
    };

    // Apply weighted scoring
    Object.values(keywordCategories).forEach(category => {
      const matches = category.keywords.filter(keyword => content.includes(keyword)).length;
      relevanceScore += matches * category.weight;
    });

    // Query-specific keyword matching
    if (queryEnhancements?.enhancedKeywords) {
      queryEnhancements.enhancedKeywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) relevanceScore += 10;
      });
    }

    // Cap at 100
    relevanceScore = Math.min(100, relevanceScore);

    // Enhanced impact level determination
    let impactLevel = 'LOW';
    if (content.includes('regulation') || content.includes('compliance') || content.includes('ban') || content.includes('cbam')) {
      impactLevel = 'HIGH';
    } else if (content.includes('opportunity') || content.includes('investment') || content.includes('growth') || content.includes('innovation')) {
      impactLevel = 'OPPORTUNITY';
    } else if (content.includes('sustainability') || content.includes('carbon') || content.includes('esg') || content.includes('circular')) {
      impactLevel = 'MEDIUM';
    }

    // Generate executive summary
    const executiveSummary = this.generateQuickExecutiveSummary(article, impactLevel, relevanceScore);

    return {
      relevance_score: relevanceScore,
      impact_level: impactLevel,
      executive_summary: executiveSummary,
      summary: article.description || executiveSummary,
      action_items: this.generateQuickActionItems(impactLevel),
      detailed_analysis: {
        business_impact: `${impactLevel} impact identified for Borouge operations`,
        regulatory_implications: impactLevel === 'HIGH' ? 'Regulatory compliance assessment required' : 'Standard monitoring recommended',
        competitive_landscape: 'Competitive analysis pending',
        financial_implications: 'Financial assessment required',
        operational_considerations: 'Operational review recommended'
      }
    };
  }

  // Generate quick executive summary
  generateQuickExecutiveSummary(article, impactLevel, relevanceScore) {
    const title = article.title || 'Article';
    const source = article.source?.name || article.source || 'Industry Source';

    if (impactLevel === 'HIGH') {
      return `High-impact development: ${title}. Immediate strategic review recommended for Borouge operations. Source: ${source}. Relevance: ${relevanceScore}%.`;
    } else if (impactLevel === 'OPPORTUNITY') {
      return `Strategic opportunity identified: ${title}. Potential for competitive advantage and market positioning. Source: ${source}. Relevance: ${relevanceScore}%.`;
    } else if (impactLevel === 'MEDIUM') {
      return `Medium-impact development: ${title}. Monitoring and assessment recommended for ESG and sustainability implications. Source: ${source}. Relevance: ${relevanceScore}%.`;
    } else {
      return `Industry development: ${title}. Standard monitoring recommended. Source: ${source}. Relevance: ${relevanceScore}%.`;
    }
  }

  // Generate quick action items based on impact level
  generateQuickActionItems(impactLevel) {
    switch (impactLevel) {
      case 'HIGH':
        return [
          'Immediate strategic review required',
          'Assess regulatory compliance implications',
          'Evaluate operational impact'
        ];
      case 'OPPORTUNITY':
        return [
          'Evaluate market opportunity',
          'Assess competitive positioning',
          'Consider strategic partnerships'
        ];
      case 'MEDIUM':
        return [
          'Monitor development closely',
          'Assess ESG implications',
          'Review sustainability alignment'
        ];
      default:
        return [
          'Standard industry monitoring',
          'Include in quarterly review'
        ];
    }
  }

  // Create comprehensive strategic intelligence analysis prompt
  createArticleAnalysisPrompt(article, queryEnhancements) {
    return `As Borouge's Chief Strategy Officer and Senior ESG Intelligence Analyst, provide comprehensive strategic intelligence analysis for executive decision-making:

ARTICLE TO ANALYZE:
Title: ${article.title}
Description: ${article.description || 'No description available'}
Source: ${article.source}
Published: ${article.published_at}

CRITICAL DATA EXTRACTION INSTRUCTION:
Extract ALL numerical data, statistics, financial figures, percentages, dates, volumes, and quantitative metrics EXCLUSIVELY from the article text content (title and description above). DO NOT reference, extract, or infer data from any images, charts, graphs, infographics, or visual elements that may be present in the original article. Focus ONLY on the textual information provided above.

SEARCH CONTEXT:
Original Query: ${queryEnhancements.originalQuery}
Enhanced Keywords: ${queryEnhancements.enhancedKeywords.join(', ')}
Priority Level: ${queryEnhancements.priorityLevel}

BOROUGE STRATEGIC PROFILE:
- Company: Leading petrochemical JV (ADNOC 54%, Borealis 36%, Public 10%)
- Products: Polyethylene (LLDPE, HDPE), Polypropylene (PP), Advanced compounds
- Manufacturing: Ruwais Industrial Complex (5.0M tonnes capacity), Singapore operations
- Markets: UAE (home), Singapore (hub), China (growth), India (expansion), Europe (premium)
- Revenue: $8.5B annually, €2.3B EU exposure (27% of revenue)
- ESG Goals: Carbon neutrality by 2050, circular economy leadership, plastic waste reduction
- Competitive Position: #3 in Middle East petrochemicals, competing with SABIC, Dow, ExxonMobil
- Regulatory Environment: UAE ESG framework, EU CBAM compliance, China plastic policies

Provide comprehensive JSON analysis with this exact structure:

{
  "relevance_score": [0-100],
  "impact_level": ["CRITICAL", "HIGH", "MEDIUM", "LOW", "OPPORTUNITY"],
  "executive_summary": "2-3 sentence strategic summary for C-level executives highlighting key business implications",
  "detailed_analysis": {
    "business_impact": "Specific impact on Borouge's operations, revenue, market position, or strategy",
    "regulatory_implications": "Compliance requirements, regulatory risks/opportunities, timeline for implementation",
    "competitive_landscape": "How this affects Borouge vs SABIC, Dow, ExxonMobil, and other petrochemical competitors",
    "financial_implications": "Quantified potential costs, savings, revenue impacts, or investment requirements",
    "operational_considerations": "Supply chain, manufacturing, R&D, or operational impacts and requirements"
  },
  "risk_assessment": {
    "level": ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
    "timeline": "When impacts are expected (immediate, 3-6 months, 6-12 months, 1-3 years)",
    "probability": "Likelihood of impact occurring (high/medium/low)",
    "mitigation_strategies": ["Specific strategy 1", "Specific strategy 2"]
  },
  "opportunities": {
    "market_opportunities": ["Specific market opportunity 1", "Specific market opportunity 2"],
    "innovation_potential": "R&D, product development, or technology opportunities",
    "partnership_possibilities": "Potential collaborations, JVs, or strategic partnerships",
    "competitive_advantages": "How Borouge can leverage this for competitive positioning"
  },
  "strategic_recommendations": {
    "immediate_actions": [
      {
        "action": "Specific action for next 30-90 days",
        "department": ["Operations", "Sustainability", "Legal", "Commercial", "R&D"],
        "priority": ["CRITICAL", "HIGH", "MEDIUM"],
        "resources_required": "Specific human/financial resources needed",
        "success_metrics": "How to measure success"
      }
    ],
    "strategic_initiatives": [
      {
        "initiative": "Medium to long-term strategic action (6 months - 3 years)",
        "timeline": "Specific implementation timeframe",
        "investment_required": "Estimated investment or resource allocation",
        "expected_roi": "Expected return, benefit, or strategic value",
        "key_milestones": ["Milestone 1", "Milestone 2"]
      }
    ]
  },
  "borouge_alignment": {
    "sustainability_goals": "How this aligns with carbon neutrality and ESG commitments",
    "circular_economy": "Relevance to circular economy and plastic waste reduction initiatives",
    "market_positioning": "Impact on competitive positioning in key markets",
    "innovation_strategy": "Alignment with R&D and product innovation priorities"
  },
  "quantitative_insights": {
    "financial_impact_range": "Estimated financial impact range extracted from article text (e.g., $10-50M annually)",
    "market_size_affected": "Size of market or business segment affected based on text data",
    "numerical_data_extracted": "All specific numbers, percentages, volumes, dates found in article text",
    "key_metrics": "Important quantitative metrics mentioned in the article text",
    "implementation_timeline": "Realistic timeline for implementation based on text information",
    "confidence_level": "Confidence in analysis based on text data quality (high/medium/low)"
  }
}

ANALYSIS GUIDELINES:
- Extract and analyze ONLY data from the article text content (title and description)
- DO NOT reference or extract data from images, charts, graphs, or visual elements
- Provide actionable, executive-level insights for petrochemical industry
- Include quantitative estimates based on text data (costs, timelines, market sizes)
- Highlight all numerical data found in the article text in the quantitative_insights section
- Consider Borouge's specific geographic footprint and regulatory environments
- Emphasize ESG, sustainability, and circular economy implications
- Reference industry benchmarks and competitive intelligence when mentioned in text
- Focus on strategic value and business impact based on textual information
- Consider both defensive (risk mitigation) and offensive (opportunity capture) strategies
- Tailor recommendations to Borouge's scale, capabilities, and market position
- Ensure all financial figures and metrics are sourced from article text only`;
  }

  // Generate fallback analysis when AI fails
  generateFallbackAnalysis(article, queryEnhancements) {
    const title = (article.title || '').toLowerCase();
    const description = (article.description || '').toLowerCase();
    const content = title + ' ' + description;

    // Calculate relevance based on keyword matching
    let relevanceScore = 40; // Base score

    // Check for Borouge-specific keywords
    const borogueKeywords = ['borouge', 'adnoc', 'uae', 'petrochemical', 'polyethylene', 'polypropylene'];
    const esgKeywords = ['sustainability', 'esg', 'carbon', 'environment', 'regulation', 'compliance'];
    const industryKeywords = ['plastic', 'chemical', 'polymer', 'manufacturing'];

    // Boost score for relevant keywords
    borogueKeywords.forEach(keyword => {
      if (content.includes(keyword)) relevanceScore += 15;
    });

    esgKeywords.forEach(keyword => {
      if (content.includes(keyword)) relevanceScore += 10;
    });

    industryKeywords.forEach(keyword => {
      if (content.includes(keyword)) relevanceScore += 5;
    });

    // Check query keywords
    if (queryEnhancements?.enhancedKeywords) {
      queryEnhancements.enhancedKeywords.forEach(keyword => {
        if (content.includes(keyword.toLowerCase())) relevanceScore += 8;
      });
    }

    // Cap at 100
    relevanceScore = Math.min(100, relevanceScore);

    // Determine impact level based on content
    let impactLevel = 'LOW';
    if (content.includes('regulation') || content.includes('compliance') || content.includes('ban')) {
      impactLevel = 'HIGH';
    } else if (content.includes('opportunity') || content.includes('investment') || content.includes('growth')) {
      impactLevel = 'OPPORTUNITY';
    } else if (content.includes('sustainability') || content.includes('carbon') || content.includes('esg')) {
      impactLevel = 'MEDIUM';
    }

    return {
      relevance_score: relevanceScore,
      impact_level: impactLevel,
      summary: article.description || 'Article analysis pending',
      action_items: []
    };
  }

  // Parse comprehensive AI analysis response
  parseArticleAnalysis(aiResponse) {
    try {
      // Try to extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);

        // Validate and structure the comprehensive analysis
        return {
          relevance_score: Math.min(100, Math.max(0, analysis.relevance_score || 50)),
          impact_level: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'OPPORTUNITY'].includes(analysis.impact_level)
            ? analysis.impact_level : 'LOW',
          executive_summary: analysis.executive_summary || analysis.summary || 'No summary available',

          // Enhanced analysis sections
          detailed_analysis: analysis.detailed_analysis || {
            business_impact: 'Analysis pending',
            regulatory_implications: 'To be determined',
            competitive_landscape: 'Under review',
            financial_implications: 'Assessment required',
            operational_considerations: 'Evaluation needed'
          },

          risk_assessment: analysis.risk_assessment || {
            level: 'LOW',
            timeline: 'To be determined',
            probability: 'medium',
            mitigation_strategies: []
          },

          opportunities: analysis.opportunities || {
            market_opportunities: [],
            innovation_potential: 'Under evaluation',
            partnership_possibilities: 'To be explored',
            competitive_advantages: 'Assessment pending'
          },

          strategic_recommendations: analysis.strategic_recommendations || {
            immediate_actions: [],
            strategic_initiatives: []
          },

          borouge_alignment: analysis.borouge_alignment || {
            sustainability_goals: 'Alignment assessment pending',
            circular_economy: 'Relevance under review',
            market_positioning: 'Impact evaluation needed',
            innovation_strategy: 'Strategic fit assessment required'
          },

          quantitative_insights: analysis.quantitative_insights || {
            financial_impact_range: 'To be quantified',
            market_size_affected: 'Under assessment',
            implementation_timeline: 'Planning required',
            confidence_level: 'medium'
          },

          // Legacy fields for backward compatibility
          summary: analysis.executive_summary || analysis.summary || 'No summary available',
          action_items: this.extractLegacyActionItems(analysis)
        };
      }
    } catch (error) {
      console.error('❌ Error parsing comprehensive AI analysis:', error.message);
    }

    // Fallback to basic analysis structure
    return this.generateFallbackComprehensiveAnalysis();
  }

  // Extract legacy action items from comprehensive analysis
  extractLegacyActionItems(analysis) {
    const actionItems = [];

    // Extract from immediate actions
    if (analysis.strategic_recommendations?.immediate_actions) {
      analysis.strategic_recommendations.immediate_actions.forEach(action => {
        actionItems.push(action.action || action);
      });
    }

    // Extract from strategic initiatives
    if (analysis.strategic_recommendations?.strategic_initiatives) {
      analysis.strategic_recommendations.strategic_initiatives.forEach(initiative => {
        actionItems.push(initiative.initiative || initiative);
      });
    }

    return actionItems.slice(0, 5); // Limit to top 5 for legacy compatibility
  }

  // Generate fallback comprehensive analysis structure
  generateFallbackComprehensiveAnalysis() {
    return {
      relevance_score: 50,
      impact_level: 'LOW',
      executive_summary: 'Comprehensive analysis not available - using fallback assessment',
      detailed_analysis: {
        business_impact: 'Analysis pending - requires manual review',
        regulatory_implications: 'Regulatory assessment needed',
        competitive_landscape: 'Competitive analysis required',
        financial_implications: 'Financial impact assessment pending',
        operational_considerations: 'Operational review needed'
      },
      risk_assessment: {
        level: 'LOW',
        timeline: 'Assessment required',
        probability: 'medium',
        mitigation_strategies: ['Manual review recommended', 'Expert consultation advised']
      },
      opportunities: {
        market_opportunities: ['Requires detailed market analysis'],
        innovation_potential: 'Innovation assessment needed',
        partnership_possibilities: 'Partnership evaluation required',
        competitive_advantages: 'Competitive analysis pending'
      },
      strategic_recommendations: {
        immediate_actions: [{
          action: 'Conduct manual analysis of this article',
          department: ['Strategy'],
          priority: 'MEDIUM',
          resources_required: 'Senior analyst review',
          success_metrics: 'Completed analysis report'
        }],
        strategic_initiatives: [{
          initiative: 'Develop comprehensive assessment framework',
          timeline: '3-6 months',
          investment_required: 'Internal resources',
          expected_roi: 'Improved analysis quality',
          key_milestones: ['Framework design', 'Implementation', 'Validation']
        }]
      },
      borouge_alignment: {
        sustainability_goals: 'Alignment assessment required',
        circular_economy: 'Circular economy relevance to be determined',
        market_positioning: 'Market impact evaluation needed',
        innovation_strategy: 'Innovation alignment assessment pending'
      },
      quantitative_insights: {
        financial_impact_range: 'Quantification required',
        market_size_affected: 'Market sizing needed',
        implementation_timeline: 'Timeline assessment required',
        confidence_level: 'low'
      },
      summary: 'Comprehensive analysis not available - manual review recommended',
      action_items: ['Conduct manual analysis', 'Expert consultation recommended']
    };
  }

  // Update article analysis in database
  async updateArticleAnalysis(articleId, analysis) {
    try {
      await this.supabase
        .from('esg_news_articles')
        .update({
          relevance_score: analysis.relevance_score,
          impact_level: analysis.impact_level,
          summary: analysis.summary,
          action_items: analysis.action_items,
          processed_at: new Date().toISOString(),
          processing_status: 'completed'
        })
        .eq('id', articleId);
    } catch (error) {
      console.error('❌ Error updating article analysis:', error.message);
    }
  }

  // Structure comprehensive smart search response with enhanced analysis
  structureSmartSearchResponse(query, queryEnhancements, newsResults, analyzedArticles, startTime) {
    const responseTime = Date.now() - startTime;

    // Sort articles by impact and relevance with enhanced criteria
    const sortedArticles = analyzedArticles
      .filter(a => (a.relevance_score || 0) >= 30)
      .sort((a, b) => {
        // Enhanced sorting: CRITICAL > HIGH > OPPORTUNITY > MEDIUM > LOW
        const impactOrder = { 'CRITICAL': 5, 'HIGH': 4, 'OPPORTUNITY': 3, 'MEDIUM': 2, 'LOW': 1 };
        const impactDiff = (impactOrder[b.impact_level] || 1) - (impactOrder[a.impact_level] || 1);
        if (impactDiff !== 0) return impactDiff;
        return (b.relevance_score || 0) - (a.relevance_score || 0);
      });

    // Generate comprehensive analytics
    const analytics = this.generateComprehensiveAnalytics(analyzedArticles, newsResults);

    // Extract strategic insights
    const strategicInsights = this.extractStrategicInsights(sortedArticles);

    // Generate enhanced executive summary
    const executiveSummary = this.generateEnhancedExecutiveSummary(analytics, strategicInsights, query);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      query: query,
      responseTime: responseTime,
      cached: false,

      // Enhanced search metadata
      searchMetadata: {
        originalQuery: query,
        enhancedKeywords: queryEnhancements.enhancedKeywords,
        searchStrategies: queryEnhancements.searchStrategies || [],
        priorityLevel: queryEnhancements.priorityLevel,
        analysisDepth: 'comprehensive',
        confidenceLevel: analytics.overallConfidence
      },

      // Comprehensive executive summary
      executiveSummary: executiveSummary,

      // Strategic intelligence insights
      strategicInsights: strategicInsights,

      // Enhanced analytics
      analytics: analytics,

      // Processed articles with comprehensive analysis
      articles: sortedArticles.slice(0, 20), // Increased to 20 for better coverage

      // Enhanced action items with strategic context
      actionItems: this.extractEnhancedActionItems(sortedArticles),

      // Risk and opportunity assessment
      riskOpportunityMatrix: this.generateRiskOpportunityMatrix(sortedArticles),

      // Borouge-specific recommendations
      borogueRecommendations: this.generateBorogueRecommendations(sortedArticles, analytics),

      // API usage and performance info
      apiUsage: {
        quotaRemaining: newsResults.quotaRemaining,
        provider: 'gnews',
        articlesProcessed: analyzedArticles.length,
        aiAnalysisSuccess: analyzedArticles.filter(a => a.executive_summary).length
      }
    };
  }

  // NEW: Structure optimized smart search response for faster processing
  structureOptimizedSmartSearchResponse(query, queryEnhancements, newsResults, analyzedArticles, startTime) {
    const responseTime = Date.now() - startTime;

    // Sort articles by impact and relevance
    const sortedArticles = analyzedArticles
      .filter(a => (a.relevance_score || 0) >= 25) // Lower threshold for optimized version
      .sort((a, b) => {
        const impactOrder = { 'CRITICAL': 5, 'HIGH': 4, 'OPPORTUNITY': 3, 'MEDIUM': 2, 'LOW': 1 };
        const impactDiff = (impactOrder[b.impact_level] || 1) - (impactOrder[a.impact_level] || 1);
        if (impactDiff !== 0) return impactDiff;
        return (b.relevance_score || 0) - (a.relevance_score || 0);
      });

    // Generate streamlined analytics
    const analytics = this.generateStreamlinedAnalytics(analyzedArticles, newsResults);

    // Generate quick executive summary
    const executiveSummary = this.generateQuickExecutiveSummary(analytics, query);

    return {
      success: true,
      timestamp: new Date().toISOString(),
      query: query,
      responseTime: responseTime,
      cached: false,

      // Streamlined search metadata
      searchMetadata: {
        originalQuery: query,
        enhancedKeywords: queryEnhancements.enhancedKeywords,
        priorityLevel: queryEnhancements.priorityLevel,
        analysisDepth: 'optimized',
        confidenceLevel: analytics.overallConfidence
      },

      // Quick executive summary
      executiveSummary: executiveSummary,

      // Streamlined analytics
      analytics: analytics,

      // Top articles only
      articles: sortedArticles.slice(0, 10), // Reduced for speed

      // Quick action items
      actionItems: this.extractQuickActionItems(sortedArticles),

      // API usage info
      apiUsage: {
        quotaRemaining: newsResults.quotaRemaining,
        provider: 'gnews',
        articlesProcessed: analyzedArticles.length,
        optimizedProcessing: true
      }
    };
  }

  // Generate streamlined analytics for optimized processing
  generateStreamlinedAnalytics(articles, newsResults) {
    const total = articles.length;
    const impactCounts = {
      high: articles.filter(a => ['CRITICAL', 'HIGH'].includes(a.impact_level)).length,
      opportunity: articles.filter(a => a.impact_level === 'OPPORTUNITY').length,
      medium: articles.filter(a => a.impact_level === 'MEDIUM').length,
      low: articles.filter(a => a.impact_level === 'LOW').length
    };

    const avgRelevance = total > 0
      ? Math.round(articles.reduce((sum, a) => sum + (a.relevance_score || 0), 0) / total)
      : 0;

    return {
      totalArticles: total,
      averageRelevance: avgRelevance,
      actionableInsights: impactCounts.high + impactCounts.opportunity,
      strategicOpportunities: impactCounts.opportunity,
      urgentAttentionRequired: impactCounts.high,
      overallConfidence: avgRelevance >= 70 ? 'high' : avgRelevance >= 50 ? 'medium' : 'low',
      processingTime: newsResults.processingTime || 0
    };
  }

  // Generate quick executive summary for optimized processing
  generateQuickExecutiveSummary(analytics, query) {
    const { totalArticles, actionableInsights, strategicOpportunities, urgentAttentionRequired } = analytics;

    return {
      headline: `ESG Intelligence Analysis: ${totalArticles} articles analyzed for "${query}"`,
      keyFindings: [
        `${actionableInsights} actionable insights identified`,
        `${strategicOpportunities} strategic opportunities detected`,
        `${urgentAttentionRequired} items requiring urgent attention`
      ],
      nextSteps: [
        'Review high-impact articles for immediate action',
        'Assess strategic opportunities for competitive advantage',
        'Monitor regulatory developments for compliance requirements'
      ],
      confidence: analytics.overallConfidence
    };
  }

  // Extract quick action items for optimized processing
  extractQuickActionItems(articles) {
    const actionItems = [];

    // High-impact articles
    const highImpactArticles = articles.filter(a => ['CRITICAL', 'HIGH'].includes(a.impact_level));
    if (highImpactArticles.length > 0) {
      actionItems.push(`Review ${highImpactArticles.length} high-impact developments immediately`);
    }

    // Opportunities
    const opportunities = articles.filter(a => a.impact_level === 'OPPORTUNITY');
    if (opportunities.length > 0) {
      actionItems.push(`Evaluate ${opportunities.length} strategic opportunities for competitive advantage`);
    }

    // Regulatory items
    const regulatoryItems = articles.filter(a =>
      (a.title || '').toLowerCase().includes('regulation') ||
      (a.description || '').toLowerCase().includes('compliance')
    );
    if (regulatoryItems.length > 0) {
      actionItems.push(`Monitor ${regulatoryItems.length} regulatory developments for compliance impact`);
    }

    // Default actions if none specific
    if (actionItems.length === 0) {
      actionItems.push('Continue monitoring industry developments');
      actionItems.push('Assess ESG and sustainability implications');
    }

    return actionItems.slice(0, 5); // Limit to top 5
  }

  // Generate comprehensive analytics from analyzed articles
  generateComprehensiveAnalytics(articles, newsResults) {
    const total = articles.length;
    const impactDistribution = {
      critical: articles.filter(a => a.impact_level === 'CRITICAL').length,
      high: articles.filter(a => a.impact_level === 'HIGH').length,
      medium: articles.filter(a => a.impact_level === 'MEDIUM').length,
      low: articles.filter(a => a.impact_level === 'LOW').length,
      opportunity: articles.filter(a => a.impact_level === 'OPPORTUNITY').length
    };

    const relevanceDistribution = {
      highly_relevant: articles.filter(a => (a.relevance_score || 0) >= 80).length,
      relevant: articles.filter(a => (a.relevance_score || 0) >= 60 && (a.relevance_score || 0) < 80).length,
      moderately_relevant: articles.filter(a => (a.relevance_score || 0) >= 40 && (a.relevance_score || 0) < 60).length,
      low_relevance: articles.filter(a => (a.relevance_score || 0) < 40).length
    };

    const avgRelevance = articles.reduce((sum, a) => sum + (a.relevance_score || 0), 0) / total;

    return {
      totalArticles: total,
      articlesFound: newsResults.articlesFound || total,
      averageRelevance: Math.round(avgRelevance),
      impactDistribution: impactDistribution,
      relevanceDistribution: relevanceDistribution,
      actionableInsights: impactDistribution.critical + impactDistribution.high + impactDistribution.opportunity,
      urgentAttentionRequired: impactDistribution.critical + impactDistribution.high,
      strategicOpportunities: impactDistribution.opportunity,
      overallConfidence: this.calculateConfidenceLevel(articles),
      processingTime: newsResults.processingTime || 0
    };
  }

  // Extract strategic insights from articles
  extractStrategicInsights(articles) {
    const insights = {
      keyThemes: this.extractKeyThemes(articles),
      geographicFocus: this.analyzeGeographicFocus(articles),
      timelinePressure: this.analyzeTimelinePressure(articles),
      competitiveImplications: this.analyzeCompetitiveImplications(articles),
      regulatoryLandscape: this.analyzeRegulatoryLandscape(articles),
      esgImplications: this.analyzeESGImplications(articles)
    };

    return insights;
  }

  // Generate enhanced executive summary
  generateEnhancedExecutiveSummary(analytics, strategicInsights, query) {
    const urgentItems = analytics.urgentAttentionRequired;
    const opportunities = analytics.strategicOpportunities;
    const avgRelevance = analytics.averageRelevance;

    return {
      headline: `ESG Intelligence Analysis: ${analytics.totalArticles} articles analyzed for "${query}"`,
      keyFindings: `${urgentItems} items require immediate executive attention, ${opportunities} strategic opportunities identified. Average relevance: ${avgRelevance}%`,
      strategicImplications: this.generateStrategicImplications(strategicInsights),
      urgencyAssessment: this.generateUrgencyAssessment(analytics),
      confidenceLevel: analytics.overallConfidence,
      nextSteps: this.generateNextSteps(analytics, strategicInsights)
    };
  }

  // Extract action items from high-impact articles
  extractActionItems(highImpactArticles) {
    const actionItems = [];

    highImpactArticles.forEach(article => {
      if (article.action_items && Array.isArray(article.action_items)) {
        article.action_items.forEach(action => {
          actionItems.push({
            action: action,
            source: article.title,
            url: article.url,
            priority: article.impact_level,
            publishedAt: article.published_at
          });
        });
      }
    });

    return actionItems.slice(0, 10); // Limit to top 10 action items
  }

  // Enhanced helper methods for comprehensive analysis

  // Calculate confidence level based on AI analysis quality
  calculateConfidenceLevel(articles) {
    const withComprehensiveAnalysis = articles.filter(a => a.detailed_analysis && a.executive_summary).length;
    const total = articles.length;
    const ratio = withComprehensiveAnalysis / total;

    if (ratio >= 0.8) return 'high';
    if (ratio >= 0.5) return 'medium';
    return 'low';
  }

  // Extract key themes from articles
  extractKeyThemes(articles) {
    const themes = {};
    const keywords = ['sustainability', 'regulation', 'carbon', 'plastic', 'circular', 'esg', 'compliance', 'innovation'];

    keywords.forEach(keyword => {
      themes[keyword] = articles.filter(a => {
        const content = `${a.title} ${a.description || ''}`.toLowerCase();
        return content.includes(keyword);
      }).length;
    });

    return Object.entries(themes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([theme, count]) => ({ theme, count, percentage: Math.round((count / articles.length) * 100) }));
  }

  // Analyze geographic focus
  analyzeGeographicFocus(articles) {
    const regions = {
      'UAE': ['uae', 'emirates', 'dubai', 'abu dhabi'],
      'Singapore': ['singapore'],
      'China': ['china', 'chinese'],
      'India': ['india', 'indian'],
      'Europe': ['europe', 'european', 'eu'],
      'Asia': ['asia', 'asian']
    };

    const focus = {};
    Object.entries(regions).forEach(([region, keywords]) => {
      focus[region] = articles.filter(a => {
        const content = `${a.title} ${a.description || ''}`.toLowerCase();
        return keywords.some(keyword => content.includes(keyword));
      }).length;
    });

    return focus;
  }

  // Analyze timeline pressure
  analyzeTimelinePressure(articles) {
    const immediate = articles.filter(a =>
      a.risk_assessment?.timeline?.includes('immediate') ||
      a.impact_level === 'CRITICAL'
    ).length;

    const shortTerm = articles.filter(a =>
      a.risk_assessment?.timeline?.includes('3-6 months') ||
      a.impact_level === 'HIGH'
    ).length;

    return {
      immediate: immediate,
      shortTerm: shortTerm,
      mediumTerm: articles.filter(a => a.impact_level === 'MEDIUM').length,
      monitoring: articles.filter(a => a.impact_level === 'LOW').length
    };
  }

  // Analyze competitive implications
  analyzeCompetitiveImplications(articles) {
    const competitors = ['sabic', 'dow', 'exxonmobil', 'basf', 'lyondellbasell'];
    const implications = {};

    competitors.forEach(competitor => {
      implications[competitor] = articles.filter(a => {
        const content = `${a.title} ${a.description || ''}`.toLowerCase();
        return content.includes(competitor);
      }).length;
    });

    return implications;
  }

  // Analyze regulatory landscape
  analyzeRegulatoryLandscape(articles) {
    const regulatoryTypes = {
      'Environmental': ['environment', 'emission', 'carbon', 'climate'],
      'Trade': ['trade', 'tariff', 'import', 'export'],
      'Safety': ['safety', 'health', 'worker'],
      'ESG': ['esg', 'sustainability', 'governance'],
      'Product': ['product', 'standard', 'specification']
    };

    const landscape = {};
    Object.entries(regulatoryTypes).forEach(([type, keywords]) => {
      landscape[type] = articles.filter(a => {
        const content = `${a.title} ${a.description || ''}`.toLowerCase();
        return keywords.some(keyword => content.includes(keyword)) &&
               (content.includes('regulation') || content.includes('law') || content.includes('policy'));
      }).length;
    });

    return landscape;
  }

  // Analyze ESG implications
  analyzeESGImplications(articles) {
    const esgCategories = {
      'Environmental': ['carbon', 'emission', 'waste', 'recycling', 'circular'],
      'Social': ['community', 'worker', 'safety', 'health'],
      'Governance': ['governance', 'compliance', 'transparency', 'ethics']
    };

    const implications = {};
    Object.entries(esgCategories).forEach(([category, keywords]) => {
      implications[category] = articles.filter(a => {
        const content = `${a.title} ${a.description || ''}`.toLowerCase();
        return keywords.some(keyword => content.includes(keyword));
      }).length;
    });

    return implications;
  }

  // Generate strategic implications
  generateStrategicImplications(strategicInsights) {
    const implications = [];

    if (strategicInsights.timelinePressure.immediate > 0) {
      implications.push(`${strategicInsights.timelinePressure.immediate} issues require immediate executive action`);
    }

    if (strategicInsights.regulatoryLandscape.Environmental > 0) {
      implications.push(`Environmental regulatory changes may impact operations`);
    }

    if (strategicInsights.competitiveImplications.sabic > 0) {
      implications.push(`SABIC competitive activities detected - strategic response may be needed`);
    }

    return implications.length > 0 ? implications.join('. ') : 'No immediate strategic implications identified';
  }

  // Generate urgency assessment
  generateUrgencyAssessment(analytics) {
    if (analytics.impactDistribution.critical > 0) {
      return 'CRITICAL - Immediate board/CEO attention required';
    }
    if (analytics.impactDistribution.high > 2) {
      return 'HIGH - Executive team action needed within 30 days';
    }
    if (analytics.impactDistribution.high > 0 || analytics.impactDistribution.opportunity > 2) {
      return 'MEDIUM - Strategic planning and resource allocation needed';
    }
    return 'LOW - Monitoring and periodic review sufficient';
  }

  // Generate next steps
  generateNextSteps(analytics, strategicInsights) {
    const steps = [];

    if (analytics.impactDistribution.critical > 0) {
      steps.push('Schedule emergency executive meeting');
    }
    if (analytics.impactDistribution.high > 0) {
      steps.push('Assign senior management ownership for high-impact items');
    }
    if (analytics.impactDistribution.opportunity > 0) {
      steps.push('Evaluate strategic opportunities with business development team');
    }
    if (strategicInsights.regulatoryLandscape.Environmental > 0) {
      steps.push('Engage legal and compliance teams for regulatory assessment');
    }

    return steps.length > 0 ? steps : ['Continue monitoring ESG landscape', 'Schedule quarterly strategy review'];
  }

  // Extract enhanced action items with strategic context
  extractEnhancedActionItems(articles) {
    const actionItems = [];

    articles.filter(a => a.impact_level === 'CRITICAL' || a.impact_level === 'HIGH').forEach(article => {
      if (article.strategic_recommendations?.immediate_actions) {
        article.strategic_recommendations.immediate_actions.forEach(action => {
          actionItems.push({
            action: action.action,
            priority: action.priority || article.impact_level,
            department: action.department || ['Strategy'],
            timeline: action.timeline || '30 days',
            resources: action.resources_required || 'TBD',
            source: article.title,
            url: article.url,
            relevanceScore: article.relevance_score
          });
        });
      }
    });

    return actionItems.slice(0, 10);
  }

  // Generate risk and opportunity matrix
  generateRiskOpportunityMatrix(articles) {
    const risks = articles
      .filter(a => a.impact_level === 'CRITICAL' || a.impact_level === 'HIGH')
      .map(a => ({
        risk: a.executive_summary || a.summary,
        probability: a.risk_assessment?.probability || 'medium',
        impact: a.impact_level,
        timeline: a.risk_assessment?.timeline || 'TBD',
        mitigation: a.risk_assessment?.mitigation_strategies || []
      }))
      .slice(0, 5);

    const opportunities = articles
      .filter(a => a.impact_level === 'OPPORTUNITY')
      .map(a => ({
        opportunity: a.executive_summary || a.summary,
        marketSize: a.quantitative_insights?.market_size_affected || 'TBD',
        competitiveAdvantage: a.opportunities?.competitive_advantages || 'Assessment needed',
        investment: a.quantitative_insights?.financial_impact_range || 'TBD'
      }))
      .slice(0, 5);

    return { risks, opportunities };
  }

  // Check if article content is ESG-related
  isESGContent(article) {
    const content = `${article.title || ''} ${article.description || ''} ${article.summary || ''}`.toLowerCase();

    const esgKeywords = [
      'esg', 'sustainability', 'environmental', 'social', 'governance',
      'carbon', 'emission', 'climate', 'renewable', 'green',
      'waste', 'recycling', 'circular', 'biodiversity',
      'diversity', 'inclusion', 'community', 'worker', 'safety',
      'ethics', 'compliance', 'transparency', 'accountability',
      'regulation', 'policy', 'framework', 'standard'
    ];

    return esgKeywords.some(keyword => content.includes(keyword));
  }

  // Generate Borouge-specific recommendations
  generateBorogueRecommendations(articles, analytics) {
    const recommendations = {
      immediate: [],
      strategic: [],
      esg: [],
      competitive: []
    };

    // Immediate recommendations based on critical/high impact items
    if (analytics.impactDistribution.critical > 0) {
      recommendations.immediate.push({
        action: 'Convene emergency executive committee meeting',
        rationale: `${analytics.impactDistribution.critical} critical issues identified`,
        timeline: '24-48 hours'
      });
    }

    // Strategic recommendations
    if (analytics.strategicOpportunities > 0) {
      recommendations.strategic.push({
        action: 'Evaluate strategic opportunities for competitive advantage',
        rationale: `${analytics.strategicOpportunities} opportunities identified`,
        timeline: '30-90 days'
      });
    }

    // ESG recommendations
    const esgArticles = articles.filter(a => this.isESGContent(a));
    if (esgArticles.length > 0) {
      recommendations.esg.push({
        action: 'Accelerate ESG initiatives alignment with market trends',
        rationale: `${esgArticles.length} ESG-related developments detected`,
        timeline: '3-6 months'
      });
    }

    return recommendations;
  }

  // Get analytics for article analysis performance
  async getAnalysisAnalytics(days = 7) {
    try {
      const { data: analytics, error } = await this.supabase
        .from('esg_news_articles')
        .select('impact_level, relevance_score, processing_status, created_at')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .eq('processing_status', 'completed');

      if (error) {
        throw error;
      }

      // Calculate analytics
      const totalAnalyzed = analytics.length;
      const avgRelevanceScore = analytics.reduce((sum, a) => sum + (a.relevance_score || 0), 0) / totalAnalyzed;
      const impactDistribution = {
        CRITICAL: analytics.filter(a => a.impact_level === 'CRITICAL').length,
        HIGH: analytics.filter(a => a.impact_level === 'HIGH').length,
        MEDIUM: analytics.filter(a => a.impact_level === 'MEDIUM').length,
        LOW: analytics.filter(a => a.impact_level === 'LOW').length,
        OPPORTUNITY: analytics.filter(a => a.impact_level === 'OPPORTUNITY').length
      };

      return {
        totalAnalyzed,
        avgRelevanceScore: Math.round(avgRelevanceScore),
        impactDistribution,
        period: `${days} days`
      };

    } catch (error) {
      console.error('❌ Error fetching analysis analytics:', error.message);
      return null;
    }
  }
}

module.exports = ArticleAnalysisService;
