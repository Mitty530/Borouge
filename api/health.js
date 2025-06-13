// Vercel Serverless Function for Health Check
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
);

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only GET method is allowed'
      }
    });
  }

  const startTime = Date.now();

  try {
    // Test database connection
    const { data, error } = await supabase
      .from('esg_intelligence_cache')
      .select('count(*)')
      .limit(1);

    const dbResponseTime = Date.now() - startTime;

    if (error) {
      throw new Error(`Database connection failed: ${error.message}`);
    }

    res.status(200).json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0.0',
      environment: process.env.NODE_ENV || 'production',
      services: {
        database: {
          status: 'connected',
          responseTime: `${dbResponseTime}ms`
        },
        aiEngines: {
          gemini: {
            status: process.env.GEMINI_API_KEY ? 'configured' : 'not_configured'
          }
        },
        newsApi: {
          gnews: {
            status: process.env.GNEWS_API_KEY ? 'configured' : 'not_configured'
          }
        },
        esgIntelligence: {
          status: 'operational',
          features: ['query-processing', 'caching', 'analytics', 'gemini-optimized']
        }
      },
      serverless: true,
      platform: 'vercel'
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
      },
      serverless: true,
      platform: 'vercel'
    });
  }
};
