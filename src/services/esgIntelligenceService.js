// ESG Intelligence Service for Frontend
// Production-ready service for real backend data integration

const API_BASE_URL = 'http://localhost:3001';

// Error handling utilities
const createErrorResponse = (message, details = {}) => {
  return {
    success: false,
    error: {
      message,
      details: 'The ESG Intelligence service is currently unavailable. Please try again later or contact support.',
      type: 'service_unavailable',
      timestamp: new Date().toISOString(),
      ...details
    },
    metadata: {
      source: 'frontend_esg_intelligence_error',
      note: 'Production system configured to fail gracefully when backend is unavailable'
    }
  };
};

export const esgIntelligenceService = {
  /**
   * Query the main ESG intelligence endpoint
   * @param {string} query - The ESG query to analyze
   * @returns {Promise<Object>} - The analysis result
   */
  analyzeQuery: async (query) => {
    try {
      console.log('🔍 Querying ESG Intelligence API:', query);

      const response = await fetch(`${API_BASE_URL}/api/esg-intelligence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ ESG Intelligence API response received');
        console.log('   - Response time:', data.responseTime, 'ms');
        console.log('   - Cached:', data.cached);
        console.log('   - Content length:', data.response?.length || 0, 'characters');

        return {
          success: true,
          query: data.query,
          response: data.response,
          responseTime: data.responseTime,
          cached: data.cached,
          timestamp: data.timestamp,
          requestId: data.requestId,
          processingTime: data.processingTime,
          metadata: {
            source: 'backend_esg_intelligence',
            endpoint: '/api/esg-intelligence',
            note: 'Real data from Borouge ESG Intelligence backend'
          }
        };
      } else {
        throw new Error(data.error?.message || 'Backend returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ ESG Intelligence API error:', error.message);

      // Return service unavailable response instead of mock data
      return createErrorResponse(error.message, {
        originalError: error.message,
        endpoint: '/api/esg-intelligence'
      });
    }
  },

  /**
   * Get suggested queries from the backend
   * @returns {Promise<Object>} - List of suggested queries
   */
  getSuggestedQueries: async () => {
    try {
      console.log('📋 Fetching suggested queries...');

      const response = await fetch(`${API_BASE_URL}/api/suggested-queries`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ Suggested queries received:', data.suggestions?.length || 0);
        return {
          success: true,
          suggestions: data.suggestions || [],
          categories: data.categories || {},
          metadata: {
            source: 'backend_suggested_queries',
            endpoint: '/api/suggested-queries',
            note: 'Real data from Borouge ESG Intelligence backend'
          }
        };
      } else {
        throw new Error(data.error?.message || 'Backend returned unsuccessful response');
      }
    } catch (error) {
      console.error('❌ Suggested queries error:', error.message);

      // Return service unavailable response instead of fallback data
      return createErrorResponse(error.message, {
        originalError: error.message,
        endpoint: '/api/suggested-queries'
      });
    }
  },

  /**
   * Check the health of the ESG intelligence backend
   * @returns {Promise<Object>} - Health status
   */
  checkHealth: async () => {
    try {
      console.log('🏥 Checking backend health...');
      
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      console.log('✅ Backend health check successful');
      console.log('   - Status:', data.status);
      console.log('   - Database:', data.services?.database?.status);
      console.log('   - AI Engines:', Object.keys(data.services?.aiEngines?.configuration || {}).join(', '));
      
      return {
        success: true,
        ...data,
        metadata: {
          source: 'backend_health',
          endpoint: '/health',
          note: 'Direct health check from ESG intelligence backend'
        }
      };
    } catch (error) {
      console.error('❌ Backend health check failed:', error);
      
      return {
        success: false,
        error: error.message,
        status: 'unavailable',
        metadata: {
          source: 'backend_health_error',
          endpoint: '/health',
          note: 'Backend health check failed'
        }
      };
    }
  },

  /**
   * Test the connection to the backend
   * @returns {Promise<boolean>} - True if backend is reachable
   */
  testConnection: async () => {
    try {
      const health = await esgIntelligenceService.checkHealth();
      return health.success && health.status === 'healthy';
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      return false;
    }
  }
};

export default esgIntelligenceService;
