// Simple test endpoint to check environment variables
export default function handler(req, res) {
  try {
    const envStatus = {
      NODE_ENV: process.env.NODE_ENV || 'not_set',
      VERCEL: process.env.VERCEL || 'not_set',
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'SET' : 'NOT_SET',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'SET' : 'NOT_SET',
      GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'SET' : 'NOT_SET',
      GNEWS_API_KEY: process.env.GNEWS_API_KEY ? 'SET' : 'NOT_SET'
    };

    res.status(200).json({
      success: true,
      message: 'Environment test endpoint',
      environment: envStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    });
  }
}
