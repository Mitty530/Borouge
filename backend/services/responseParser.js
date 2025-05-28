// Advanced Response Parser and Validator for Borouge ESG Intelligence Platform
// JSON validation, response repair, and quality scoring

class ResponseParser {
  constructor() {
    this.responseSchema = this.defineResponseSchema();
  }

  // Define expected response schema for validation
  defineResponseSchema() {
    return {
      type: 'object',
      required: ['executiveSummary', 'articles', 'overallRiskLevel', 'totalSources'],
      properties: {
        executiveSummary: {
          type: 'string',
          minLength: 50,
          maxLength: 1000
        },
        articles: {
          type: 'array',
          minItems: 2,
          maxItems: 2,
          items: {
            type: 'object',
            required: ['articleId', 'reportType', 'priorityLabel', 'priority', 'executiveSummary', 'keyFindings', 'detailedAnalysis', 'financialImpact', 'actionItems', 'sources'],
            properties: {
              articleId: { type: 'number' },
              reportType: { type: 'string', minLength: 10 },
              priorityLabel: {
                type: 'string',
                enum: ['CRITICAL REGULATORY COMPLIANCE', 'HIGH FINANCIAL IMPACT', 'COMPETITIVE THREATS', 'OPPORTUNITIES', 'STRATEGIC CONSIDERATIONS']
              },
              priority: {
                type: 'string',
                enum: ['HIGH', 'MEDIUM', 'LOW']
              },
              executiveSummary: { type: 'string', minLength: 30 },
              keyFindings: {
                type: 'array',
                minItems: 1,
                items: {
                  type: 'object',
                  required: ['priority', 'title', 'description', 'businessImpact'],
                  properties: {
                    priority: { type: 'string', enum: ['HIGH', 'MEDIUM', 'LOW'] },
                    title: { type: 'string', minLength: 5 },
                    description: { type: 'string', minLength: 20 },
                    businessImpact: { type: 'string', minLength: 20 }
                  }
                }
              },
              detailedAnalysis: { type: 'string', minLength: 50 },
              financialImpact: {
                type: 'object',
                required: ['shortTerm', 'longTerm', 'investmentRequired'],
                properties: {
                  shortTerm: { type: 'string', minLength: 10 },
                  longTerm: { type: 'string', minLength: 10 },
                  investmentRequired: { type: 'string', minLength: 10 }
                }
              },
              actionItems: {
                type: 'array',
                minItems: 1,
                items: { type: 'string', minLength: 10 }
              },
              sources: { type: 'number', minimum: 1, maximum: 20 }
            }
          }
        },
        overallRiskLevel: {
          type: 'string',
          enum: ['HIGH', 'MEDIUM', 'LOW']
        },
        totalSources: { type: 'number', minimum: 1, maximum: 50 }
      }
    };
  }

