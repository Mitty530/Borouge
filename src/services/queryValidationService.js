// Query Validation Service for Borouge ESG Intelligence Platform
// Validates user queries to ensure they are meaningful and ESG-related

class QueryValidationService {
  constructor() {
    // ESG-related keywords and terms
    this.esgKeywords = [
      // Environmental keywords
      'environment', 'environmental', 'carbon', 'emissions', 'climate', 'sustainability',
      'renewable', 'energy', 'waste', 'pollution', 'recycling', 'circular', 'economy',
      'biodiversity', 'water', 'air', 'quality', 'green', 'clean', 'eco', 'footprint',
      'greenhouse', 'gas', 'ghg', 'scope', 'net', 'zero', 'decarbonization', 'renewable',
      
      // Social keywords
      'social', 'community', 'employee', 'workers', 'safety', 'health', 'human', 'rights',
      'diversity', 'inclusion', 'equity', 'labor', 'workplace', 'training', 'development',
      'stakeholder', 'engagement', 'supply', 'chain', 'responsible', 'sourcing',
      
      // Governance keywords
      'governance', 'board', 'ethics', 'compliance', 'transparency', 'accountability',
      'risk', 'management', 'audit', 'reporting', 'disclosure', 'regulation', 'regulatory',
      'policy', 'framework', 'standards', 'certification', 'accreditation',
      
      // Industry-specific keywords
      'petrochemical', 'chemical', 'plastic', 'polymer', 'polyolefin', 'manufacturing',
      'industrial', 'production', 'facility', 'plant', 'operations', 'borouge', 'sabic',
      'adnoc', 'uae', 'singapore', 'middle', 'east',
      
      // Regulatory and compliance keywords
      'cbam', 'reach', 'rohs', 'weee', 'eu', 'european', 'union', 'regulation', 'directive',
      'law', 'legislation', 'standard', 'iso', 'gri', 'sasb', 'tcfd', 'ungc',
      
      // Business and strategy keywords
      'strategy', 'strategic', 'business', 'market', 'industry', 'competitive', 'advantage',
      'innovation', 'technology', 'digital', 'transformation', 'investment', 'growth',
      'performance', 'metrics', 'kpi', 'target', 'goal', 'objective'
    ];

    // Common meaningless patterns
    this.meaninglessPatterns = [
      /^[a-z]{3,}$/i, // Random letter sequences like "asdwrd"
      /^[A-Z]{3,}$/, // All caps random sequences like "AADWRDWSD"
      /^[0-9]+$/, // Only numbers
      /^[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+$/, // Only special characters
      /^(.)\1{2,}$/, // Repeated characters like "aaaa" or "1111"
      /^(qwerty|asdf|zxcv|keyboard|test|hello|hi|hey)$/i, // Common test strings
      /^[a-z]{1,2}$/i, // Very short meaningless strings
    ];

    // Minimum meaningful query requirements
    this.minQueryLength = 3;
    this.maxQueryLength = 500;
  }

  /**
   * Main validation method
   * @param {string} query - The user's search query
   * @returns {Object} - Validation result with isValid, reason, and suggestions
   */
  validateQuery(query) {
    if (!query || typeof query !== 'string') {
      return {
        isValid: false,
        reason: 'empty',
        message: 'Please enter a search query.',
        suggestions: this.getDefaultSuggestions()
      };
    }

    const trimmedQuery = query.trim();

    // Check minimum length
    if (trimmedQuery.length < this.minQueryLength) {
      return {
        isValid: false,
        reason: 'too_short',
        message: 'Please enter a more detailed search query.',
        suggestions: this.getDefaultSuggestions()
      };
    }

    // Check maximum length
    if (trimmedQuery.length > this.maxQueryLength) {
      return {
        isValid: false,
        reason: 'too_long',
        message: 'Please shorten your search query.',
        suggestions: this.getDefaultSuggestions()
      };
    }

    // Check for meaningless patterns
    if (this.isMeaninglessPattern(trimmedQuery)) {
      return {
        isValid: false,
        reason: 'meaningless',
        message: 'Your query appears to contain random characters. Please enter a meaningful ESG-related search term.',
        suggestions: this.getDefaultSuggestions()
      };
    }

    // Check for ESG relevance
    const relevanceScore = this.calculateESGRelevance(trimmedQuery);
    
    if (relevanceScore < 0.1) { // Very low threshold for ESG relevance
      return {
        isValid: false,
        reason: 'not_esg_related',
        message: 'Your query doesn\'t appear to be related to ESG (Environmental, Social, Governance) topics or Borouge\'s business operations.',
        suggestions: this.getContextualSuggestions(trimmedQuery)
      };
    }

    // Query is valid
    return {
      isValid: true,
      relevanceScore: relevanceScore,
      enhancedQuery: this.enhanceQuery(trimmedQuery)
    };
  }

  /**
   * Check if query matches meaningless patterns
   * @param {string} query - The query to check
   * @returns {boolean} - True if meaningless
   */
  isMeaninglessPattern(query) {
    return this.meaninglessPatterns.some(pattern => pattern.test(query));
  }

  /**
   * Calculate ESG relevance score
   * @param {string} query - The query to analyze
   * @returns {number} - Relevance score between 0 and 1
   */
  calculateESGRelevance(query) {
    const queryLower = query.toLowerCase();
    const words = queryLower.split(/\s+/);
    
    let matchCount = 0;
    let totalWords = words.length;

    // Check for direct keyword matches
    words.forEach(word => {
      if (this.esgKeywords.some(keyword => 
        word.includes(keyword) || keyword.includes(word)
      )) {
        matchCount++;
      }
    });

    // Bonus for industry-specific terms
    if (queryLower.includes('borouge') || queryLower.includes('petrochemical') || 
        queryLower.includes('plastic') || queryLower.includes('polymer')) {
      matchCount += 2;
    }

    // Bonus for ESG acronyms
    if (/\b(esg|csr|sdg|tcfd|sasb|gri|ungc|cbam|reach)\b/i.test(queryLower)) {
      matchCount += 2;
    }

    return Math.min(1, matchCount / Math.max(1, totalWords));
  }

  /**
   * Enhance valid queries with additional context
   * @param {string} query - The original query
   * @returns {string} - Enhanced query
   */
  enhanceQuery(query) {
    // For now, return the original query
    // This could be expanded to add Borouge-specific context
    return query;
  }

  /**
   * Get default ESG-related suggestions
   * @returns {Array} - Array of suggestion objects
   */
  getDefaultSuggestions() {
    return [
      {
        category: 'Environmental',
        suggestions: [
          'carbon emissions reduction strategies',
          'renewable energy adoption in petrochemicals',
          'circular economy initiatives',
          'waste management best practices'
        ]
      },
      {
        category: 'Social',
        suggestions: [
          'employee safety programs',
          'community engagement initiatives',
          'supply chain responsibility',
          'diversity and inclusion policies'
        ]
      },
      {
        category: 'Governance',
        suggestions: [
          'ESG reporting requirements',
          'regulatory compliance frameworks',
          'risk management strategies',
          'transparency and accountability measures'
        ]
      },
      {
        category: 'Industry-Specific',
        suggestions: [
          'CBAM carbon border adjustment impact',
          'EU plastic regulations 2024',
          'petrochemical sustainability trends',
          'polymer recycling technologies'
        ]
      }
    ];
  }

  /**
   * Get contextual suggestions based on the invalid query
   * @param {string} query - The original query
   * @returns {Array} - Array of suggestion objects
   */
  getContextualSuggestions(query) {
    const queryLower = query.toLowerCase();

    // Try to infer intent from partial matches
    if (queryLower.includes('carbon') || queryLower.includes('emission')) {
      return [{
        category: 'Environmental - Carbon Management',
        suggestions: [
          'carbon footprint reduction strategies',
          'scope 1 2 3 emissions reporting',
          'carbon pricing mechanisms',
          'net zero transition plans'
        ]
      }];
    }

    if (queryLower.includes('plastic') || queryLower.includes('polymer')) {
      return [{
        category: 'Industry - Plastics & Polymers',
        suggestions: [
          'plastic waste reduction initiatives',
          'polymer recycling technologies',
          'sustainable plastic alternatives',
          'circular economy in plastics'
        ]
      }];
    }

    if (queryLower.includes('regulation') || queryLower.includes('compliance')) {
      return [{
        category: 'Governance - Regulatory Compliance',
        suggestions: [
          'EU chemical regulations compliance',
          'CBAM implementation strategies',
          'REACH regulation requirements',
          'environmental compliance frameworks'
        ]
      }];
    }

    // Return default suggestions if no context found
    return this.getDefaultSuggestions();
  }

  /**
   * Quick validation for real-time feedback
   * @param {string} query - The query to validate
   * @returns {boolean} - True if query appears valid
   */
  quickValidate(query) {
    if (!query || query.trim().length < this.minQueryLength) {
      return false;
    }

    if (this.isMeaninglessPattern(query.trim())) {
      return false;
    }

    return true;
  }

  /**
   * Get validation status for UI feedback
   * @param {string} query - The query to check
   * @returns {string} - Status: 'empty', 'invalid', 'warning', 'valid'
   */
  getValidationStatus(query) {
    if (!query || query.trim().length === 0) {
      return 'empty';
    }

    const trimmedQuery = query.trim();

    if (trimmedQuery.length < this.minQueryLength || this.isMeaninglessPattern(trimmedQuery)) {
      return 'invalid';
    }

    const relevanceScore = this.calculateESGRelevance(trimmedQuery);

    if (relevanceScore < 0.1) {
      return 'warning';
    }

    return 'valid';
  }
}

// Export singleton instance
export const queryValidationService = new QueryValidationService();
export default queryValidationService;
