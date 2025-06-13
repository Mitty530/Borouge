/**
 * Query Validation Service
 * Validates user queries for ESG relevance and provides helpful suggestions
 * Implements the established requirements for ESG query validation
 */

class QueryValidationService {
  constructor() {
    // ESG-related keywords and topics
    this.esgKeywords = [
      // Environmental
      'environment', 'environmental', 'carbon', 'emissions', 'climate', 'sustainability',
      'renewable', 'energy', 'waste', 'recycling', 'circular', 'pollution', 'biodiversity',
      'water', 'air', 'greenhouse', 'footprint', 'green', 'clean', 'eco',
      
      // Social
      'social', 'community', 'diversity', 'inclusion', 'equity', 'human rights',
      'labor', 'workplace', 'safety', 'health', 'employee', 'stakeholder',
      'supply chain', 'ethics', 'fair trade', 'social impact',
      
      // Governance
      'governance', 'board', 'transparency', 'accountability', 'compliance',
      'risk management', 'audit', 'disclosure', 'reporting', 'ethics',
      'anti-corruption', 'data privacy', 'cybersecurity',
      
      // Industry-specific
      'petrochemical', 'chemical', 'plastic', 'polymer', 'polyethylene', 'polypropylene',
      'refining', 'oil', 'gas', 'manufacturing', 'industrial',
      
      // Regulations and standards
      'regulation', 'regulatory', 'compliance', 'standard', 'framework',
      'policy', 'law', 'legislation', 'directive', 'requirement',
      'REACH', 'CBAM', 'EU', 'EPA', 'ISO', 'GRI', 'SASB', 'TCFD',
      
      // Geographic regions
      'UAE', 'Singapore', 'Europe', 'Asia', 'Middle East', 'China', 'India'
    ];

    // Common non-ESG queries that should be redirected
    this.nonEsgPatterns = [
      /^(hello|hi|hey|what|how are you)/i,
      /^(weather|sports|entertainment|music|movie)/i,
      /^(recipe|cooking|food|restaurant)/i,
      /^(travel|vacation|holiday|tourism)/i,
      /^(programming|code|software|app)/i,
      /^(math|calculation|solve|equation)/i
    ];

    // ESG query suggestions
    this.esgSuggestions = [
      'Carbon emissions reduction strategies',
      'EU plastic waste regulations 2024',
      'Circular economy in petrochemicals',
      'CBAM carbon border adjustment mechanism',
      'REACH compliance requirements',
      'Sustainability reporting standards',
      'ESG disclosure requirements UAE',
      'Plastic recycling technologies',
      'Green hydrogen in petrochemicals',
      'Supply chain sustainability',
      'Environmental impact assessment',
      'Corporate governance best practices'
    ];
  }

  /**
   * Validate if a query is ESG-related
   * @param {string} query - User query to validate
   * @returns {Object} - Validation result with suggestions
   */
  validateQuery(query) {
    if (!query || typeof query !== 'string') {
      return {
        isValid: false,
        message: 'Please enter a valid search query',
        suggestions: this.getRandomSuggestions(4)
      };
    }

    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length === 0) {
      return {
        isValid: false,
        message: 'Please enter a search query',
        suggestions: this.getRandomSuggestions(4)
      };
    }

    if (trimmedQuery.length < 3) {
      return {
        isValid: false,
        message: 'Please enter a more specific search query (at least 3 characters)',
        suggestions: this.getRandomSuggestions(4)
      };
    }

    if (trimmedQuery.length > 1000) {
      return {
        isValid: false,
        message: 'Query too long. Please limit to 1000 characters or less',
        suggestions: this.getRandomSuggestions(4)
      };
    }

    // Check for obvious non-ESG patterns
    for (const pattern of this.nonEsgPatterns) {
      if (pattern.test(trimmedQuery)) {
        return {
          isValid: false,
          message: 'This appears to be a general query. Please search for ESG-related topics.',
          suggestions: this.getRandomSuggestions(6)
        };
      }
    }

    // Check for ESG relevance
    const lowerQuery = trimmedQuery.toLowerCase();
    const hasEsgKeywords = this.esgKeywords.some(keyword => 
      lowerQuery.includes(keyword.toLowerCase())
    );

    if (!hasEsgKeywords) {
      // Additional check for business/industry terms that might be ESG-relevant
      const businessTerms = [
        'business', 'company', 'corporate', 'industry', 'market', 'investment',
        'strategy', 'performance', 'management', 'operations', 'development',
        'innovation', 'technology', 'future', 'trends', 'analysis', 'report'
      ];

      const hasBusinessTerms = businessTerms.some(term => 
        lowerQuery.includes(term.toLowerCase())
      );

      if (!hasBusinessTerms) {
        return {
          isValid: false,
          message: 'Please search for ESG-related topics such as environmental, social, governance, sustainability, or regulatory matters.',
          suggestions: this.getRandomSuggestions(6)
        };
      }
    }

