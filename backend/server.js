// Borouge ESG Intelligence Backend Server
// Production-ready Express.js API with comprehensive error handling and monitoring

const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();

// ============================================================================
// CONFIGURATION & ENVIRONMENT VARIABLES
// ============================================================================

const config = {
  // Server Configuration
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',

  // Supabase Configuration
  supabase: {
    url: process.env.VITE_SUPABASE_URL,
    anonKey: process.env.VITE_SUPABASE_ANON_KEY,
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY
  },

  // AI Engine Configuration
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: process.env.GROQ_MODEL || "llama3-8b-8192",
    baseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
    rateLimit: parseInt(process.env.GROQ_RATE_LIMIT) || 100
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY,
    baseUrl: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta",
    rateLimit: parseInt(process.env.GEMINI_RATE_LIMIT) || 900
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY
  },

  // News API Configuration
  news: {
    apiKey: process.env.NEWS_API_KEY,
    rateLimit: parseInt(process.env.NEWS_RATE_LIMIT) || 1000
  },

  // GNews API Configuration
  gnews: {
    apiKey: process.env.GNEWS_API_KEY,
    baseUrl: process.env.GNEWS_BASE_URL || "https://gnews.io/api/v4",
    rateLimit: parseInt(process.env.GNEWS_RATE_LIMIT) || 100,
    dailyLimit: parseInt(process.env.GNEWS_DAILY_LIMIT) || 100
  },

  // Cache Configuration
  cache: {
    ttlHours: parseInt(process.env.CACHE_TTL_HOURS) || 24,
    maxEntries: parseInt(process.env.MAX_CACHE_ENTRIES) || 1000
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'GROQ_API_KEY',
  'GEMINI_API_KEY',
  'GNEWS_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingEnvVars);
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.anonKey);

// Initialize ESG Intelligence Service
const ESGIntelligenceService = require('./services/esgIntelligenceService');
const esgService = new ESGIntelligenceService(config, supabase);

console.log('🔧 Configuration loaded successfully');
console.log(`📊 Environment: ${config.nodeEnv}`);
console.log(`🗄️  Database: ${config.supabase.url.substring(0, 30)}...`);
console.log('🤖 ESG Intelligence Service initialized');

// ============================================================================
// MIDDLEWARE CONFIGURATION
// ============================================================================

// CORS Configuration for frontend integration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',  // React development server
      'http://localhost:3001',  // Alternative React port
      'http://127.0.0.1:3000',  // Local IP variant
      'https://borouge-esg-frontend.vercel.app', // Production frontend (example)
    ];

    // In development, allow all localhost origins
    if (config.nodeEnv === 'development' && origin.includes('localhost')) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const userAgent = req.get('User-Agent') || 'Unknown';

  console.log(`📝 ${timestamp} | ${method} ${url} | ${userAgent.substring(0, 50)}`);

  // Add request start time for performance monitoring
  req.startTime = Date.now();
  next();
});

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  if (config.nodeEnv === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
});

// Rate limiting middleware (basic implementation)
const rateLimitStore = new Map();

const rateLimit = (windowMs = 60000, maxRequests = 100) => {
  return (req, res, next) => {
    const clientId = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old entries
    for (const [key, timestamps] of rateLimitStore.entries()) {
      rateLimitStore.set(key, timestamps.filter(time => time > windowStart));
      if (rateLimitStore.get(key).length === 0) {
        rateLimitStore.delete(key);
      }
    }

    // Check current client
    const clientRequests = rateLimitStore.get(clientId) || [];
    const recentRequests = clientRequests.filter(time => time > windowStart);

    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Maximum ${maxRequests} requests per minute.`,
        retryAfter: Math.ceil((recentRequests[0] + windowMs - now) / 1000)
      });
    }

    recentRequests.push(now);
    rateLimitStore.set(clientId, recentRequests);

    next();
  };
};

// Apply rate limiting to API routes
app.use('/api/', rateLimit(60000, 100)); // 100 requests per minute for API routes

// ============================================================================
// ERROR HANDLING MIDDLEWARE
// ============================================================================

// Custom error class for API errors
class APIError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'APIError';
  }
}

// Async error handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  const requestDuration = Date.now() - req.startTime;

  // Log error details
  console.error(`❌ Error in ${req.method} ${req.url} (${requestDuration}ms):`);
  console.error(`   Message: ${err.message}`);
  console.error(`   Stack: ${err.stack}`);

  // Default error response
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'Internal server error';

  // Handle different error types
  if (err instanceof APIError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = err.message;
  } else if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_ID';
    message = 'Invalid ID format';
  } else if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'Duplicate entry';
  } else if (err.message.includes('CORS')) {
    statusCode = 403;
    code = 'CORS_ERROR';
    message = 'CORS policy violation';
  }

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      code,
      message,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown'
    }
  };

  // Add stack trace in development
  if (config.nodeEnv === 'development') {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = {
      method: req.method,
      url: req.url,
      duration: requestDuration
    };
  }

  // Track error in analytics
  trackError(err, req).catch(console.error);

  res.status(statusCode).json(errorResponse);
};

// 404 handler for undefined routes
const notFoundHandler = (req, res) => {
  const requestDuration = Date.now() - req.startTime;

  console.warn(`🔍 404 Not Found: ${req.method} ${req.url} (${requestDuration}ms)`);

  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.url} not found`,
      timestamp: new Date().toISOString(),
      availableRoutes: [
        'GET /health',
        'GET /api/suggested-queries',
        'POST /api/esg-intelligence',
        'POST /api/esg-smart-search',
        'GET /api/news/health',
        'GET /api/news/recent',
        'GET /api/analytics/search',
        'GET /api/analytics/articles',
        'GET /api/performance-report'
      ]
    }
  });
};