  // Parse and validate AI response with advanced error handling
  async parseResponse(rawResponse, provider, query) {
    const startTime = Date.now();

    try {
      console.log(`🔍 Parsing response from ${provider} (${rawResponse.length} chars)`);

      // Step 1: Extract JSON from response
      const jsonContent = this.extractJSON(rawResponse);

      // Step 2: Parse JSON
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(jsonContent);
      } catch (parseError) {
        console.warn(`⚠️ JSON parse failed, attempting repair...`);
        parsedResponse = await this.repairAndParseJSON(jsonContent);
      }

      // Step 3: Validate against schema
      const validationResult = this.validateResponse(parsedResponse);

      // Step 4: Repair if validation fails
      if (!validationResult.valid) {
        console.warn(`⚠️ Validation failed, attempting repair...`);
        parsedResponse = this.repairResponse(parsedResponse, validationResult.errors, query);
      }

      // Step 5: Calculate quality score
      const qualityScore = this.calculateQualityScore(parsedResponse, query, provider);

      // Step 6: Enhance response with metadata
      const enhancedResponse = this.enhanceResponse(parsedResponse, {
        provider,
        qualityScore,
        parseTime: Date.now() - startTime,
        repaired: !validationResult.valid
      });

      console.log(`✅ Response parsed successfully (${Date.now() - startTime}ms, quality: ${qualityScore})`);

      return {
        success: true,
        data: enhancedResponse,
        qualityScore,
        metadata: {
          provider,
          parseTime: Date.now() - startTime,
          repaired: !validationResult.valid,
          originalLength: rawResponse.length
        }
      };

    } catch (error) {
      console.error(`❌ Response parsing failed for ${provider}:`, error);

      // Return fallback response
      return {
        success: false,
        error: error.message,
        metadata: {
          provider,
          parseTime: Date.now() - startTime,
          failed: true
        }
      };
    }
  }

  // Extract JSON content from AI response (handles various formats)
  extractJSON(response) {
    // Handle undefined or null responses
    if (!response || typeof response !== 'string') {
      console.error('Invalid response type:', typeof response, response);
      throw new Error('Response is not a valid string');
    }

    // Remove common AI response prefixes/suffixes
    let cleaned = response
      .replace(/^.*?```json\s*/i, '')
      .replace(/```.*$/i, '')
      .replace(/^.*?Here is the analysis.*?:\s*/i, '')
      .replace(/^.*?{/, '{')
      .replace(/}[^}]*$/, '}')
      .trim();

    // Find the main JSON object
    const jsonStart = cleaned.indexOf('{');
    const jsonEnd = cleaned.lastIndexOf('}');

    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      return cleaned.substring(jsonStart, jsonEnd + 1);
    }

    return cleaned;
  }

  // Attempt to repair malformed JSON
  async repairAndParseJSON(jsonContent) {
    const repairAttempts = [
      // Fix common JSON issues
      () => jsonContent.replace(/,(\s*[}\]])/g, '$1'), // Remove trailing commas
      () => jsonContent.replace(/([{,]\s*)(\w+):/g, '$1"$2":'), // Quote unquoted keys
      () => jsonContent.replace(/:\s*'([^']*)'/g, ': "$1"'), // Replace single quotes
      () => jsonContent.replace(/\n/g, '\\n'), // Escape newlines in strings
      () => jsonContent.replace(/\t/g, '\\t'), // Escape tabs

      // Try to complete truncated JSON
      () => {
        let fixed = jsonContent;
        const openBraces = (fixed.match(/{/g) || []).length;
        const closeBraces = (fixed.match(/}/g) || []).length;

        // Add missing closing braces
        for (let i = 0; i < openBraces - closeBraces; i++) {
          fixed += '}';
        }

        return fixed;
      },

      // Extract partial valid JSON
      () => {
        const lines = jsonContent.split('\n');
        let validJson = '';
        let braceCount = 0;

        for (const line of lines) {
          validJson += line + '\n';
          braceCount += (line.match(/{/g) || []).length;
          braceCount -= (line.match(/}/g) || []).length;

          if (braceCount === 0 && validJson.includes('{')) {
            break;
          }
        }

        return validJson.trim();
      }
    ];

    for (let i = 0; i < repairAttempts.length; i++) {
      try {
        const repairedJson = repairAttempts[i]();
        const parsed = JSON.parse(repairedJson);
        console.log(`🔧 JSON repaired using method ${i + 1}`);
        return parsed;
      } catch (error) {
        // Continue to next repair attempt
      }
    }

    throw new Error('Unable to repair malformed JSON response');
  }

  // Validate response against schema
  validateResponse(response) {
    const errors = [];

    try {
      // Check required top-level fields
      const requiredFields = ['executiveSummary', 'articles', 'overallRiskLevel', 'totalSources'];
      for (const field of requiredFields) {
        if (!response[field]) {
          errors.push(`Missing required field: ${field}`);
        }
      }

      // Validate articles array
      if (response.articles) {
        if (!Array.isArray(response.articles)) {
          errors.push('Articles must be an array');
        } else if (response.articles.length !== 2) {
          errors.push('Must have exactly 2 articles');
        } else {
          response.articles.forEach((article, index) => {
            const articleErrors = this.validateArticle(article, index);
            errors.push(...articleErrors);
          });
        }
      }

      // Validate enum values
      if (response.overallRiskLevel && !['HIGH', 'MEDIUM', 'LOW'].includes(response.overallRiskLevel)) {
        errors.push('Invalid overallRiskLevel value');
      }

      return {
        valid: errors.length === 0,
        errors
      };

    } catch (error) {
      return {
        valid: false,
        errors: [`Validation error: ${error.message}`]
      };
    }
  }

  // Validate individual article
  validateArticle(article, index) {
    const errors = [];
    const prefix = `Article ${index + 1}:`;

    const requiredFields = ['articleId', 'reportType', 'priorityLabel', 'priority', 'executiveSummary', 'keyFindings', 'detailedAnalysis', 'financialImpact', 'actionItems', 'sources'];

    for (const field of requiredFields) {
      if (!article[field]) {
        errors.push(`${prefix} Missing required field: ${field}`);
      }
    }

    // Validate priority labels
    const validPriorityLabels = ['CRITICAL REGULATORY COMPLIANCE', 'HIGH FINANCIAL IMPACT', 'COMPETITIVE THREATS', 'OPPORTUNITIES', 'STRATEGIC CONSIDERATIONS'];
    if (article.priorityLabel && !validPriorityLabels.includes(article.priorityLabel)) {
      errors.push(`${prefix} Invalid priorityLabel`);
    }

    // Validate priority values
    if (article.priority && !['HIGH', 'MEDIUM', 'LOW'].includes(article.priority)) {
      errors.push(`${prefix} Invalid priority value`);
    }

    // Validate key findings
    if (article.keyFindings && Array.isArray(article.keyFindings)) {
      article.keyFindings.forEach((finding, fIndex) => {
        if (!finding.title || !finding.description || !finding.businessImpact) {
          errors.push(`${prefix} Key finding ${fIndex + 1} missing required fields`);
        }
      });
    }

    // Validate financial impact
    if (article.financialImpact) {
      const requiredFinancialFields = ['shortTerm', 'longTerm', 'investmentRequired'];
      for (const field of requiredFinancialFields) {
        if (!article.financialImpact[field]) {
          errors.push(`${prefix} Missing financial impact field: ${field}`);
        }
      }
    }

    return errors;
  }

  // Repair response based on validation errors
  repairResponse(response, errors, query) {
    console.log(`🔧 Repairing response with ${errors.length} validation errors`);

    const repaired = JSON.parse(JSON.stringify(response)); // Deep clone

    // Fix missing top-level fields
    if (!repaired.executiveSummary) {
      repaired.executiveSummary = `ESG intelligence analysis completed for: "${query}". Detailed findings available for strategic review.`;
    }

    if (!repaired.overallRiskLevel) {
      repaired.overallRiskLevel = 'MEDIUM';
    }

    if (!repaired.totalSources) {
      repaired.totalSources = 8;
    }

    // Fix articles array
    if (!repaired.articles || !Array.isArray(repaired.articles)) {
      repaired.articles = [];
    }

    // Ensure exactly 2 articles
    while (repaired.articles.length < 2) {
      repaired.articles.push(this.generateFallbackArticle(repaired.articles.length + 1, query));
    }

    if (repaired.articles.length > 2) {
      repaired.articles = repaired.articles.slice(0, 2);
    }

    // Repair individual articles
    repaired.articles.forEach((article, index) => {
      this.repairArticle(article, index + 1, query);
    });

    // Update total sources
    repaired.totalSources = repaired.articles.reduce((sum, article) => sum + (article.sources || 0), 0);

    console.log(`✅ Response repaired successfully`);
    return repaired;
  }

  // Repair individual article
  repairArticle(article, articleId, query) {
    // Fix basic fields
    article.articleId = article.articleId || articleId;
    article.reportType = article.reportType || 'ESG Intelligence Analysis';
    article.priority = article.priority || 'MEDIUM';
    article.sources = article.sources || 4;

    // Fix priority label
    if (!article.priorityLabel || !['CRITICAL REGULATORY COMPLIANCE', 'HIGH FINANCIAL IMPACT', 'COMPETITIVE THREATS', 'OPPORTUNITIES', 'STRATEGIC CONSIDERATIONS'].includes(article.priorityLabel)) {
      article.priorityLabel = articleId === 1 ? 'CRITICAL REGULATORY COMPLIANCE' : 'HIGH FINANCIAL IMPACT';
    }

    // Fix executive summary
    if (!article.executiveSummary || article.executiveSummary.length < 30) {
      article.executiveSummary = `${article.reportType} analysis indicates ${article.priorityLabel.toLowerCase()} implications for Borouge operations.`;
    }

    // Fix key findings
    if (!article.keyFindings || !Array.isArray(article.keyFindings) || article.keyFindings.length === 0) {
      article.keyFindings = [{
        priority: 'MEDIUM',
        title: 'Analysis Completed',
        description: 'Comprehensive ESG intelligence analysis has been generated',
        businessImpact: 'Review detailed findings for business implications'
      }];
    }

    // Fix detailed analysis
    if (!article.detailedAnalysis || article.detailedAnalysis.length < 50) {
      article.detailedAnalysis = `Detailed ESG intelligence analysis for query: "${query}". This analysis covers regulatory implications, competitive positioning, and strategic recommendations specific to Borouge's operations.`;
    }

    // Fix financial impact
    if (!article.financialImpact) {
      article.financialImpact = {};
    }
    article.financialImpact.shortTerm = article.financialImpact.shortTerm || 'Impact assessment in progress';
    article.financialImpact.longTerm = article.financialImpact.longTerm || 'Long-term implications under evaluation';
    article.financialImpact.investmentRequired = article.financialImpact.investmentRequired || 'Investment analysis required';

    // Fix action items
    if (!article.actionItems || !Array.isArray(article.actionItems) || article.actionItems.length === 0) {
      article.actionItems = [
        'Review detailed analysis with relevant teams',
        'Assess regulatory compliance requirements',
        'Evaluate strategic implications'
      ];
    }
  }

  // Generate fallback article when repair is needed
  generateFallbackArticle(articleId, query) {
    const priorityLabels = ['CRITICAL REGULATORY COMPLIANCE', 'HIGH FINANCIAL IMPACT'];
    const reportTypes = ['ESG Intelligence Analysis', 'Strategic Recommendations'];

    return {
      articleId,
      reportType: reportTypes[articleId - 1] || 'ESG Intelligence Analysis',
      priorityLabel: priorityLabels[articleId - 1] || 'HIGH FINANCIAL IMPACT',
      priority: 'MEDIUM',
      executiveSummary: `Comprehensive ESG analysis completed for: "${query}". Detailed regulatory and business impact assessment available.`,
      keyFindings: [{
        priority: 'MEDIUM',
        title: 'Analysis Completed',
        description: 'ESG intelligence analysis has been generated for strategic review',
        businessImpact: 'Review detailed findings for business implications'
      }],
      detailedAnalysis: `Detailed ESG intelligence analysis for query: "${query}". This analysis covers regulatory implications, competitive positioning, and strategic recommendations specific to Borouge's operations.`,
      financialImpact: {
        shortTerm: 'Impact assessment in progress',
        longTerm: 'Long-term implications under evaluation',
        investmentRequired: 'Investment analysis required'
      },
      actionItems: [
        'Review detailed analysis with relevant teams',
        'Assess regulatory compliance requirements',
        'Evaluate strategic implications'
      ],
      sources: 4
    };
  }

  // Calculate quality score for response
  calculateQualityScore(response, query, provider) {
    let score = 100;

    try {
      // Completeness score (40% weight)
      const completenessScore = this.calculateCompletenessScore(response);

      // Relevance score (30% weight)
      const relevanceScore = this.calculateRelevanceScore(response, query);

      // Structure score (20% weight)
      const structureScore = this.calculateStructureScore(response);

      // Provider-specific score (10% weight)
      const providerScore = this.calculateProviderScore(provider);

      score = (completenessScore * 0.4) + (relevanceScore * 0.3) + (structureScore * 0.2) + (providerScore * 0.1);

      console.log(`📊 Quality score: ${score.toFixed(1)} (completeness: ${completenessScore}, relevance: ${relevanceScore}, structure: ${structureScore}, provider: ${providerScore})`);

    } catch (error) {
      console.error('Quality score calculation failed:', error);
      score = 50; // Default score for errors
    }

    return Math.max(0, Math.min(100, score));
  }

  // Calculate completeness score
  calculateCompletenessScore(response) {
    let score = 100;

    // Check required fields
    if (!response.executiveSummary || response.executiveSummary.length < 50) score -= 20;
    if (!response.articles || response.articles.length !== 2) score -= 30;
    if (!response.overallRiskLevel) score -= 10;
    if (!response.totalSources || response.totalSources < 1) score -= 10;

    // Check article completeness
    if (response.articles) {
      response.articles.forEach(article => {
        if (!article.keyFindings || article.keyFindings.length === 0) score -= 10;
        if (!article.detailedAnalysis || article.detailedAnalysis.length < 100) score -= 10;
        if (!article.financialImpact) score -= 5;
        if (!article.actionItems || article.actionItems.length === 0) score -= 5;
      });
    }

    return Math.max(0, score);
  }

  // Calculate relevance score based on Borouge context
  calculateRelevanceScore(response, query) {
    let score = 100;
    const content = JSON.stringify(response).toLowerCase();

    // Check for Borouge-specific context
    const borogueTerms = ['borouge', 'uae', 'petrochemical', 'polyethylene', 'polypropylene', 'adnoc'];
    const foundTerms = borogueTerms.filter(term => content.includes(term));
    if (foundTerms.length < 2) score -= 20;

    // Check for ESG relevance
    const esgTerms = ['esg', 'sustainability', 'regulatory', 'compliance', 'carbon', 'emission', 'environmental'];
    const foundEsgTerms = esgTerms.filter(term => content.includes(term));
    if (foundEsgTerms.length < 3) score -= 15;

    // Check for financial context
    const financialTerms = ['€', '$', 'million', 'billion', 'cost', 'investment', 'revenue', 'export'];
    const foundFinancialTerms = financialTerms.filter(term => content.includes(term));
    if (foundFinancialTerms.length < 2) score -= 10;

    // Check query relevance
    const queryWords = query.toLowerCase().split(' ').filter(word => word.length > 3);
    const relevantWords = queryWords.filter(word => content.includes(word));
    const relevanceRatio = relevantWords.length / queryWords.length;
    if (relevanceRatio < 0.5) score -= 20;

    return Math.max(0, score);
  }

  // Calculate structure score
  calculateStructureScore(response) {
    let score = 100;

    // Check article structure
    if (response.articles) {
      response.articles.forEach(article => {
        if (!article.priorityLabel || !['CRITICAL REGULATORY COMPLIANCE', 'HIGH FINANCIAL IMPACT', 'COMPETITIVE THREATS', 'OPPORTUNITIES', 'STRATEGIC CONSIDERATIONS'].includes(article.priorityLabel)) {
          score -= 10;
        }
        if (!article.priority || !['HIGH', 'MEDIUM', 'LOW'].includes(article.priority)) {
          score -= 5;
        }
      });
    }

    // Check overall structure
    if (!response.overallRiskLevel || !['HIGH', 'MEDIUM', 'LOW'].includes(response.overallRiskLevel)) {
      score -= 10;
    }

    return Math.max(0, score);
  }

  // Calculate provider-specific score
  calculateProviderScore(provider) {
    const providerScores = {
      groq: 90,    // Fast and reliable
      gemini: 85,  // Good quality
      openai: 95   // Highest quality but expensive
    };

    return providerScores[provider] || 80;
  }

  // Enhance response with metadata
  enhanceResponse(response, metadata) {
    return {
      ...response,
      _metadata: {
        provider: metadata.provider,
        qualityScore: metadata.qualityScore,
        parseTime: metadata.parseTime,
        repaired: metadata.repaired,
        timestamp: new Date().toISOString()
      }
    };
  }

  // Generate fallback response when parsing completely fails
  generateFallbackResponse(query, provider) {
    return {
      executiveSummary: `ESG intelligence analysis requested for: "${query}". Analysis service temporarily unavailable, please try again.`,
      articles: [
        this.generateFallbackArticle(1, query),
        this.generateFallbackArticle(2, query)
      ],
      overallRiskLevel: 'MEDIUM',
      totalSources: 8,
      _metadata: {
        provider,
        fallback: true,
        timestamp: new Date().toISOString()
      }
    };
  }
}

module.exports = ResponseParser;