    // Query appears to be ESG-related
    return {
      isValid: true,
      message: 'Query validated successfully',
      confidence: this.calculateEsgConfidence(lowerQuery),
      enhancedKeywords: this.extractRelevantKeywords(lowerQuery)
    };
  }

  /**
   * Calculate confidence score for ESG relevance
   * @param {string} query - Lowercase query
   * @returns {number} - Confidence score (0-1)
   */
  calculateEsgConfidence(query) {
    let score = 0;
    let matchCount = 0;

    for (const keyword of this.esgKeywords) {
      if (query.includes(keyword.toLowerCase())) {
        matchCount++;
        // Weight certain keywords higher
        if (['esg', 'sustainability', 'governance', 'environmental'].includes(keyword.toLowerCase())) {
          score += 0.3;
        } else {
          score += 0.1;
        }
      }
    }

    return Math.min(score, 1.0);
  }

  /**
   * Extract relevant ESG keywords from query
   * @param {string} query - Lowercase query
   * @returns {Array} - Array of matched keywords
   */
  extractRelevantKeywords(query) {
    return this.esgKeywords.filter(keyword => 
      query.includes(keyword.toLowerCase())
    );
  }

  /**
   * Get random ESG suggestions
   * @param {number} count - Number of suggestions to return
   * @returns {Array} - Array of suggestion strings
   */
  getRandomSuggestions(count = 4) {
    const shuffled = [...this.esgSuggestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  /**
   * Get suggestions based on query context
   * @param {string} query - User query
   * @returns {Array} - Contextual suggestions
   */
  getContextualSuggestions(query) {
    const lowerQuery = query.toLowerCase();
    
    // Environmental context
    if (lowerQuery.includes('environment') || lowerQuery.includes('carbon') || lowerQuery.includes('climate')) {
      return [
        'Carbon emissions reduction strategies',
        'Environmental impact assessment',
        'Climate change adaptation plans',
        'Renewable energy transition'
      ];
    }
    
    // Regulatory context
    if (lowerQuery.includes('regulation') || lowerQuery.includes('compliance') || lowerQuery.includes('law')) {
      return [
        'EU plastic waste regulations 2024',
        'CBAM carbon border adjustment mechanism',
        'REACH compliance requirements',
        'ESG disclosure requirements UAE'
      ];
    }
    
    // Industry context
    if (lowerQuery.includes('plastic') || lowerQuery.includes('petrochemical') || lowerQuery.includes('chemical')) {
      return [
        'Circular economy in petrochemicals',
        'Plastic recycling technologies',
        'Green hydrogen in petrochemicals',
        'Sustainable chemical manufacturing'
      ];
    }
    
    // Default suggestions
    return this.getRandomSuggestions(4);
  }

  /**
   * Enhance query with additional context
   * @param {string} query - Original query
   * @returns {Object} - Enhanced query information
   */
  enhanceQuery(query) {
    const validation = this.validateQuery(query);
    
    if (!validation.isValid) {
      return validation;
    }

    return {
      ...validation,
      originalQuery: query,
      suggestedEnhancements: this.getContextualSuggestions(query),
      queryType: this.classifyQueryType(query),
      priority: this.assessQueryPriority(query)
    };
  }

  /**
   * Classify the type of ESG query
   * @param {string} query - User query
   * @returns {string} - Query classification
   */
  classifyQueryType(query) {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('regulation') || lowerQuery.includes('compliance') || lowerQuery.includes('law')) {
      return 'regulatory';
    }
    if (lowerQuery.includes('environment') || lowerQuery.includes('carbon') || lowerQuery.includes('climate')) {
      return 'environmental';
    }
    if (lowerQuery.includes('social') || lowerQuery.includes('community') || lowerQuery.includes('diversity')) {
      return 'social';
    }
    if (lowerQuery.includes('governance') || lowerQuery.includes('board') || lowerQuery.includes('transparency')) {
      return 'governance';
    }
    if (lowerQuery.includes('report') || lowerQuery.includes('disclosure') || lowerQuery.includes('standard')) {
      return 'reporting';
    }
    
    return 'general';
  }

  /**
   * Assess query priority level
   * @param {string} query - User query
   * @returns {string} - Priority level
   */
  assessQueryPriority(query) {
    const lowerQuery = query.toLowerCase();
    const urgentTerms = ['urgent', 'immediate', 'crisis', 'emergency', 'deadline', 'compliance'];
    const highPriorityTerms = ['regulation', 'requirement', 'mandatory', 'audit', 'risk'];
    
    if (urgentTerms.some(term => lowerQuery.includes(term))) {
      return 'urgent';
    }
    if (highPriorityTerms.some(term => lowerQuery.includes(term))) {
      return 'high';
    }
    
    return 'medium';
  }
}

// Export singleton instance
export const queryValidationService = new QueryValidationService();
