// Simple test function to debug Vercel deployment issues
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

  try {
    // Test environment variables
    const envVars = {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT_SET',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'SET' : 'NOT_SET',
      GNEWS_API_KEY: process.env.GNEWS_API_KEY ? 'SET' : 'NOT_SET'
    };

    // Test fetch availability
    const fetchAvailable = typeof fetch !== 'undefined' || typeof globalThis.fetch !== 'undefined';
    
    // Test node-fetch import
    let nodeFetchAvailable = false;
    try {
      require('node-fetch');
      nodeFetchAvailable = true;
    } catch (e) {
      nodeFetchAvailable = false;
    }

    res.status(200).json({
      success: true,
      message: 'Test endpoint working',
      timestamp: new Date().toISOString(),
      environment: envVars,
      fetch: {
        builtin: fetchAvailable,
        nodeFetch: nodeFetchAvailable
      },
      nodeVersion: process.version,
      platform: process.platform
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: error.message,
        stack: error.stack
      },
      timestamp: new Date().toISOString()
    });
  }
};