// Error tracking function
async function trackError(error, req) {
  try {
    await supabase
      .from('esg_query_analytics')
      .insert({
        query: `ERROR: ${req.url}`,
        query_type: 'error',
        response_time_ms: Date.now() - req.startTime,
        sources_found: 0,
        user_rating: null,
        created_at: new Date().toISOString()
      });
  } catch (trackingError) {
    console.error('Failed to track error:', trackingError);
  }
}

// ============================================================================
// BASIC ROUTES & HEALTH CHECKS
// ============================================================================

// Enhanced health check endpoint with ESG service status
app.get('/health', asyncHandler(async (req, res) => {
  const startTime = Date.now();

  try {
    // Get comprehensive health status from ESG service
    const esgHealth = await esgService.getHealthStatus();
    const dbResponseTime = Date.now() - startTime;

    res.json({
      success: true,
      status: esgHealth.status,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: config.nodeEnv,
      services: {
        database: {
          status: 'connected',
          responseTime: `${dbResponseTime}ms`
        },
        cache: esgHealth.services.cache,
        aiEngines: esgHealth.services.aiEngines,
        esgIntelligence: {
          status: 'operational',
          features: ['query-processing', 'caching', 'analytics', 'multi-ai-failover']
        }
      },
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Health check failed',
        details: error.message
      }
    });
  }
}));

// API status endpoint
app.get('/api/status', asyncHandler(async (req, res) => {
  const { data: cacheStats } = await supabase
    .from('esg_intelligence_cache')
    .select('count(*), sum(hit_count)')
    .single();

  const { data: queryStats } = await supabase
    .from('esg_query_analytics')
    .select('count(*)')
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .single();

  res.json({
    success: true,
    api: {
      version: '1.0.0',
      status: 'operational',
      endpoints: {
        health: '/health',
        esgIntelligence: '/api/esg-intelligence',
        esgSmartSearch: '/api/esg-smart-search',
        suggestedQueries: '/api/suggested-queries',
        performanceReport: '/api/performance-report',
        newsHealth: '/api/news/health',
        recentArticles: '/api/news/recent',
        searchAnalytics: '/api/analytics/search',
        articleAnalytics: '/api/analytics/articles'
      }
    },
    statistics: {
      cacheEntries: cacheStats?.count || 0,
      cacheHits: cacheStats?.sum || 0,
      queriesLast24h: queryStats?.count || 0
    },
    timestamp: new Date().toISOString()
  });
}));

// ============================================================================
// MAIN ESG INTELLIGENCE ENDPOINT
// ============================================================================

