// Debug endpoint to check environment variables
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Only GET method is allowed'
    });
  }

  try {
    const envCheck = {
      success: true,
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL: process.env.VERCEL,
        VERCEL_ENV: process.env.VERCEL_ENV
      },
      apis: {
        gemini: {
          hasApiKey: !!process.env.GEMINI_API_KEY,
          keyLength: process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0,
          baseUrl: process.env.GEMINI_BASE_URL || 'not set'
        },
        gnews: {
          hasApiKey: !!process.env.GNEWS_API_KEY,
          keyLength: process.env.GNEWS_API_KEY ? process.env.GNEWS_API_KEY.length : 0,
          baseUrl: process.env.GNEWS_BASE_URL || 'not set'
        },
        supabase: {
          hasUrl: !!process.env.VITE_SUPABASE_URL,
          hasKey: !!process.env.VITE_SUPABASE_ANON_KEY,
          url: process.env.VITE_SUPABASE_URL || 'not set'
        }
      }
    };

    res.status(200).json(envCheck);

  } catch (error) {
    console.error('Debug endpoint error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to check environment',
        timestamp: new Date().toISOString()
      }
    });
  }
};
