// Executive Summary Service for Borouge ESG Intelligence Platform
// Generates comprehensive, strategic executive summaries for C-level decision making

class ExecutiveSummaryService {
  constructor(config, supabase, aiService) {
    this.config = config;
    this.supabase = supabase;
    this.aiService = aiService;
  }

  // Generate comprehensive executive summary from analyzed articles
  async generateComprehensiveExecutiveSummary(query, analyzedArticles, queryEnhancements) {
    try {
      console.log(`📊 Generating comprehensive executive summary for ${analyzedArticles.length} articles`);

      // Categorize articles by impact and relevance
      const categorizedArticles = this.categorizeArticles(analyzedArticles);

      // Generate quantitative insights
      const quantitativeInsights = this.generateQuantitativeInsights(analyzedArticles);

      // Create strategic analysis prompt
      const summaryPrompt = this.createExecutiveSummaryPrompt(
        query,
        categorizedArticles,
        quantitativeInsights,
        queryEnhancements
      );

      // Generate AI-powered executive summary
      const aiSummary = await this.aiService.analyzeQuery(summaryPrompt);

      // Parse and structure the summary
      const structuredSummary = this.parseExecutiveSummary(aiSummary.response);

      // Add quantitative data
      structuredSummary.quantitative_insights = quantitativeInsights;
      structuredSummary.article_breakdown = categorizedArticles;

      console.log(`✅ Executive summary generated successfully`);
      return structuredSummary;

    } catch (error) {
      console.error('❌ Error generating executive summary:', error);
      return this.generateFallbackExecutiveSummary(query, analyzedArticles);
    }
  }

  // Categorize articles by impact level and business relevance
  categorizeArticles(articles) {
    const categories = {
      critical: articles.filter(a => a.impact_level === 'CRITICAL'),
      high_impact: articles.filter(a => a.impact_level === 'HIGH'),
      opportunities: articles.filter(a => a.impact_level === 'OPPORTUNITY'),
      medium_impact: articles.filter(a => a.impact_level === 'MEDIUM'),
      monitoring: articles.filter(a => a.impact_level === 'LOW'),
      highly_relevant: articles.filter(a => (a.relevance_score || 0) >= 80),
      regulatory: articles.filter(a => this.isRegulatoryContent(a)),
      competitive: articles.filter(a => this.isCompetitiveContent(a)),
      esg_focused: articles.filter(a => this.isESGContent(a))
    };

    return {
      ...categories,
      total_articles: articles.length,
      actionable_articles: categories.critical.length + categories.high_impact.length + categories.opportunities.length
    };
  }

  // Generate quantitative insights from articles
  generateQuantitativeInsights(articles) {
    const totalArticles = articles.length;
    const relevanceScores = articles.map(a => a.relevance_score || 0);
    const avgRelevance = relevanceScores.reduce((sum, score) => sum + score, 0) / totalArticles;

    // Calculate impact distribution
    const impactDistribution = {
      critical: articles.filter(a => a.impact_level === 'CRITICAL').length,
      high: articles.filter(a => a.impact_level === 'HIGH').length,
      medium: articles.filter(a => a.impact_level === 'MEDIUM').length,
      low: articles.filter(a => a.impact_level === 'LOW').length,
      opportunity: articles.filter(a => a.impact_level === 'OPPORTUNITY').length
    };

    // Calculate timeline urgency
    const urgentArticles = articles.filter(a =>
      a.risk_assessment?.timeline?.includes('immediate') ||
      a.risk_assessment?.timeline?.includes('3-6 months')
    ).length;

    // Calculate geographic relevance
    const geographicRelevance = this.calculateGeographicRelevance(articles);

    return {
      total_articles: totalArticles,
      average_relevance: Math.round(avgRelevance),
      impact_distribution: impactDistribution,
      urgent_attention_required: urgentArticles,
      actionable_insights: impactDistribution.critical + impactDistribution.high + impactDistribution.opportunity,
      geographic_relevance: geographicRelevance,
      confidence_level: this.calculateOverallConfidence(articles)
    };
  }

