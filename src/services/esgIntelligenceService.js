/**
 * ESG Intelligence Service
 * Interfaces with the backend /api/esg-intelligence endpoint
 * Matches the exact backend API response structure
 */

class ESGIntelligenceService {
  constructor() {
    this.baseURL = process.env.NODE_ENV === 'production'
      ? '' // Use relative URLs in production (Vercel serverless functions)
      : 'http://localhost:3001'; // Direct backend URL in development
  }

  /**
   * Search ESG Intelligence using the backend API
   * @param {string} query - The ESG query to analyze
   * @returns {Promise<Object>} - Backend response object
   */
  async searchESGIntelligence(query) {
    const startTime = Date.now();
    
    try {
      console.log(`🔍 ESG Intelligence API request: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);

      const response = await fetch(`${this.baseURL}/api/esg-intelligence`, {
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
        console.log('✅ ESG Intelligence API response received');
        console.log('   - Backend response time:', data.responseTime, 'ms');
        console.log('   - Total client time:', clientResponseTime, 'ms');
        console.log('   - Cached:', data.cached);
        console.log('   - Content length:', data.response?.length || 0, 'characters');

        return {
          success: true,
          query: data.query,
          response: data.response,
          responseTime: data.responseTime,
          clientResponseTime,
          cached: data.cached,
          timestamp: data.timestamp,
          requestId: data.requestId,
          processingTime: data.processingTime,
          metadata: {
            source: 'backend_esg_intelligence',
            endpoint: '/api/esg-intelligence',
            apiVersion: '2.0.0'
          }
        };
      } else {
        throw new Error(data.error?.message || 'Backend returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ ESG Intelligence API error:', error);
      
      // Return structured error response
      return {
        success: false,
        error: {
          message: error.message,
          type: 'api_error',
          timestamp: new Date().toISOString(),
          details: {
            query,
            endpoint: '/api/esg-intelligence',
            clientResponseTime: Date.now() - startTime
          }
        }
      };
    }
  }

  /**
   * Get suggested queries from the backend
   * @returns {Promise<Array>} - Array of suggested queries
   */
  async getSuggestedQueries() {
    try {
      const response = await fetch(`${this.baseURL}/api/suggested-queries`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success ? data.queries : [];
    } catch (error) {
      console.error('❌ Failed to fetch suggested queries:', error);
      return this.getDefaultSuggestions();
    }
  }

  /**
   * Get default ESG query suggestions
   * @returns {Array} - Default suggestions
   */
  getDefaultSuggestions() {
    return [
      'EU plastic waste regulations 2024',
      'Carbon border adjustment mechanism CBAM',
      'Circular economy petrochemicals',
      'REACH compliance requirements',
      'Sustainability reporting standards',
      'ESG disclosure requirements UAE',
      'Plastic recycling technologies',
      'Green hydrogen petrochemicals'
    ];
  }

  /**
   * Generate a unique request ID
   * @returns {string} - Unique request identifier
   */
  generateRequestId() {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if the backend is healthy
   * @returns {Promise<Object>} - Health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseURL}/api/health`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Health check failed:', error);
      return {
        success: false,
        status: 'error',
        message: error.message
      };
    }
  }

  /**
   * Get performance report from backend
   * @returns {Promise<Object>} - Performance metrics
   */
  async getPerformanceReport() {
    try {
      const response = await fetch(`${this.baseURL}/api/performance-report`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ Failed to fetch performance report:', error);
      return null;
    }
  }
}

// Export singleton instance
export const esgIntelligenceService = new ESGIntelligenceService();