// Main ESG Intelligence processing endpoint
app.post('/api/esg-intelligence', asyncHandler(async (req, res) => {
  const { query } = req.body;

  // Validate request
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new APIError('Query is required and must be a non-empty string', 400, 'INVALID_QUERY');
  }

  if (query.length > 1000) {
    throw new APIError('Query too long. Maximum 1000 characters allowed', 400, 'QUERY_TOO_LONG');
  }

  console.log(`🔍 ESG Intelligence Request: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);

  try {
    // Process the ESG intelligence query
    const result = await esgService.processQuery(query);

    // Add request metadata
    result.requestId = req.headers['x-request-id'] || 'unknown';
    result.processingTime = Date.now() - req.startTime;

    console.log(`✅ ESG Intelligence Response processed (${result.processingTime}ms)`);

    res.json(result);

  } catch (error) {
    console.error('ESG Intelligence processing failed:', error);

    // Provide user-friendly error messages
    if (error.message.includes('rate limit')) {
      throw new APIError('Service temporarily unavailable due to high demand. Please try again in a few minutes.', 429, 'RATE_LIMIT_EXCEEDED');
    } else if (error.message.includes('AI providers failed')) {
      throw new APIError('AI analysis services are temporarily unavailable. Please try again later.', 503, 'AI_SERVICE_UNAVAILABLE');
    } else {
      throw new APIError('Failed to process ESG intelligence query. Please try again.', 500, 'PROCESSING_ERROR');
    }
  }
}));

// Suggested queries endpoint (enhanced with real-time data)
app.get('/api/suggested-queries', asyncHandler(async (req, res) => {
  const { data, error } = await supabase
    .from('esg_popular_queries')
    .select('query, category, count')
    .order('count', { ascending: false })
    .limit(8);

  if (error) {
    throw new APIError('Failed to fetch suggested queries', 500, 'DATABASE_ERROR');
  }

  res.json({
    success: true,
    suggestions: data.map(item => item.query),
    categories: data.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item.query);
      return acc;
    }, {}),
    timestamp: new Date().toISOString()
  });
}));

// Performance report endpoint
app.get('/api/performance-report', asyncHandler(async (req, res) => {
  const { data, error } = await supabase.rpc('generate_performance_report');

  if (error) {
    throw new APIError('Failed to generate performance report', 500, 'DATABASE_ERROR');
  }

  res.json({
    success: true,
    report: data,
    timestamp: new Date().toISOString()
  });
}));

// ============================================================================
// ESG SMART SEARCH ENDPOINTS
// ============================================================================

// NEW: ESG Smart Search endpoint with news intelligence
app.post('/api/esg-smart-search', asyncHandler(async (req, res) => {
  const { query } = req.body;

  // Validate request
  if (!query || typeof query !== 'string' || query.trim().length === 0) {
    throw new APIError('Query is required and must be a non-empty string', 400, 'INVALID_QUERY');
  }

  if (query.length > 1000) {
    throw new APIError('Query too long. Maximum 1000 characters allowed', 400, 'QUERY_TOO_LONG');
  }

  console.log(`🔍 ESG Smart Search Request: "${query.substring(0, 100)}${query.length > 100 ? '...' : ''}"`);

  try {
    // Process the smart search query with multi-source news search
    const result = await esgService.processSmartSearchWithMultiSource(query);

    // Add request metadata
    result.requestId = req.headers['x-request-id'] || 'unknown';
    result.processingTime = Date.now() - req.startTime;

    console.log(`✅ Smart Search Response processed (${result.processingTime}ms)`);

    res.json(result);

  } catch (error) {
    console.error('Smart Search processing failed:', error);

    // Provide user-friendly error messages
    if (error.message.includes('quota exceeded')) {
      throw new APIError('News API daily quota exceeded. Please try again tomorrow.', 429, 'QUOTA_EXCEEDED');
    } else if (error.message.includes('News search failed')) {
      throw new APIError('News search service temporarily unavailable. Please try again later.', 503, 'NEWS_SERVICE_UNAVAILABLE');
    } else {
      throw new APIError('Failed to process smart search query. Please try again.', 500, 'PROCESSING_ERROR');
    }
  }
}));

// NEW: News service health endpoint
app.get('/api/news/health', asyncHandler(async (req, res) => {
  const healthStatus = await esgService.newsService.getHealthStatus();

  res.json({
    success: true,
    ...healthStatus,
    timestamp: new Date().toISOString()
  });
}));

// NEW: Recent articles endpoint
app.get('/api/news/recent', asyncHandler(async (req, res) => {
  const { limit = 10, impact_level } = req.query;

  // Validate parameters
  const parsedLimit = parseInt(limit);
  if (isNaN(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
    throw new APIError('Limit must be a number between 1 and 50', 400, 'INVALID_LIMIT');
  }

  if (impact_level && !['HIGH', 'MEDIUM', 'LOW', 'OPPORTUNITY'].includes(impact_level)) {
    throw new APIError('Impact level must be HIGH, MEDIUM, LOW, or OPPORTUNITY', 400, 'INVALID_IMPACT_LEVEL');
  }

  const articles = await esgService.newsService.getRecentArticles(parsedLimit, impact_level);

  res.json({
    success: true,
    articles: articles,
    count: articles.length,
    filters: {
      limit: parsedLimit,
      impact_level: impact_level || 'all'
    },
    timestamp: new Date().toISOString()
  });
}));

// NEW: Search analytics endpoint
app.get('/api/analytics/search', asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;

  // Validate parameters
  const parsedDays = parseInt(days);
  if (isNaN(parsedDays) || parsedDays < 1 || parsedDays > 30) {
    throw new APIError('Days must be a number between 1 and 30', 400, 'INVALID_DAYS');
  }

  const analytics = await esgService.queryEnhancementService.getSearchAnalytics(parsedDays);

  res.json({
    success: true,
    analytics: analytics,
    period: `${parsedDays} days`,
    timestamp: new Date().toISOString()
  });
}));

// NEW: Article analysis analytics endpoint
app.get('/api/analytics/articles', asyncHandler(async (req, res) => {
  const { days = 7 } = req.query;

  // Validate parameters
  const parsedDays = parseInt(days);
  if (isNaN(parsedDays) || parsedDays < 1 || parsedDays > 30) {
    throw new APIError('Days must be a number between 1 and 30', 400, 'INVALID_DAYS');
  }

  const analytics = await esgService.articleAnalysisService.getAnalysisAnalytics(parsedDays);

  res.json({
    success: true,
    analytics: analytics,
    period: `${parsedDays} days`,
    timestamp: new Date().toISOString()
  });
}));

// ============================================================================
// ADVANCED AI MONITORING ENDPOINTS
// ============================================================================

// AI Provider statistics and health monitoring
app.get('/api/ai-providers/stats', asyncHandler(async (req, res) => {
  const stats = esgService.aiService.getProviderStatistics();
  const healthSummary = esgService.aiService.getProviderHealthSummary();
  const recommendations = esgService.aiService.getOptimizationRecommendations();

  res.json({
    success: true,
    providers: stats,
    healthSummary,
    recommendations,
    timestamp: new Date().toISOString()
  });
}));

// AI Provider optimization recommendations
app.get('/api/ai-providers/recommendations', asyncHandler(async (req, res) => {
  const recommendations = esgService.aiService.getOptimizationRecommendations();

  res.json({
    success: true,
    recommendations,
    count: recommendations.length,
    timestamp: new Date().toISOString()
  });
}));

// AI Provider health check
app.get('/api/ai-providers/health', asyncHandler(async (req, res) => {
  const healthSummary = esgService.aiService.getProviderHealthSummary();
  const stats = esgService.aiService.getProviderStatistics();

  // Calculate overall system health
  const overallHealth = {
    status: healthSummary.overallStatus,
    providersTotal: healthSummary.total,
    providersHealthy: healthSummary.healthy,
    providersDegraded: healthSummary.degraded,
    providersCritical: healthSummary.critical,
    healthPercentage: Math.round((healthSummary.healthy / healthSummary.total) * 100)
  };

  res.json({
    success: true,
    health: overallHealth,
    providers: Object.keys(stats).map(provider => ({
      name: provider,
      status: stats[provider].health.status,
      availability: stats[provider].health.availability,
      responseTime: stats[provider].health.responseTime,
      qualityScore: stats[provider].health.qualityScore,
      circuitBreakerState: stats[provider].circuitBreaker.state
    })),
    timestamp: new Date().toISOString()
  });
}));

// ============================================================================
// MIDDLEWARE REGISTRATION & SERVER STARTUP
// ============================================================================

// Register error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection:', reason);
  console.error('   Promise:', promise);
  // Don't exit in production, just log
  if (config.nodeEnv !== 'production') {
    process.exit(1);
  }
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
const server = app.listen(config.port, () => {
  console.log('🚀 Borouge ESG Intelligence API Server Started');
  console.log('='.repeat(50));
  console.log(`📍 Server running on port ${config.port}`);
  console.log(`🌐 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Health check: http://localhost:${config.port}/health`);
  console.log(`🔗 API status: http://localhost:${config.port}/api/status`);
  console.log(`🔗 Frontend should connect to: http://localhost:${config.port}/api/esg-intelligence`);
  console.log('='.repeat(50));

  // Log configuration summary
  console.log('📊 Configuration Summary:');
  console.log(`   Database: ${config.supabase.url.substring(0, 30)}...`);
  console.log(`   Cache TTL: ${config.cache.ttlHours} hours`);
  console.log(`   Rate Limit: 100 requests/minute`);
  console.log(`   AI Engines: ${Object.keys(config).filter(k => ['groq', 'gemini', 'openai'].includes(k) && config[k].apiKey).join(', ')}`);
  console.log('='.repeat(50));
});

// Export for testing
module.exports = { app, server, config, supabase, APIError, asyncHandler };