  // Create comprehensive executive summary prompt
  createExecutiveSummaryPrompt(query, categorizedArticles, quantitativeInsights, queryEnhancements) {
    return `As Borouge's Chief Strategy Officer, provide a comprehensive executive intelligence report for immediate CEO and board-level decision making. This analysis must be strategic, quantitative, and immediately actionable.

SEARCH CONTEXT:
Query: ${query}
Enhanced Keywords: ${queryEnhancements.enhancedKeywords?.join(', ') || 'None'}
Analysis Date: ${new Date().toISOString().split('T')[0]}
Intelligence Sources: ${quantitativeInsights.total_articles} verified industry sources

QUANTITATIVE INTELLIGENCE OVERVIEW:
- Total Articles Analyzed: ${quantitativeInsights.total_articles}
- Average Relevance Score: ${quantitativeInsights.average_relevance}%
- Critical Issues Requiring Immediate Action: ${quantitativeInsights.impact_distribution.critical}
- High Impact Strategic Items: ${quantitativeInsights.impact_distribution.high}
- Strategic Market Opportunities: ${quantitativeInsights.impact_distribution.opportunity}
- Urgent Executive Attention Required: ${quantitativeInsights.urgent_attention_required} items
- Confidence Level: ${quantitativeInsights.confidence_level}

STRATEGIC INTELLIGENCE BREAKDOWN:
- Critical Issues: ${categorizedArticles.critical.length} articles (immediate board attention)
- High Impact: ${categorizedArticles.high_impact.length} articles (strategic response needed)
- Market Opportunities: ${categorizedArticles.opportunities.length} articles (competitive advantage potential)
- Regulatory Intelligence: ${categorizedArticles.regulatory.length} articles (compliance implications)
- Competitive Intelligence: ${categorizedArticles.competitive.length} articles (market positioning)
- ESG/Sustainability: ${categorizedArticles.esg_focused.length} articles (stakeholder impact)

BOROUGE STRATEGIC CONTEXT & COMPETITIVE POSITION:
- Annual Revenue: $8.5B (€2.3B EU market exposure, 27% of total revenue)
- Production Capacity: Ruwais Complex 5.0M tonnes/year, Singapore hub 1.2M tonnes
- Key Markets: UAE (35%), Singapore/Asia (28%), China (15%), India (12%), Europe (10%)
- ESG Commitments: Carbon neutrality by 2050, 30% circular content by 2030
- Market Position: #3 Middle East petrochemicals (#1 SABIC $50B, #2 Dow Chemical $39B)
- Competitive Advantages: Integrated value chain, strategic location, government backing
- Key Vulnerabilities: EU regulatory exposure, carbon intensity, feedstock dependency

Provide a comprehensive JSON executive intelligence report with this enhanced structure:

{
  "executive_overview": {
    "key_findings": "Comprehensive 300-400 word executive summary covering: (1) Most critical strategic findings requiring immediate CEO attention, (2) Quantitative impact assessment with specific metrics and financial implications, (3) Competitive landscape analysis comparing Borouge's position to SABIC, Dow Chemical, and other key players, (4) Regulatory compliance timeline with specific deadlines and requirements, (5) Risk assessment with probability scores and potential impact values, (6) Market opportunity sizing with revenue potential estimates in millions/billions, (7) Strategic recommendations with implementation timelines and resource requirements. Include specific percentages, dollar amounts, and timeframes wherever possible.",
    "strategic_implications": "Detailed analysis of how these findings fundamentally impact Borouge's $8.5B business strategy, competitive positioning in the $600B global petrochemicals market, and long-term value creation potential. Address implications for EU market exposure (€2.3B), Asian operations, and ESG commitments.",
    "urgency_assessment": "Specific timeline assessment: IMMEDIATE (0-30 days) - items requiring board/CEO action, SHORT-TERM (3-6 months) - strategic initiatives, MEDIUM-TERM (6-18 months) - structural changes. Include specific deadlines and regulatory compliance dates.",
    "confidence_level": "High/Medium/Low confidence with detailed rationale based on source quality, data completeness, and analytical certainty",
    "financial_impact_range": "Quantified potential financial impact range in millions: revenue impact ($X-Y million), cost implications ($A-B million), investment requirements ($C-D million)",
    "competitive_urgency": "Assessment of competitive response urgency and market window timing"
  },
  "business_impact_analysis": {
    "revenue_implications": "Detailed revenue impact analysis: EU market exposure (€2.3B at risk/opportunity), Asian markets impact, product portfolio effects, pricing implications, market share considerations. Provide specific percentage impacts and dollar ranges.",
    "operational_impact": "Comprehensive operational analysis: Ruwais Complex (5.0M tonnes) production implications, Singapore hub (1.2M tonnes) strategic role, supply chain disruptions/opportunities, technology upgrade requirements, workforce implications, capacity utilization effects",
    "market_positioning": "In-depth competitive positioning analysis: Borouge vs SABIC ($50B revenue), Dow Chemical ($39B), ExxonMobil Chemical, BASF, LyondellBasell. Include market share implications, competitive advantages/disadvantages, strategic differentiation opportunities",
    "regulatory_compliance": "Comprehensive compliance assessment: specific regulatory requirements, compliance costs (estimated ranges), implementation timelines, penalties for non-compliance, competitive compliance landscape, regulatory arbitrage opportunities"
  },
  "strategic_priorities": {
    "immediate_actions": [
      {
        "priority": "Specific action requiring immediate CEO/board attention with clear business context",
        "business_rationale": "Detailed explanation of WHY this action is immediately critical for Borouge's $8.5B business, including competitive threats, regulatory deadlines, market windows, or financial risks. Quantify the impact of inaction.",
        "urgency_drivers": "Specific urgency drivers: regulatory compliance deadlines (dates), competitive threats (competitor actions), market windows (timing), financial risks (dollar amounts), stakeholder pressures",
        "implementation_steps": "Detailed step-by-step implementation plan: (1) Immediate actions (0-7 days), (2) Short-term execution (1-4 weeks), (3) Completion milestones. Include responsible departments and key stakeholders.",
        "success_metrics": "Specific, measurable KPIs: financial metrics (revenue impact, cost savings), operational metrics (production efficiency, compliance rates), strategic metrics (market share, competitive position)",
        "resource_requirements": "Detailed resource breakdown: budget requirements ($X million), personnel needs (FTEs, expertise), technology investments, external consultants/partners, timeline for resource allocation",
        "risk_of_delay": "Quantified risks of delaying this action: financial impact ($X million loss), competitive disadvantage, regulatory penalties, market share erosion, stakeholder confidence impact",
        "dependencies": "Critical dependencies and prerequisites: regulatory approvals, technology readiness, partner agreements, internal capabilities, market conditions",
        "timeline": "Specific implementation timeline with milestones: initiation date, key checkpoints, completion target, critical path dependencies"
      }
    ],
    "medium_term_initiatives": [
      {
        "initiative": "Strategic initiative for 6-18 month horizon with clear value proposition",
        "strategic_value": "Comprehensive long-term value creation analysis: revenue potential ($X-Y million), market share gains (X%), competitive advantages, ESG benefits, operational efficiencies, risk mitigation value",
        "investment_required": "Detailed investment breakdown: capital expenditure ($X million), operational expenses ($Y million), technology investments, human capital, timeline for investment deployment",
        "expected_roi": "Quantified return analysis: financial ROI (X% over Y years), strategic benefits (market position, competitive moats), risk-adjusted returns, payback period, NPV analysis",
        "implementation_roadmap": "Phase-based implementation plan: Phase 1 (months 1-6), Phase 2 (months 7-12), Phase 3 (months 13-18), with specific deliverables and success criteria for each phase",
        "competitive_advantage": "Analysis of how this initiative creates sustainable competitive advantage vs SABIC, Dow, and other competitors. Include barriers to entry and defensibility."
      }
    ]
  },
  "risk_and_opportunity_matrix": {
    "critical_risks": [
      {
        "risk": "Specific, detailed risk to Borouge operations with clear business context and potential impact pathways",
        "probability": "High/Medium/Low with percentage estimate (e.g., 70% probability) and rationale based on industry trends, regulatory developments, competitive dynamics",
        "financial_impact": "Quantified financial impact: revenue at risk ($X-Y million), cost increases ($A-B million), market share loss (X%), operational disruption costs",
        "operational_impact": "Specific operational consequences: production capacity affected (X tonnes), facility impacts (Ruwais/Singapore), supply chain disruptions, workforce implications",
        "timeline": "Risk materialization timeline: immediate (0-6 months), near-term (6-18 months), medium-term (1-3 years), with specific trigger events",
        "mitigation_strategies": "Comprehensive mitigation plan: (1) Immediate defensive actions, (2) Medium-term strategic responses, (3) Long-term structural changes. Include costs, timelines, and responsible parties.",
        "monitoring_indicators": "Early warning indicators and monitoring systems to track risk evolution and mitigation effectiveness"
      }
    ],
    "strategic_opportunities": [
      {
        "opportunity": "Specific market, competitive, or strategic opportunity with clear value creation potential",
        "market_size": "Total addressable market (TAM) and serviceable addressable market (SAM): $X billion global, $Y billion accessible to Borouge, growth rate (X% CAGR)",
        "revenue_potential": "Quantified revenue opportunity: near-term potential ($X-Y million over 2-3 years), long-term potential ($A-B million over 5-10 years), market share targets",
        "competitive_advantage": "Detailed analysis of how Borouge can win: unique capabilities, strategic assets (location, technology, partnerships), competitive moats, barriers to entry for competitors",
        "investment_thesis": "Comprehensive investment rationale: strategic fit with Borouge's capabilities, market timing, competitive landscape, risk-adjusted returns, alignment with ESG goals",
        "implementation_requirements": "Detailed requirements: capital investment ($X million), technology needs, partnership requirements, regulatory approvals, timeline for market entry",
        "success_probability": "Probability of success (X%) with key success factors and potential obstacles"
      }
    ]
  },
  "enhanced_esg_analysis": {
    "materiality_assessment": "Comprehensive materiality analysis for Borouge's business model: impact on carbon neutrality 2050 goal, circular economy targets (30% circular content by 2030), stakeholder value creation, regulatory compliance positioning",
    "stakeholder_impact_analysis": "Detailed stakeholder impact assessment: (1) Investors - ESG rating implications, cost of capital effects, (2) Customers - sustainability requirements, procurement criteria changes, (3) Regulators - compliance positioning, regulatory relationship impact, (4) Communities - social license to operate, local economic impact",
    "long_term_value_creation": "Strategic value creation analysis: competitive advantages from ESG leadership, market differentiation opportunities, premium pricing potential, risk mitigation value, operational efficiency gains, talent attraction benefits",
    "strategic_roadmap": "Comprehensive half-page+ strategic implementation roadmap with three phases: IMMEDIATE (0-6 months): Crisis response and compliance actions, regulatory gap analysis, stakeholder communication strategy, quick wins identification. SHORT-TERM (6-18 months): Strategic initiative implementation, technology investments, partnership development, capability building, performance monitoring systems. LONG-TERM (18+ months): Structural transformation, market leadership positioning, innovation pipeline development, sustainable competitive advantage creation. Each phase includes specific methodologies, frameworks, cross-functional collaboration requirements, governance structures, technology and infrastructure needs, change management considerations, regulatory compliance pathways, performance monitoring mechanisms, integration with existing Borouge ESG initiatives."
  },
  "competitive_intelligence": {
    "competitor_movements": "Key competitor actions and implications",
    "market_dynamics": "Changing market conditions in key regions",
    "technology_trends": "Relevant technology or innovation developments",
    "supply_chain_insights": "Supply chain or trade policy implications"
  },
  "financial_implications": {
    "cost_impact": "Estimated cost implications (ranges where possible)",
    "revenue_opportunities": "Revenue upside potential",
    "capex_requirements": "Capital expenditure needs",
    "operational_efficiency": "Operational cost savings or increases"
  },
  "recommended_actions": {
    "board_decisions_required": ["Decision 1", "Decision 2"],
    "management_actions": ["Action 1", "Action 2"],
    "stakeholder_communications": "Key messages for investors, customers, regulators",
    "next_steps": "Immediate next steps for executive team"
  }
}

ANALYSIS GUIDELINES:
- Focus on strategic, board-level insights
- Quantify financial impacts where possible
- Consider Borouge's specific market position and capabilities
- Emphasize actionable recommendations
- Include both defensive (risk) and offensive (opportunity) strategies
- Reference industry benchmarks and competitive dynamics
- Consider ESG and sustainability implications
- Provide clear timelines and resource requirements`;
  }

