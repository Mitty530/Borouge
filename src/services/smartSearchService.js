/**
 * Smart Search Service
 * Interfaces with the backend /api/esg-smart-search endpoint
 * Handles news-based ESG intelligence with article analysis
 */

class SmartSearchService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production'
      ? '' // Use relative URLs in production
      : 'http://localhost:3001'; // Direct backend URL in development
  }

  /**
   * Perform smart search using the backend API
   * @param {string} query - The ESG query to search
   * @returns {Promise<Object>} - Backend response object
   */
  async performSmartSearch(query) {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 Smart Search API request: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);

      const response = await fetch(`${this.baseURL}/api/esg-smart-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': this.generateRequestId(),
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      const clientResponseTime = Date.now() - startTime;

      if (data.success) {
        console.log('✅ Smart Search API response received');
        console.log('   - Backend response time:', data.responseTime, 'ms');
        console.log('   - Total client time:', clientResponseTime, 'ms');
        console.log('   - Articles found:', data.articles?.length || 0);
        console.log('   - Cached:', data.cached);

        return {
          success: true,
          query: data.query,
          responseTime: data.responseTime,
          clientResponseTime,
          cached: data.cached,
          timestamp: data.timestamp,
          
          // Search metadata
          searchMetadata: data.searchMetadata || {},
          
          // Executive summary
          executiveSummary: data.executiveSummary || {},
          comprehensiveExecutiveSummary: data.comprehensiveExecutiveSummary,
          
          // Analytics
          analytics: data.analytics || {},
          
          // Articles
          articles: data.articles || [],
          
          // Action items
          actionItems: data.actionItems || [],
          
          // API usage info
          apiUsage: data.apiUsage || {},
          
          metadata: {
            source: 'backend_smart_search',
            endpoint: '/api/esg-smart-search',
            apiVersion: '2.0.0',
            analysisDepth: data.searchMetadata?.analysisDepth || 'standard'
          }
        };
      } else {
        throw new Error(data.error?.message || 'Backend returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Smart Search API error:', error);
      
      // Return structured error response
      return {
        success: false,
        error: {
          message: error.message,
          type: 'api_error',
          timestamp: new Date().toISOString(),
          details: {
            query,
            endpoint: '/api/esg-smart-search',
            clientResponseTime: Date.now() - startTime
          }
        }
      };
    }
  }

  /**
   * Get recent articles from the backend
   * @returns {Promise<Object>} - Recent articles data
   */
  async getRecentArticles() {
    try {
      const response = await fetch(`${this.baseURL}/api/news/recent`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch recent articles:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get news service health status
   * @returns {Promise<Object>} - News service health
   */
  async getNewsHealth() {
    try {
      const response = await fetch(`${this.baseURL}/api/news/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ News health check failed:', error);
      return {
        success: false,
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Get search analytics from backend
   * @returns {Promise<Object>} - Search analytics data
   */
  async getSearchAnalytics() {
    try {
      const response = await fetch(`${this.baseURL}/api/analytics/search`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch search analytics:', error);
      return null;
    }
  }

  /**
   * Get article analytics from backend
   * @returns {Promise<Object>} - Article analytics data
   */
  async getArticleAnalytics() {
    try {
      const response = await fetch(`${this.baseURL}/api/analytics/articles`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch article analytics:', error);
      return null;
    }
  }

  /**
   * Generate a unique request ID
   * @returns {string} - Unique request identifier
   */
  generateRequestId() {
    return `smart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Format article for display
   * @param {Object} article - Raw article data
   * @returns {Object} - Formatted article
   */
  formatArticle(article) {
    return {
      id: article.id,
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source,
      publishedAt: article.published_at || article.publishedAt,
      imageUrl: article.image_url || article.imageUrl,
      relevanceScore: article.relevance_score || article.relevanceScore,
      impactLevel: article.impact_level || article.impactLevel,
      summary: article.summary,
      actionItems: article.action_items || article.actionItems,
      borogueKeywords: article.borouge_keywords || article.borogueKeywords
    };
  }

  /**
   * Get impact level color for UI display
   * @param {string} impactLevel - Impact level (HIGH, MEDIUM, LOW, OPPORTUNITY, CRITICAL)
   * @returns {string} - CSS color class
   */
  getImpactLevelColor(impactLevel) {
    const colors = {
      'CRITICAL': 'critical',
      'HIGH': 'high',
      'OPPORTUNITY': 'opportunity',
      'MEDIUM': 'medium',
      'LOW': 'low'
    };
    return colors[impactLevel] || 'medium';
  }
}

// Export singleton instance
export const smartSearchService = new SmartSearchService();