  // Parse AI-generated executive summary
  parseExecutiveSummary(aiResponse) {
    try {
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const summary = JSON.parse(jsonMatch[0]);
        return this.validateAndStructureSummary(summary);
      }
    } catch (error) {
      console.error('❌ Error parsing executive summary:', error);
    }

    return this.generateFallbackExecutiveSummary();
  }

  // Validate and structure the executive summary
  validateAndStructureSummary(summary) {
    return {
      executive_overview: summary.executive_overview || {
        key_findings: 'Comprehensive analysis in progress - detailed strategic assessment pending',
        strategic_implications: 'Strategic impact assessment pending comprehensive analysis',
        urgency_assessment: 'Timeline evaluation needed for strategic prioritization',
        confidence_level: 'medium',
        financial_impact_range: 'Financial impact quantification pending',
        competitive_urgency: 'Competitive response timing assessment needed'
      },
      business_impact_analysis: summary.business_impact_analysis || {
        revenue_implications: 'Revenue impact analysis pending',
        operational_impact: 'Operational assessment required',
        market_positioning: 'Competitive positioning analysis needed',
        regulatory_compliance: 'Compliance assessment pending'
      },
      strategic_priorities: summary.strategic_priorities || {
        immediate_actions: [{
          priority: 'Conduct comprehensive strategic analysis',
          business_rationale: 'Ensure accurate strategic assessment for $8.5B business',
          urgency_drivers: 'Strategic decision-making requirements',
          implementation_steps: 'Initiate detailed analysis with senior strategy team',
          success_metrics: 'Completed strategic assessment with actionable recommendations',
          resource_requirements: 'Senior analyst team and external strategic consultants',
          risk_of_delay: 'Delayed strategic response to market developments',
          dependencies: 'Data availability and stakeholder engagement',
          timeline: '2-4 weeks for comprehensive analysis'
        }],
        medium_term_initiatives: []
      },
      risk_and_opportunity_matrix: summary.risk_and_opportunity_matrix || {
        critical_risks: [],
        strategic_opportunities: []
      },
      enhanced_esg_analysis: summary.enhanced_esg_analysis || {
        materiality_assessment: 'ESG materiality analysis pending',
        stakeholder_impact_analysis: 'Stakeholder impact assessment required',
        long_term_value_creation: 'Value creation analysis needed',
        strategic_roadmap: 'Strategic implementation roadmap development pending'
      },
      competitive_intelligence: summary.competitive_intelligence || {},
      financial_implications: summary.financial_implications || {},
      recommended_actions: summary.recommended_actions || {}
    };
  }

  // Helper methods for content classification
  isRegulatoryContent(article) {
    const content = `${article.title} ${article.description || ''}`.toLowerCase();
    const regulatoryKeywords = ['regulation', 'compliance', 'law', 'policy', 'ban', 'restriction', 'mandate', 'requirement'];
    return regulatoryKeywords.some(keyword => content.includes(keyword));
  }

  isCompetitiveContent(article) {
    const content = `${article.title} ${article.description || ''}`.toLowerCase();
    const competitorKeywords = ['sabic', 'dow', 'exxonmobil', 'basf', 'lyondellbasell', 'sinopec', 'petrochina'];
    return competitorKeywords.some(keyword => content.includes(keyword));
  }

  isESGContent(article) {
    const content = `${article.title} ${article.description || ''}`.toLowerCase();
    const esgKeywords = ['esg', 'sustainability', 'carbon', 'environment', 'circular', 'recycling', 'green'];
    return esgKeywords.some(keyword => content.includes(keyword));
  }

  // Calculate geographic relevance
  calculateGeographicRelevance(articles) {
    const regions = ['uae', 'singapore', 'china', 'india', 'europe', 'asia'];
    const relevance = {};

    regions.forEach(region => {
      relevance[region] = articles.filter(article => {
        const content = `${article.title} ${article.description || ''}`.toLowerCase();
        return content.includes(region);
      }).length;
    });

    return relevance;
  }

  // Calculate overall confidence level
  calculateOverallConfidence(articles) {
    const confidenceLevels = articles.map(a => a.quantitative_insights?.confidence_level || 'medium');
    const highConfidence = confidenceLevels.filter(c => c === 'high').length;
    const totalArticles = articles.length;

    if (highConfidence / totalArticles > 0.7) return 'high';
    if (highConfidence / totalArticles > 0.4) return 'medium';
    return 'low';
  }

  // Generate fallback executive summary
  generateFallbackExecutiveSummary(query = '', articles = []) {
    return {
      executive_overview: {
        key_findings: `Analysis of ${articles.length} articles related to "${query}" requires manual executive review`,
        strategic_implications: 'Strategic assessment pending comprehensive analysis',
        urgency_assessment: 'Timeline evaluation needed',
        confidence_level: 'low'
      },
      business_impact_analysis: {
        revenue_implications: 'Revenue impact assessment required',
        operational_impact: 'Operational analysis needed',
        market_positioning: 'Competitive positioning review required',
        regulatory_compliance: 'Compliance assessment pending'
      },
      strategic_priorities: {
        immediate_actions: [{
          priority: 'Conduct comprehensive manual analysis',
          business_rationale: 'Ensure accurate strategic assessment',
          resource_requirement: 'Senior analyst team',
          success_metrics: 'Completed strategic analysis',
          timeline: '1-2 weeks'
        }],
        medium_term_initiatives: []
      },
      risk_and_opportunity_matrix: {
        critical_risks: [],
        strategic_opportunities: []
      },
      esg_and_sustainability: {
        carbon_neutrality_impact: 'ESG impact assessment required',
        circular_economy_opportunities: 'Circular economy analysis needed',
        regulatory_landscape: 'Regulatory review pending',
        stakeholder_expectations: 'Stakeholder impact assessment required'
      },
      competitive_intelligence: {
        competitor_movements: 'Competitive analysis required',
        market_dynamics: 'Market assessment needed',
        technology_trends: 'Technology review pending',
        supply_chain_insights: 'Supply chain analysis required'
      },
      financial_implications: {
        cost_impact: 'Cost analysis pending',
        revenue_opportunities: 'Revenue assessment required',
        capex_requirements: 'Capital requirements evaluation needed',
        operational_efficiency: 'Efficiency analysis pending'
      },
      recommended_actions: {
        board_decisions_required: ['Approve comprehensive analysis budget'],
        management_actions: ['Initiate detailed strategic review'],
        stakeholder_communications: 'Communication strategy development needed',
        next_steps: 'Schedule executive strategy session'
      }
    };
  }
}

module.exports = ExecutiveSummaryService;
